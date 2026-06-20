'use strict';

const path   = require('path');
const fs     = require('fs-extra');
const os     = require('os');

const { generateOdooModule }   = require('../src/generators/odoo-generator');
const { generateApiLayer }     = require('../src/generators/api-generator');
const { generateUiLayer }      = require('../src/generators/ui-generator');
const { generateDeployScripts } = require('../src/generators/deploy-generator');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeConfig(overrides = {}) {
  return {
    moduleName:       'test_module',
    moduleNameSnake:  'test_module',
    moduleNamePascal: 'TestModule',
    moduleNameKebab:  'test-module',
    moduleNameOdoo:   'test.module',
    moduleNameClass:  'TestModule',
    moduleNameLabel:  'Test Module',
    odooVersion:      '17',
    category:         'Custom',
    author:           'Test Author',
    website:          'https://example.com',
    extraDepends:     [],
    withApi:          true,
    withUi:           false,
    withTests:        true,
    withReports:      true,
    withOwl:          true,
    withWizard:       true,
    withDocker:       true,
    withCi:           false,
    proKey:           null,
    template:         null,
    year:             2025,
    generatedAt:      new Date().toISOString(),
    odooUrl:          'http://localhost:8069',
    odooDb:           'odoo',
    ...overrides,
  };
}

// ── Odoo generator tests ──────────────────────────────────────────────────────
describe('generateOdooModule', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'com-test-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('creates odoo_module directory', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    expect(await fs.pathExists(path.join(tmpDir, 'odoo_module'))).toBe(true);
  });

  test('generates __manifest__.py', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    const manifestPath = path.join(tmpDir, 'odoo_module', '__manifest__.py');
    expect(await fs.pathExists(manifestPath)).toBe(true);
    const content = await fs.readFile(manifestPath, 'utf8');
    expect(content).toContain("'name': 'Test Module'");
    expect(content).toContain("'version': '17.0.1.0.0'");
    expect(content).toContain("'installable': True");
  });

  test('generates model file with correct class name', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    const modelPath = path.join(tmpDir, 'odoo_module', 'models', 'test_module.py');
    expect(await fs.pathExists(modelPath)).toBe(true);
    const content = await fs.readFile(modelPath, 'utf8');
    expect(content).toContain('class TestModule(models.Model):');
    expect(content).toContain("'test.module'");
    expect(content).toContain('def action_confirm(self):');
  });

  test('generates security CSV', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    const csvPath = path.join(tmpDir, 'odoo_module', 'security', 'ir.model.access.csv');
    expect(await fs.pathExists(csvPath)).toBe(true);
    const content = await fs.readFile(csvPath, 'utf8');
    expect(content).toContain('access_test_module_user');
    expect(content).toContain('access_test_module_manager');
  });

  test('generates tests when withTests=true', async () => {
    await generateOdooModule(tmpDir, makeConfig({ withTests: true }));
    const testPath = path.join(tmpDir, 'odoo_module', 'tests', 'test_test_module.py');
    expect(await fs.pathExists(testPath)).toBe(true);
    const content = await fs.readFile(testPath, 'utf8');
    expect(content).toContain('class TestTestModule');
    expect(content).toContain('def test_01_create_basic');
  });

  test('generates wizard when withWizard=true', async () => {
    await generateOdooModule(tmpDir, makeConfig({ withWizard: true }));
    const wizardPath = path.join(tmpDir, 'odoo_module', 'wizard', 'test_module_wizard.py');
    expect(await fs.pathExists(wizardPath)).toBe(true);
  });

  test('generates reports when withReports=true', async () => {
    await generateOdooModule(tmpDir, makeConfig({ withReports: true }));
    const reportPath = path.join(tmpDir, 'odoo_module', 'report', 'test_module_report.xml');
    expect(await fs.pathExists(reportPath)).toBe(true);
  });

  test('generates package.json with npm scripts', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    const pkgPath = path.join(tmpDir, 'package.json');
    expect(await fs.pathExists(pkgPath)).toBe(true);
    const pkg = await fs.readJson(pkgPath);
    expect(pkg.scripts).toHaveProperty('deploy');
    expect(pkg.scripts).toHaveProperty('dev');
  });

  test('generates .env.example', async () => {
    await generateOdooModule(tmpDir, makeConfig());
    const envPath = path.join(tmpDir, '.env.example');
    expect(await fs.pathExists(envPath)).toBe(true);
    const content = await fs.readFile(envPath, 'utf8');
    expect(content).toContain('ODOO_URL=');
    expect(content).toContain('ODOO_DB=');
  });
});

// ── API generator tests ───────────────────────────────────────────────────────
describe('generateApiLayer', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'com-api-test-'));
    await fs.ensureDir(path.join(tmpDir, 'odoo_module', 'controllers'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('generates REST controller with all endpoints', async () => {
    await generateApiLayer(tmpDir, makeConfig());
    const ctrlPath = path.join(tmpDir, 'odoo_module', 'controllers', 'test_module_controller.py');
    expect(await fs.pathExists(ctrlPath)).toBe(true);
    const content = await fs.readFile(ctrlPath, 'utf8');
    expect(content).toContain("methods=['GET']");
    expect(content).toContain("methods=['POST']");
    expect(content).toContain("methods=['PUT']");
    expect(content).toContain("methods=['DELETE']");
    expect(content).toContain('def list_records');
    expect(content).toContain('def get_record');
    expect(content).toContain('def create_record');
    expect(content).toContain('def update_record');
    expect(content).toContain('def delete_record');
    expect(content).toContain('def call_action');
    expect(content).toContain('def get_stats');
  });
});

// ── UI generator tests ────────────────────────────────────────────────────────
describe('generateUiLayer', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'com-ui-test-'));
    await fs.ensureDir(path.join(tmpDir, 'odoo_module', 'views'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('generates views XML with form, list, kanban', async () => {
    await generateUiLayer(tmpDir, makeConfig());
    const viewsPath = path.join(tmpDir, 'odoo_module', 'views', 'test_module_views.xml');
    expect(await fs.pathExists(viewsPath)).toBe(true);
    const content = await fs.readFile(viewsPath, 'utf8');
    expect(content).toContain('view_test_module_form');
    expect(content).toContain('view_test_module_list');
    expect(content).toContain('view_test_module_kanban');
    expect(content).toContain('view_test_module_search');
    expect(content).toContain('action_test_module');
  });

  test('generates menus XML', async () => {
    await generateUiLayer(tmpDir, makeConfig());
    const menusPath = path.join(tmpDir, 'odoo_module', 'views', 'test_module_menus.xml');
    expect(await fs.pathExists(menusPath)).toBe(true);
    const content = await fs.readFile(menusPath, 'utf8');
    expect(content).toContain('menu_test_module_root');
  });
});

// ── Deploy generator tests ────────────────────────────────────────────────────
describe('generateDeployScripts', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'com-deploy-test-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('generates bash deploy script', async () => {
    await generateDeployScripts(tmpDir, makeConfig());
    const bashPath = path.join(tmpDir, 'scripts', 'deploy.sh');
    expect(await fs.pathExists(bashPath)).toBe(true);
    const content = await fs.readFile(bashPath, 'utf8');
    expect(content).toContain('#!/usr/bin/env bash');
    expect(content).toContain('ODOO_URL');
  });

  test('generates PowerShell deploy script', async () => {
    await generateDeployScripts(tmpDir, makeConfig());
    const ps1Path = path.join(tmpDir, 'scripts', 'deploy.ps1');
    expect(await fs.pathExists(ps1Path)).toBe(true);
  });

  test('generates docker-compose.yml', async () => {
    await generateDeployScripts(tmpDir, makeConfig());
    const dockerPath = path.join(tmpDir, 'scripts', 'docker-compose.yml');
    expect(await fs.pathExists(dockerPath)).toBe(true);
    const content = await fs.readFile(dockerPath, 'utf8');
    expect(content).toContain('version:');
    expect(content).toContain('postgres');
    expect(content).toContain('odoo:17');
  });

  test('generates GitHub Actions CI when withCi=true', async () => {
    await generateDeployScripts(tmpDir, makeConfig({ withCi: true }));
    const ciPath = path.join(tmpDir, '.github', 'workflows', 'ci.yml');
    expect(await fs.pathExists(ciPath)).toBe(true);
  });
});
