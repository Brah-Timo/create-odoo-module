# Changelog

All notable changes to `create-odoo-module` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-06-20

### Added
- **Core CLI** with `commander.js` — argument parsing, subcommands (`list`, `upgrade`)
- **Interactive mode** via `inquirer.js` — guided setup when no flags given
- **Odoo module generator** — produces complete Python module:
  - `__manifest__.py` with correct version format (`17.0.1.0.0`)
  - `models/` — full model with state machine, constraints, computed fields, sequence
  - `security/` — CSV access rules + XML security groups
  - `data/` — auto-sequence record
  - `static/` — JS + SCSS placeholders
  - `i18n/` — `.pot` translation template
  - `tests/` — 10 pytest tests covering full lifecycle (with `--with-tests`)
  - `wizard/` — transient model bulk-action dialog (with `--with-wizard`)
  - `report/` — QWeb PDF report + template (with `--with-reports`)
  - OWL component with `@odoo/owl` (with `--with-owl`)
- **REST API generator** — full CRUD controller:
  - `GET /api/{module}` with pagination, search, filter
  - `GET /api/{module}/:id`
  - `POST /api/{module}` (create)
  - `PUT /api/{module}/:id` (update)
  - `DELETE /api/{module}/:id` (delete, state-guarded)
  - `POST /api/{module}/:id/action` (business methods)
  - `GET /api/{module}/stats` (aggregate by state)
  - Standardised `{status, data, meta}` JSON responses
- **UI/Views generator** — full XML views suite:
  - Search view with filters, separators, Group By options
  - Form view with statusbar, ribbon, chatter, priority stars
  - List view with decoration rules, inline action buttons
  - Kanban view with `many2one_avatar_user`
  - Activity view
  - `ir.actions.act_window` wiring all views
  - Top-level + sub-menus with icon
- **Flutter app generator** — production-ready Dart app:
  - `pubspec.yaml` — `odoo_rpc`, `flutter_riverpod`, `go_router`, `flutter_secure_storage`
  - `OdooConfig` — server URL + DB constants
  - `OdooJsonRpcClient` — typed `callKw` wrapper with typed exceptions
  - `AuthService` — login / logout with `SharedPreferences`
  - Typed `{Module}Record` — `fromMap`, `toMap`, `copyWith`, computed getters
  - `{Module}Repository` — full CRUD + business action calls
  - Riverpod `AsyncNotifier` with pagination, refresh, loadMore
  - 4 screens: Login, List (search + pull-to-refresh), Detail (actions), Create
  - `StateBadge`, `LoadingOverlay`, `{Module}Card` widgets
  - Unit tests for Dart model
  - Integration test scaffold
- **Deploy generator**:
  - `deploy.sh` (Linux/macOS) — file copy + XML-RPC install/upgrade
  - `deploy.ps1` (Windows PowerShell) — equivalent
  - `docker-compose.yml` — Odoo + PostgreSQL local dev stack
  - `odoo.conf` — Odoo config for Docker
  - GitHub Actions CI pipeline (with `--with-ci`)
- **Module name validator** — reserved names, length, pattern
- **String utilities** — `toSnakeCase`, `toPascalCase`, `toKebabCase`, `toOdooModel`
- **Pro license verification** — API-based, cached 24h, fail-open
- **Update notifier** — alerts when a newer version is available
- **Coloured banner** — gradient ASCII art via `gradient-string` + `boxen`
- **Jest test suite** — 40+ tests across CLI, generators, string utils
- **ESLint** config
- Supports **Odoo 16, 17, 18**

---

## [Unreleased]

### Planned for v1.1.0
- `upgrade` command — update existing generated projects to newer templates
- Pro template: `fleet` — Fleet Management
- Pro template: `hr` — Human Resources
- Pro template: `inventory` — Inventory + barcode
- Pro template: `pos` — Point of Sale
- Pro template: `crm` — CRM Pipeline with OWL dashboard
- `--with-graphql` flag — GraphQL endpoint via Strawberry
- Supabase / PostgreSQL direct integration option
- Windows CI runner in GitHub Actions
