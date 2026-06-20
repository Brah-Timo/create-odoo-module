# Changelog

All notable changes to `create-odoo-module` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned for v1.1.0

- `upgrade` command — migrate existing projects to newer templates
- Pro template: `fleet` — Fleet Management with vehicle tracking, maintenance, fuel logs
- Pro template: `hr` — Human Resources with employees, contracts, payroll, leaves
- Pro template: `inventory` — Inventory with lots, serial numbers, barcode scanner
- Pro template: `pos` — Point of Sale extension with custom payment methods
- Pro template: `crm` — CRM Pipeline with leads, activities, OWL dashboard widget
- `--with-graphql` flag — GraphQL endpoint via Strawberry Python
- Supabase / PostgreSQL direct integration option
- Windows CI runner in GitHub Actions workflows
- `--with-translations` flag — generate `.po` translation files for FR/DE/ES/AR
- Configuration file support (`.create-odoo-modulerc.json`)

---

## [1.0.0] — 2026-06-20

Initial public release.

### Added

#### CLI

- **Commander.js**-based CLI with full argument parsing
- **Interactive mode** via `inquirer.js` — guided wizard when run with no flags
- **`list` subcommand** — displays all available Pro templates
- **`upgrade` subcommand** stub (placeholder for v1.1.0)
- **`--no-interactive`** flag — fully non-interactive for CI/scripting
- **`--no-git`** flag — skip `git init` in generated project
- **`--verbose`** flag — verbose output showing file paths and generator steps
- **Update notifier** — alerts when a newer npm version is available
- **Coloured banner** — gradient ASCII art via `gradient-string` + `boxen`
- **Module name validator** — reserved names, length, pattern rules (see [USAGE.md](./USAGE.md#validation-rules-for-module-name))

#### Odoo module generator (`--with-*` flags = optional)

| Feature | Flag |
|---------|------|
| Core Python module (always) | _(default)_ |
| `__manifest__.py` with correct version format (`17.0.1.0.0`) | _(default)_ |
| Full model with state machine, constraints, sequence, computed fields | _(default)_ |
| Security: CSV ACL + XML groups | _(default)_ |
| XML data: auto-sequence record | _(default)_ |
| XML views: Search, Form, List, Kanban, Activity | _(default)_ |
| Top-level menu + sub-menus | _(default)_ |
| i18n `.pot` translation template | _(default)_ |
| Static JS + SCSS placeholders | _(default)_ |
| App description HTML | _(default)_ |
| 10 pytest tests | `--with-tests` |
| Transient model wizard (bulk actions) | `--with-wizard` |
| QWeb PDF report + template | `--with-reports` |
| OWL component with `@odoo/owl` | `--with-owl` |

#### REST API generator (`--with-api`)

- Full CRUD controller: `GET`, `POST`, `PUT`, `DELETE`
- `POST /action` — business action dispatch (`confirm`, `start`, `done`, `cancel`, `reset_draft`)
- `GET /stats` — aggregate counts by state
- Standardised `{status, data, meta}` JSON responses
- Pagination, search, filter, sort on list endpoint
- State guard on DELETE (only `draft` / `cancelled`)
- Access error → 403, not-found → 404, business error → 400 with `code`

#### Flutter app generator (`--with-ui`)

- `pubspec.yaml` with `odoo_rpc`, `flutter_riverpod`, `go_router`, `flutter_secure_storage`
- `OdooConfig` — server URL + DB constants
- `OdooJsonRpcClient` — typed `callKw` wrapper with typed exceptions
- `AuthService` — login/logout with `SharedPreferences`
- Typed `{Module}Record` — `fromMap`, `toMap`, `copyWith`, computed getters (`stateLabel`, `stateColor`)
- `{Module}Repository` — full CRUD + business action calls
- Riverpod `AsyncNotifier` with pagination, refresh, load-more
- 4 screens: Login, List (search + pull-to-refresh), Detail (actions), Create
- Widgets: `StateBadge`, `LoadingOverlay`, `{Module}Card`
- Unit tests for Dart model
- Integration test scaffold

#### Deploy generator (always)

- `scripts/deploy.sh` — Linux/macOS XML-RPC deploy (module upload + install/upgrade)
- `scripts/deploy.ps1` — Windows PowerShell equivalent
- `scripts/docker-compose.yml` — Odoo + PostgreSQL local dev stack
- `scripts/odoo.conf` — Odoo configuration for Docker
- GitHub Actions CI pipeline (`--with-ci`)
- Root `package.json` with npm scripts: `dev`, `deploy`, `flutter:run`, `odoo:test`, `odoo:lint`

#### String utilities

- `toSnakeCase` — `fleet-manager` → `fleet_manager`
- `toPascalCase` — `fleet-manager` → `FleetManager`
- `toKebabCase` — `FleetManager` → `fleet-manager`
- `toTitleCase` — `fleet-manager` → `Fleet Manager`
- `toOdooModel` — `fleet-manager` → `fleet.manager`

#### Pro system

- Pro license verification via `https://create-odoo-module.dev/api/license/verify`
- 24-hour in-memory cache
- Fail-open (connectivity errors do not block generation)

#### Supported Odoo versions

- **Odoo 16.0** (LTS) — compatibility date `2023-01-01`
- **Odoo 17.0** (stable, default) — compatibility date `2024-01-01`
- **Odoo 18.0** (latest) — compatibility date `2025-01-01`

#### Test suite

- **40+ tests** via Jest
- `tests/cli.test.js` — validation, config building
- `tests/generators.test.js` — generated file content assertions
- `tests/string-utils.test.js` — all string utility functions
- Coverage collected from `src/**/*.js`

#### Documentation

- `doc/README.md` — overview, navigation, quick start
- `doc/USAGE.md` — full CLI reference
- `doc/ARCHITECTURE.md` — internal design and data flow
- `doc/MODELS.md` — model generation reference
- `doc/VIEWS.md` — view generation reference
- `doc/API.md` — REST API endpoint reference
- `doc/CONTRIBUTING.md` — contributor guide
- `doc/CHANGELOG.md` — this file
- `example/` — complete working Odoo module example

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|-----------|
| 1.0.0 | 2026-06-20 | Initial release — full generator, API, Flutter, deploy, tests, docs |

---

## Migration Guides

### N/A (1.0.0 is first release)

No migration needed.

---

## Deprecations

None.

---

## Security

If you discover a security vulnerability, **do not** open a public GitHub issue.
Email: security@create-odoo-module.dev

We follow responsible disclosure — we will acknowledge within 48 hours and provide a fix
timeline within 7 days.
