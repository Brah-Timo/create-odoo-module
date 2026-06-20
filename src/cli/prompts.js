'use strict';

const chalk = require('chalk');

/**
 * Interactive CLI prompts using Inquirer.js
 * Runs when user calls `npx create-odoo-module` without sufficient flags.
 */
async function askInteractiveQuestions(moduleName, existingOptions = {}) {
  // Inquirer v9+ is ESM — dynamic import required
  const { default: inquirer } = await import('inquirer');

  const questions = [];

  // ── Module name ────────────────────────────────────────────────────────────
  if (!moduleName) {
    questions.push({
      type: 'input',
      name: 'moduleName',
      message: chalk.cyan('Module name') + chalk.dim(' (e.g. fleet-manager):'),
      validate: (input) => {
        if (!input.trim()) return 'Module name is required';
        if (!/^[a-z][a-z0-9_-]*$/.test(input.trim())) {
          return 'Use lowercase letters, numbers, hyphens or underscores only';
        }
        return true;
      },
      filter: (input) => input.trim().toLowerCase(),
    });
  }

  // ── Odoo version ───────────────────────────────────────────────────────────
  questions.push({
    type: 'list',
    name: 'odooVersion',
    message: chalk.cyan('Odoo version:'),
    choices: [
      { name: '18.0  (latest)', value: '18' },
      { name: '17.0  (stable) ← recommended', value: '17' },
      { name: '16.0  (LTS)',   value: '16' },
    ],
    default: '17',
    when: !existingOptions.odooVersion,
  });

  // ── Features to include ────────────────────────────────────────────────────
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: chalk.cyan('Select features to include:'),
    choices: [
      {
        name: `${chalk.bold('REST API')}           ${chalk.dim('GET/POST/PUT/DELETE endpoints')}`,
        value: 'withApi',
        checked: false,
      },
      {
        name: `${chalk.bold('Flutter App')}        ${chalk.dim('Mobile app with login + CRUD')}`,
        value: 'withUi',
        checked: false,
      },
      {
        name: `${chalk.bold('Unit Tests')}         ${chalk.dim('Python pytest + Dart flutter_test')}`,
        value: 'withTests',
        checked: false,
      },
      {
        name: `${chalk.bold('QWeb Reports')}       ${chalk.dim('PDF report template')}`,
        value: 'withReports',
        checked: false,
      },
      {
        name: `${chalk.bold('OWL Components')}     ${chalk.dim('JavaScript UI widgets')}`,
        value: 'withOwl',
        checked: false,
      },
      {
        name: `${chalk.bold('Wizard')}             ${chalk.dim('Transient model dialog')}`,
        value: 'withWizard',
        checked: false,
      },
      {
        name: `${chalk.bold('Docker Compose')}     ${chalk.dim('Local Odoo dev environment')}`,
        value: 'withDocker',
        checked: true,
      },
      {
        name: `${chalk.bold('GitHub Actions CI')}  ${chalk.dim('Automated testing pipeline')}`,
        value: 'withCi',
        checked: false,
      },
    ],
  });

  // ── Author info ────────────────────────────────────────────────────────────
  questions.push(
    {
      type: 'input',
      name: 'author',
      message: chalk.cyan('Author / Company name:'),
      default: existingOptions.author || 'Your Company',
    },
    {
      type: 'input',
      name: 'category',
      message: chalk.cyan('Odoo app category:'),
      default: existingOptions.category || 'Custom',
      choices: ['Custom', 'Accounting', 'CRM', 'Human Resources', 'Inventory', 'Manufacturing', 'Sales', 'Website'],
    }
  );

  // ── Server URL (for .env pre-fill) ────────────────────────────────────────
  questions.push({
    type: 'input',
    name: 'odooUrl',
    message: chalk.cyan('Odoo server URL') + chalk.dim(' (for .env):'),
    default: 'http://localhost:8069',
  });

  questions.push({
    type: 'input',
    name: 'odooDb',
    message: chalk.cyan('Odoo database name') + chalk.dim(' (for .env):'),
    default: 'odoo',
  });

  // ─────────────────────────────────────────────────────────────────────────
  const answers = await inquirer.prompt(questions);

  // Flatten features array into boolean flags
  const features = answers.features || [];

  return {
    moduleName:   answers.moduleName  || moduleName,
    odooVersion:  answers.odooVersion || existingOptions.odooVersion || '17',
    author:       answers.author      || existingOptions.author,
    category:     answers.category    || existingOptions.category,
    odooUrl:      answers.odooUrl     || 'http://localhost:8069',
    odooDb:       answers.odooDb      || 'odoo',
    withApi:      features.includes('withApi')     || !!existingOptions.withApi,
    withUi:       features.includes('withUi')      || !!existingOptions.withUi,
    withTests:    features.includes('withTests')   || !!existingOptions.withTests,
    withReports:  features.includes('withReports') || !!existingOptions.withReports,
    withOwl:      features.includes('withOwl')     || !!existingOptions.withOwl,
    withWizard:   features.includes('withWizard')  || !!existingOptions.withWizard,
    withDocker:   features.includes('withDocker')  !== false,
    withCi:       features.includes('withCi')      || !!existingOptions.withCi,
  };
}

module.exports = { askInteractiveQuestions };
