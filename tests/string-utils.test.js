'use strict';

const { toSnakeCase, toPascalCase, toKebabCase, toTitleCase, toOdooModel } = require('../src/utils/string-utils');

describe('String utilities', () => {

  describe('toSnakeCase', () => {
    test('fleet-manager → fleet_manager', () => expect(toSnakeCase('fleet-manager')).toBe('fleet_manager'));
    test('FleetManager  → fleet_manager', () => expect(toSnakeCase('FleetManager')).toBe('fleet_manager'));
    test('fleet manager → fleet_manager', () => expect(toSnakeCase('fleet manager')).toBe('fleet_manager'));
    test('already_snake → already_snake', () => expect(toSnakeCase('already_snake')).toBe('already_snake'));
  });

  describe('toPascalCase', () => {
    test('fleet-manager → FleetManager', () => expect(toPascalCase('fleet-manager')).toBe('FleetManager'));
    test('fleet_manager → FleetManager', () => expect(toPascalCase('fleet_manager')).toBe('FleetManager'));
    test('fleetmanager  → Fleetmanager', () => expect(toPascalCase('fleetmanager')).toBe('Fleetmanager'));
    test('FleetManager  → FleetManager', () => expect(toPascalCase('FleetManager')).toBe('FleetManager'));
  });

  describe('toKebabCase', () => {
    test('fleet_manager → fleet-manager', () => expect(toKebabCase('fleet_manager')).toBe('fleet-manager'));
    test('FleetManager  → fleet-manager', () => expect(toKebabCase('FleetManager')).toBe('fleet-manager'));
    test('already-kebab → already-kebab', () => expect(toKebabCase('already-kebab')).toBe('already-kebab'));
  });

  describe('toTitleCase', () => {
    test('fleet-manager → Fleet Manager', () => expect(toTitleCase('fleet-manager')).toBe('Fleet Manager'));
    test('fleet_manager → Fleet Manager', () => expect(toTitleCase('fleet_manager')).toBe('Fleet Manager'));
  });

  describe('toOdooModel', () => {
    test('fleet-manager → fleet.manager', () => expect(toOdooModel('fleet-manager')).toBe('fleet.manager'));
    test('fleet_manager → fleet.manager', () => expect(toOdooModel('fleet_manager')).toBe('fleet.manager'));
  });
});
