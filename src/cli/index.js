'use strict';

const path    = require('path');
const chalk   = require('chalk');
const fs      = require('fs-extra');
const ora     = require('ora');
const boxen   = require('boxen');
const figures = require('figures');

const { askInteractiveQuestions } = require('./prompts');
const { validateModuleName }      = require('./validator');
const { parseExtraDepends }       = require('./args-parser');
const { verifyProLicense }        = require('../utils/license-check');
const { generateOdooModule }      = require('../generators/odoo-generator');
const { generateFlutterApp }      = require('../generators/flutter-generator');
const { generateApiLayer }        = require('../generators/api-generator');
const { generateUiLayer }         = require('../generators/ui-generator');
const { generateDeployScripts }   = require('../generators/deploy-generator');
const { toSnakeCase, toPascalCase, toKebabCase } = require('../utils/string-utils');
const logger  = require('../utils/logger');

// ─── List templates ───────────────────────────────────────────────────────────
function listTemplates() {
  const templates = [
    { name: 'fleet',     label: 'Fleet Management',   free: false, desc: 'Vehicle tracking, maintenance, fuel logs' },
    { name: 'hr',        label: 'Human Resources',    free: false, desc: 'Employees, contracts, payroll, leaves' },
    { name: 'inventory', label: 'Inventory',          free: false, desc: 'Products, lots, barcode scanner, moves' },
    { name: 'pos',       label: 'Point of Sale',      free: false, desc: 'POS extension with custom payment methods' },
    { name: 'crm',       label: 'CRM Pipeline',       free: false, desc: 'Leads, pipeline, activities, dashboard' },
  ];

  console.log(chalk.bold('\n  Available Templates:\n'));
  templates.forEach(t => {
    const badge = t.free ? chalk.green('[FREE]') : chalk.yellow('[PRO] ');
    console.log(`  ${badge}  ${chalk.cyan(t.name.padEnd(12))} ${chalk.bold(t.label)}`);
    console.log(`           ${chalk.dim(t.desc)}\n`);
  });
  console.log(chalk.dim('  Get Pro access → https://create-odoo-module.dev/pro\n'));
}

// ─── Main CLI runner ──────────────────────────────────────────────────────────
async function runCLI(moduleName, options) {
  logger.setVerbose(!!options.verbose);

  // ── 1. Interactive mode when no module name given ─────────────────────────
  if (!moduleName) {
    if (options.interactive === false) {
      logger.error('Module name is required when using --no-interactive');
      process.exit(1);
    }
    const answers = await askInteractiveQuestions(null, options);
    moduleName = answers.moduleName;
    options = { ...options, ...answers };
  }

  // ── 2. Validate module name ───────────────────────────────────────────────
  const validation = validateModuleName(moduleName);
  if (!validation.valid) {
    logger.error(`Invalid module name: ${validation.error}`);
    logger.info('Module names must be lowercase with hyphens or underscores (e.g. fleet-manager)');
    process.exit(1);
  }

  // ── 3. Gather remaining options interactively if needed ───────────────────
  let config = buildConfig(moduleName, options);

  if (options.interactive !== false && !hasMinimalFlags(options)) {
    const answers = await askInteractiveQuestions(moduleName, options);
    config = buildConfig(moduleName, { ...options, ...answers });
  }

  // ── 4. Pro license verification ───────────────────────────────────────────
  if (config.proKey || config.template) {
    logger.verbose('Verifying Pro license...');
    const isValid = await verifyProLicense(config.proKey);
    if (!isValid && config.template) {
      logger.warn(`Template "${config.template}" requires a Pro license.`);
      logger.info('Get Pro access → https://create-odoo-module.dev/pro');
      config.template = null;
    }
  }

  // ── 5. Target directory ───────────────────────────────────────────────────
  const targetDir = path.resolve(process.cwd(), toKebabCase(moduleName));

  if (await fs.pathExists(targetDir)) {
    const { default: inquirer } = await import('inquirer');
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: chalk.yellow(`Directory ${chalk.bold(toKebabCase(moduleName))} already exists. Overwrite?`),
      default: false,
    }]);
    if (!overwrite) {
      logger.info('Aborted.');
      process.exit(0);
    }
    await fs.remove(targetDir);
  }

  // ── 6. Start generation ───────────────────────────────────────────────────
  console.log();
  logger.info(`Creating Odoo module: ${chalk.bold.cyan(config.moduleName)}`);
  logger.info(`Target: ${chalk.dim(targetDir)}`);
  console.log();

  const steps = buildSteps(config);
  let stepIndex = 0;

  const spinner = ora({
    spinner: 'dots2',
    color: 'magenta',
  });

  try {
    // Step: Odoo module
    spinner.start(chalk.bold('Generating Odoo module...'));
    await generateOdooModule(targetDir, config);
    spinner.succeed(chalk.green(`${figures.tick} Odoo module`) + chalk.dim(` → odoo_module/`));

    // Step: REST API
    if (config.withApi) {
      spinner.start(chalk.bold('Generating REST API controllers...'));
      await generateApiLayer(targetDir, config);
      spinner.succeed(chalk.green(`${figures.tick} REST API layer`) + chalk.dim(` → odoo_module/controllers/`));
    }

    // Step: XML Views & OWL
    spinner.start(chalk.bold('Generating Odoo views...'));
    await generateUiLayer(targetDir, config);
    spinner.succeed(chalk.green(`${figures.tick} Odoo views`) + chalk.dim(` → odoo_module/views/`));

    // Step: Flutter app
    if (config.withUi) {
      spinner.start(chalk.bold('Generating Flutter application...'));
      await generateFlutterApp(targetDir, config);
      spinner.succeed(chalk.green(`${figures.tick} Flutter app`) + chalk.dim(` → flutter_app/`));
    }

    // Step: Deploy scripts
    spinner.start(chalk.bold('Generating deploy scripts...'));
    await generateDeployScripts(targetDir, config);
    spinner.succeed(chalk.green(`${figures.tick} Deploy scripts`) + chalk.dim(` → scripts/`));

    // Step: Git init
    if (options.git !== false) {
      spinner.start(chalk.bold('Initializing git repository...'));
      await initGitRepo(targetDir);
      spinner.succeed(chalk.green(`${figures.tick} Git initialized`));
    }

    console.log();
    printSuccessMessage(config, targetDir);

  } catch (err) {
    spinner.fail(chalk.red(`Generation failed: ${err.message}`));
    logger.verbose(err.stack);
    await fs.remove(targetDir).catch(() => {});
    process.exit(1);
  }
}

// ─── Build config object ──────────────────────────────────────────────────────
function buildConfig(moduleName, options) {
  const snake    = toSnakeCase(moduleName);
  const pascal   = toPascalCase(moduleName);
  const kebab    = toKebabCase(moduleName);
  const odooModel = snake.replace(/_/g, '.');

  return {
    // Names
    moduleName,
    moduleNameSnake:  snake,
    moduleNamePascal: pascal,
    moduleNameKebab:  kebab,
    moduleNameOdoo:   odooModel,      // e.g. fleet.manager
    moduleNameClass:  pascal,         // e.g. FleetManager
    moduleNameLabel:  pascal.replace(/([A-Z])/g, ' $1').trim(), // Fleet Manager

    // Odoo config
    odooVersion:  options.odooVersion || '17',
    category:     options.category    || 'Custom',
    author:       options.author      || 'Your Company',
    website:      options.website     || 'https://yourcompany.com',
    extraDepends: parseExtraDepends(options.depends || ''),

    // Feature flags
    withApi:     !!options.withApi,
    withUi:      !!options.withUi,
    withTests:   !!options.withTests,
    withReports: !!options.withReports,
    withOwl:     !!options.withOwl,
    withWizard:  !!options.withWizard,
    withDocker:  options.withDocker !== false,
    withCi:      !!options.withCi,

    // Pro
    proKey:   options.proKey   || null,
    template: options.template || null,

    // Meta
    year: new Date().getFullYear(),
    generatedAt: new Date().toISOString(),
  };
}

function hasMinimalFlags(options) {
  return options.withApi || options.withUi || options.withTests ||
         options.template || options.interactive === false;
}

function buildSteps(config) {
  const steps = ['Odoo Module', 'XML Views'];
  if (config.withApi)     steps.push('REST API');
  if (config.withUi)      steps.push('Flutter App');
  if (config.withReports) steps.push('QWeb Reports');
  steps.push('Deploy Scripts', 'Git Init');
  return steps;
}

// ─── Git init ─────────────────────────────────────────────────────────────────
async function initGitRepo(dir) {
  const { execa } = require('execa');
  try {
    await execa('git', ['init'], { cwd: dir });
    await execa('git', ['add', '-A'], { cwd: dir });
    await execa('git', ['commit', '--allow-empty', '-m', 'chore: initial commit from create-odoo-module'], { cwd: dir });
  } catch (_) {
    // git may not be installed — not fatal
  }
}

// ─── Success message ──────────────────────────────────────────────────────────
function printSuccessMessage(config, targetDir) {
  const dirName = path.basename(targetDir);

  const lines = [
    chalk.green.bold(`${figures.tick} Your Odoo project is ready!`),
    '',
    chalk.bold('Get started:'),
    `  ${chalk.cyan(`cd ${dirName}`)}`,
    `  ${chalk.cyan('cp .env.example .env')}   ${chalk.dim('← add your credentials')}`,
    config.withDocker
      ? `  ${chalk.cyan('npm run dev')}            ${chalk.dim('← start local Odoo via Docker')}`
      : '',
    `  ${chalk.cyan('npm run deploy')}         ${chalk.dim('← upload module to Odoo')}`,
    config.withUi
      ? `  ${chalk.cyan('npm run flutter:run')}    ${chalk.dim('← start Flutter app')}`
      : '',
    '',
    chalk.bold('What was generated:'),
    `  ${chalk.yellow('odoo_module/')}  Full Odoo Python module`,
    config.withApi     ? `  ${chalk.yellow('controllers/')}  REST API (GET/POST/PUT/DELETE)` : '',
    config.withUi      ? `  ${chalk.yellow('flutter_app/')}  Production-ready Flutter app` : '',
    config.withReports ? `  ${chalk.yellow('report/')}       QWeb PDF reports` : '',
    `  ${chalk.yellow('scripts/')}      Deploy + Docker Compose`,
    '',
    `${chalk.dim('Docs:')}  https://create-odoo-module.dev/docs`,
    `${chalk.dim('Pro:')}   https://create-odoo-module.dev/pro`,
  ].filter(l => l !== '');

  console.log(
    boxen(lines.join('\n'), {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'green',
    })
  );
}

module.exports = { runCLI, listTemplates };
