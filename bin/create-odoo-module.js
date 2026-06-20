#!/usr/bin/env node

'use strict';

// ─── Node version check ───────────────────────────────────────────────────────
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(
    `\n  ✗  create-odoo-module requires Node.js 18 or higher.\n` +
    `     Current version: ${process.version}\n` +
    `     Download: https://nodejs.org\n`
  );
  process.exit(1);
}

// ─── Imports ─────────────────────────────────────────────────────────────────
const { Command } = require('commander');
const chalk       = require('chalk');
const gradient    = require('gradient-string');
const boxen       = require('boxen');
const { updateNotifier } = require('update-notifier');
const pkg         = require('../package.json');
const { runCLI }  = require('../src/cli/index');

// ─── Update notifier (non-blocking) ─────────────────────────────────────────
try {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 });
  if (notifier.update) {
    console.log(
      boxen(
        chalk.yellow('Update available!') +
        `  ${chalk.dim(pkg.version)} → ${chalk.green(notifier.update.latest)}\n` +
        chalk.cyan(`npm install -g ${pkg.name}@latest`),
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }
      )
    );
  }
} catch (_) { /* update-notifier is optional */ }

// ─── Banner ───────────────────────────────────────────────────────────────────
const banner = gradient(['#875A7B', '#00A09D'])(
  `
  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
 ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
 ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
 ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
 ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝`
);

console.log(banner);
console.log(
  boxen(
    chalk.bold.white('create-odoo-module') +
    chalk.dim(` v${pkg.version}`) + '\n' +
    chalk.cyan('Next.js for Odoo') +
    chalk.dim(' — One command. Full-stack ERP + Flutter app.'),
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: '#875A7B',
      textAlignment: 'center'
    }
  )
);

// ─── CLI Program ──────────────────────────────────────────────────────────────
const program = new Command();

program
  .name('create-odoo-module')
  .description('Generate a full Odoo module + Flutter app in seconds')
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// ─── Main command: create ─────────────────────────────────────────────────────
program
  .argument('[module-name]', 'Name of your Odoo module (e.g. fleet-manager)')
  .option('--with-api',            'Include REST API controllers',            false)
  .option('--with-ui',             'Include Flutter mobile app',              false)
  .option('--with-tests',          'Include Python + Dart test files',        false)
  .option('--with-reports',        'Include QWeb PDF reports',                false)
  .option('--with-owl',            'Include OWL JavaScript components',       false)
  .option('--with-wizard',         'Include wizard (transient model)',        false)
  .option('--with-docker',         'Include Docker Compose dev environment',  true)
  .option('--with-ci',             'Include GitHub Actions CI/CD pipeline',   false)
  .option('--odoo-version <ver>',  'Target Odoo version (16 | 17 | 18)',      '17')
  .option('--template <name>',     'Use a Pro template (fleet/hr/inventory/pos/crm)')
  .option('--pro-key <key>',       'Pro license key for premium templates')
  .option('--author <name>',       'Module author name',                      'Your Company')
  .option('--website <url>',       'Author website',                          'https://yourcompany.com')
  .option('--category <cat>',      'Odoo app category',                       'Custom')
  .option('--depends <modules>',   'Extra Odoo depends (comma separated)',    '')
  .option('--no-interactive',      'Skip all interactive prompts (use flags only)')
  .option('--no-git',              'Skip git init in generated project')
  .option('--verbose',             'Show verbose output',                     false)
  .addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.cyan('$ npx create-odoo-module')}
  ${chalk.cyan('$ npx create-odoo-module fleet-manager')}
  ${chalk.cyan('$ npx create-odoo-module fleet-manager --with-api --with-ui')}
  ${chalk.cyan('$ npx create-odoo-module hospital --with-api --with-ui --with-tests --odoo-version 18')}
  ${chalk.cyan('$ npx create-odoo-module pos-extend --template pos --pro-key YOUR_KEY')}

${chalk.bold('Pro Templates:')}
  ${chalk.yellow('fleet')}      Fleet Management with vehicle tracking
  ${chalk.yellow('hr')}         Human Resources with payroll
  ${chalk.yellow('inventory')}  Inventory with barcode scanner
  ${chalk.yellow('pos')}        Point of Sale extension
  ${chalk.yellow('crm')}        CRM with pipeline dashboard

${chalk.bold('Documentation:')}
  ${chalk.underline('https://create-odoo-module.dev/docs')}
  `)
  .action(async (moduleName, options) => {
    try {
      await runCLI(moduleName, options);
    } catch (err) {
      if (options.verbose) {
        console.error(chalk.red('\n✗ Fatal error:'), err);
      } else {
        console.error(chalk.red(`\n✗ ${err.message}`));
        console.error(chalk.dim('  Run with --verbose for full error details'));
      }
      process.exit(1);
    }
  });

// ─── list command ─────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all available Pro templates')
  .action(() => {
    const { listTemplates } = require('../src/cli/index');
    listTemplates();
  });

// ─── upgrade command ──────────────────────────────────────────────────────────
program
  .command('upgrade <module-path>')
  .description('Upgrade an existing create-odoo-module project')
  .action(async (modulePath) => {
    console.log(chalk.yellow(`\n⚠  upgrade command coming in v1.1.0\n`));
  });

program.parse(process.argv);
