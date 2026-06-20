'use strict';

const axios  = require('axios');
const chalk  = require('chalk');
const logger = require('./logger');

const LICENSE_API = 'https://create-odoo-module.dev/api/v1/license/verify';
const CACHE_TTL   = 1000 * 60 * 60 * 24; // 24 h

let _cachedResult = null;
let _cacheTime    = 0;

/**
 * Verify a Pro license key against the API.
 * Returns true if valid, false otherwise.
 * Results are cached for 24 hours per process.
 *
 * @param {string|null} key
 * @returns {Promise<boolean>}
 */
async function verifyProLicense(key) {
  if (!key) return false;

  // Cache hit
  if (_cachedResult !== null && Date.now() - _cacheTime < CACHE_TTL) {
    return _cachedResult;
  }

  try {
    logger.verbose(`Verifying Pro license key: ${key.slice(0, 8)}...`);

    const response = await axios.post(
      LICENSE_API,
      { key },
      { timeout: 5000, headers: { 'User-Agent': 'create-odoo-module-cli' } }
    );

    const valid = response.data?.valid === true;
    _cachedResult = valid;
    _cacheTime    = Date.now();

    if (valid) {
      logger.success(chalk.green('Pro license verified ✓'));
    } else {
      logger.warn(`Invalid Pro key. Get your key at ${chalk.underline('https://create-odoo-module.dev/pro')}`);
    }

    return valid;
  } catch (err) {
    // Network error — fail open (allow generation without Pro features)
    logger.verbose(`License check failed (network): ${err.message}`);
    logger.warn('Could not reach license server — Pro templates skipped');
    return false;
  }
}

module.exports = { verifyProLicense };
