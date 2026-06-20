'use strict';

/**
 * Parse a comma-separated list of extra Odoo depends
 * e.g. "sale_management,account" → ['sale_management', 'account']
 */
function parseExtraDepends(dependsString) {
  if (!dependsString) return [];
  return dependsString
    .split(',')
    .map(d => d.trim())
    .filter(d => d.length > 0 && /^[a-z][a-z0-9_]*$/.test(d));
}

/**
 * Parse Odoo version string, normalise to '16'|'17'|'18'
 */
function parseOdooVersion(version) {
  if (!version) return '17';
  const str = String(version);
  if (str.startsWith('16')) return '16';
  if (str.startsWith('17')) return '17';
  if (str.startsWith('18')) return '18';
  return '17'; // fallback
}

/**
 * Parse a boolean flag that may come as string 'true'/'false'
 */
function parseBool(value, defaultVal = false) {
  if (value === true || value === 'true')  return true;
  if (value === false || value === 'false') return false;
  return defaultVal;
}

module.exports = { parseExtraDepends, parseOdooVersion, parseBool };
