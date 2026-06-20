'use strict';

/**
 * Default configuration values used throughout the CLI.
 */
const DEFAULTS = {
  odooVersion:  '17',
  author:       'Your Company',
  website:      'https://yourcompany.com',
  category:     'Custom',
  license:      'LGPL-3',
  withApi:      false,
  withUi:       false,
  withTests:    false,
  withReports:  false,
  withOwl:      false,
  withWizard:   false,
  withDocker:   true,
  withCi:       false,
};

/**
 * Core Odoo module depends — always included.
 */
const CORE_DEPENDS = ['base', 'mail', 'web'];

/**
 * Odoo version → compatibility_date mapping.
 */
const COMPATIBILITY_DATES = {
  '16': '2023-01-01',
  '17': '2024-01-01',
  '18': '2025-01-01',
};

/**
 * Supported Pro templates.
 */
const PRO_TEMPLATES = ['fleet', 'hr', 'inventory', 'pos', 'crm'];

module.exports = { DEFAULTS, CORE_DEPENDS, COMPATIBILITY_DATES, PRO_TEMPLATES };
