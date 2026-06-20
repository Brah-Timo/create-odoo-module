'use strict';

/**
 * fleet-manager  → fleet_manager
 * FleetManager   → fleet_manager
 */
function toSnakeCase(str) {
  return str
    .trim()
    .replace(/[-\s]+/g, '_')
    .replace(/([A-Z])/g, (m, l) => '_' + l.toLowerCase())
    .replace(/^_/, '')
    .toLowerCase();
}

/**
 * fleet-manager  → FleetManager
 * fleet_manager  → FleetManager
 */
function toPascalCase(str) {
  return str
    .trim()
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (m, c) => c.toUpperCase());
}

/**
 * FleetManager   → fleet-manager
 * fleet_manager  → fleet-manager
 */
function toKebabCase(str) {
  return str
    .trim()
    .replace(/([A-Z])/g, (m, l) => '-' + l.toLowerCase())
    .replace(/[_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}

/**
 * fleet-manager  → Fleet Manager
 */
function toTitleCase(str) {
  return toKebabCase(str)
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * fleet.manager  (Odoo technical name, dot-notation)
 * fleet-manager  → fleet.manager
 */
function toOdooModel(str) {
  return toSnakeCase(str).replace(/_/g, '.');
}

/**
 * Pad string on the right to a given length
 */
function padRight(str, len, char = ' ') {
  return String(str).padEnd(len, char);
}

module.exports = { toSnakeCase, toPascalCase, toKebabCase, toTitleCase, toOdooModel, padRight };
