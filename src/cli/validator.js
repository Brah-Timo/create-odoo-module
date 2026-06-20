'use strict';

const RESERVED_NAMES = new Set([
  'base', 'web', 'mail', 'portal', 'website', 'sale', 'purchase',
  'account', 'stock', 'hr', 'crm', 'project', 'mrp', 'point_of_sale',
  'fleet', 'maintenance', 'helpdesk', 'sign', 'survey', 'timesheet',
  'node_modules', 'dist', 'build', 'src', 'test', 'tests', 'public',
  'static', 'assets', 'config', 'setup', 'install', 'odoo', 'openerp',
]);

const MAX_LENGTH = 64;
const MIN_LENGTH = 2;

/**
 * Validate an Odoo module name.
 * Rules:
 *  - Lowercase letters, digits, hyphens, underscores only
 *  - Must start with a letter
 *  - Length between 2 and 64 chars
 *  - Not a reserved Odoo core module name
 *
 * @param {string} name
 * @returns {{ valid: boolean, error?: string, warnings?: string[] }}
 */
function validateModuleName(name) {
  if (typeof name !== 'string' || !name) {
    return { valid: false, error: 'Module name must be a non-empty string' };
  }

  const trimmed = name.trim();

  if (trimmed.length < MIN_LENGTH) {
    return { valid: false, error: `Module name must be at least ${MIN_LENGTH} characters` };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { valid: false, error: `Module name must be at most ${MAX_LENGTH} characters` };
  }

  if (!/^[a-z]/.test(trimmed)) {
    return { valid: false, error: 'Module name must start with a lowercase letter' };
  }

  if (!/^[a-z][a-z0-9_-]*$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Module name may only contain lowercase letters, digits, hyphens (-) and underscores (_)',
    };
  }

  const snakeName = trimmed.replace(/-/g, '_');
  if (RESERVED_NAMES.has(snakeName) || RESERVED_NAMES.has(trimmed)) {
    return {
      valid: false,
      error: `"${trimmed}" is a reserved Odoo module name. Choose a more specific name (e.g. custom-fleet-manager)`,
    };
  }

  const warnings = [];

  if (trimmed.startsWith('custom_') || trimmed.startsWith('custom-')) {
    warnings.push('Prefix "custom_" is redundant — consider removing it');
  }

  if (trimmed.includes('--') || trimmed.includes('__')) {
    warnings.push('Consecutive separators (-- or __) may cause issues');
  }

  return { valid: true, name: trimmed, warnings };
}

module.exports = { validateModuleName };
