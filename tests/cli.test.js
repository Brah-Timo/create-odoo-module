'use strict';

const { validateModuleName } = require('../src/cli/validator');
const { parseExtraDepends, parseBool } = require('../src/cli/args-parser');
const { toSnakeCase, toPascalCase, toKebabCase, toOdooModel } = require('../src/utils/string-utils');

// ─── Validator tests ──────────────────────────────────────────────────────────
describe('validateModuleName', () => {
  test('accepts valid snake_case name', () => {
    expect(validateModuleName('fleet_manager').valid).toBe(true);
  });

  test('accepts valid kebab-case name', () => {
    expect(validateModuleName('fleet-manager').valid).toBe(true);
  });

  test('accepts lowercase alphanumeric', () => {
    expect(validateModuleName('module123').valid).toBe(true);
  });

  test('rejects empty string', () => {
    expect(validateModuleName('').valid).toBe(false);
  });

  test('rejects name starting with digit', () => {
    expect(validateModuleName('1module').valid).toBe(false);
  });

  test('rejects uppercase letters', () => {
    expect(validateModuleName('FleetManager').valid).toBe(false);
  });

  test('rejects reserved name "base"', () => {
    expect(validateModuleName('base').valid).toBe(false);
  });

  test('rejects name with spaces', () => {
    expect(validateModuleName('my module').valid).toBe(false);
  });

  test('rejects name shorter than 2 chars', () => {
    expect(validateModuleName('a').valid).toBe(false);
  });

  test('rejects name longer than 64 chars', () => {
    expect(validateModuleName('a'.repeat(65)).valid).toBe(false);
  });

  test('rejects name with special chars', () => {
    expect(validateModuleName('my@module').valid).toBe(false);
  });
});

// ─── Args parser tests ────────────────────────────────────────────────────────
describe('parseExtraDepends', () => {
  test('parses comma-separated modules', () => {
    expect(parseExtraDepends('sale,purchase')).toEqual(['sale', 'purchase']);
  });

  test('trims whitespace', () => {
    expect(parseExtraDepends(' sale , purchase ')).toEqual(['sale', 'purchase']);
  });

  test('filters invalid module names', () => {
    expect(parseExtraDepends('sale,123invalid,purchase')).toEqual(['sale', 'purchase']);
  });

  test('returns empty array for empty string', () => {
    expect(parseExtraDepends('')).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(parseExtraDepends(null)).toEqual([]);
  });
});

describe('parseBool', () => {
  test('true string → true', () => expect(parseBool('true')).toBe(true));
  test('false string → false', () => expect(parseBool('false')).toBe(false));
  test('boolean true → true', () => expect(parseBool(true)).toBe(true));
  test('undefined → default', () => expect(parseBool(undefined, true)).toBe(true));
});
