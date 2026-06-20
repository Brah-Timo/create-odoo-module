'use strict';

const chalk   = require('chalk');
const figures = require('figures');

let verboseMode = false;

const logger = {
  setVerbose(v) { verboseMode = v; },
  isVerbose()  { return verboseMode; },

  info   (msg) { console.log(`  ${chalk.cyan(figures.info)}  ${msg}`); },
  success(msg) { console.log(`  ${chalk.green(figures.tick)}  ${msg}`); },
  warn   (msg) { console.warn(`  ${chalk.yellow(figures.warning)}  ${chalk.yellow(msg)}`); },
  error  (msg) { console.error(`  ${chalk.red(figures.cross)}  ${chalk.red(msg)}`); },
  dim    (msg) { console.log(chalk.dim(`     ${msg}`)); },
  blank  ()    { console.log(); },

  verbose(msg) {
    if (verboseMode) {
      console.log(chalk.dim(`  [verbose] ${msg}`));
    }
  },

  step(index, total, label) {
    console.log(
      `  ${chalk.dim(`[${index}/${total}]`)} ${chalk.bold(label)}`
    );
  },
};

module.exports = logger;
