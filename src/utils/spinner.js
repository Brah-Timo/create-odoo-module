'use strict';

const ora = require('ora');

/**
 * Create a pre-configured spinner instance.
 */
function createSpinner(text = '') {
  return ora({
    text,
    spinner: 'dots2',
    color: 'magenta',
  });
}

/**
 * Wrap an async function with a spinner.
 * Shows `startText` while running, `doneText` on success.
 */
async function withSpinner(startText, doneText, fn) {
  const spinner = createSpinner(startText).start();
  try {
    const result = await fn();
    spinner.succeed(doneText || startText);
    return result;
  } catch (err) {
    spinner.fail(`Failed: ${err.message}`);
    throw err;
  }
}

module.exports = { createSpinner, withSpinner };
