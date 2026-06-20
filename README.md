# create-odoo-module

> **Next.js for Odoo. One command. Full-stack ERP + Flutter app in seconds.**

[![npm version](https://img.shields.io/npm/v/create-odoo-module?color=%23875A7B)](https://www.npmjs.com/package/create-odoo-module)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

```bash
npx create-odoo-module my-module --with-api --with-ui
```

One command generates a **full Odoo Python module** + **REST API** + **Flutter mobile app**, wired together and ready to deploy — in under 30 seconds.

---

## Table of Contents

- [Why?](#why)
- [Quick Start](#quick-start)
- [Options & Flags](#options--flags)
- [What Gets Generated?](#what-gets-generated)
- [Examples](#examples)
- [Pro Templates](#pro-templates)
- [Requirements](#requirements)
- [Publish to npm](#publish-to-npm)
- [Contributing](#contributing)
- [License](#license)

---

## Why?

Setting up an Odoo module from scratch takes:

| Task                         | Without tool | With create-odoo-module |
|------------------------------|:------------:|:-----------------------:|
| Python venv + dependencies   | ~30 min      | **0 min**               |
| `__manifest__.py` setup      | ~20 min      | **instant**             |
| Model + Views + Menus        | ~90 min      | **instant**             |
| REST API controller          | ~120 min     | **instant**             |
| Flutter app wired to Odoo    | ~480 min     | **instant**             |
| Deploy scripts               | ~60 min      | **instant**             |
| **Total**                    | **~8 hours** | **< 30 seconds**        |

---

## Quick Start

### Interactive mode (recommended for new users)

```bash
npx create-odoo-module
```

Answers a few questions, generates everything.

### Fully non-interactive

```bash
npx create-odoo-module fleet-manager \
  --with-api \
  --with-ui \
  --with-tests \
  --with-reports \
  --odoo-version 17 \
  --author "Acme Corp" \
  --no-interactive
```

### After generation

```bash
cd fleet-manager
cp .env.example .env           # Fill in Odoo URL, DB, credentials
npm run dev                    # Start local Odoo via Docker Compose
npm run deploy                 # Upload & install module in Odoo
npm run flutter:run            # Launch Flutter app
```

---

## Options & Flags

```
Arguments:
  [module-name]            Name of your Odoo module (e.g. fleet-manager)

Options:
  --with-api               Include REST API controllers (GET/POST/PUT/DELETE)
  --with-ui                Include Flutter mobile app (login + CRUD screens)
  --with-tests             Include Python pytest + Dart flutter_test files
  --with-reports           Include QWeb PDF report template
  --with-owl               Include OWL JavaScript components
  --with-wizard            Include wizard (transient model dialog)
  --with-docker            Include Docker Compose dev environment (default: true)
  --with-ci                Include GitHub Actions CI/CD pipeline
  --odoo-version <ver>     Target Odoo version: 16 | 17 | 18  (default: 17)
  --template <name>        Use a Pro template: fleet | hr | inventory | pos | crm
  --pro-key <key>          Pro license key for premium templates
  --author <name>          Module author / company name (default: "Your Company")
  --website <url>          Author website
  --category <cat>         Odoo app category (default: "Custom")
  --depends <modules>      Extra Odoo depends, comma-separated (e.g. "sale,account")
  --no-interactive         Skip all interactive prompts (use flags only)
  --no-git                 Skip git init in generated project
  --verbose                Show verbose output
  -v, --version            Output current version
  -h, --help               Display help
```

### Subcommands

```bash
npx create-odoo-module list           # List all Pro templates
npx create-odoo-module upgrade <path> # Upgrade existing project (v1.1.0+)
```

---

## What Gets Generated?

Running:

```bash
npx create-odoo-module fleet-manager --with-api --with-ui --with-tests
```

Produces:

```
fleet-manager/
│
├── 📁 odoo_module/                    ← Full Odoo Python module
│   ├── __init__.py
│   ├── __manifest__.py                ← Auto-configured manifest
│   ├── models/
│   │   └── fleet_manager.py           ← Full model: fields, states, CRUD, constraints
│   ├── views/
│   │   ├── fleet_manager_views.xml    ← Form + List + Kanban + Activity + Search
│   │   └── fleet_manager_menus.xml    ← Top-level + sub-menus
│   ├── controllers/
│   │   └── fleet_manager_controller.py ← REST API: GET/POST/PUT/DELETE + stats
│   ├── security/
│   │   ├── ir.model.access.csv        ← ACL rules
│   │   └── fleet_manager_security.xml ← Groups
│   ├── data/
│   │   └── fleet_manager_data.xml     ← Sequence
│   ├── report/                        ← QWeb PDF (with --with-reports)
│   ├── wizard/                        ← Bulk action wizard (with --with-wizard)
│   ├── tests/                         ← pytest suite (with --with-tests)
│   ├── static/src/
│   │   ├── js/fleet_manager.js        ← OWL component (with --with-owl)
│   │   └── scss/fleet_manager.scss
│   └── i18n/fleet_manager.pot
│
├── 📁 flutter_app/                    ← Flutter app (with --with-ui)
│   ├── lib/
│   │   ├── main.dart                  ← Entry point + Material 3 theme
│   │   └── src/
│   │       ├── config/odoo_config.dart
│   │       ├── core/                  ← JSON-RPC client + auth service + exceptions
│   │       ├── models/                ← Typed Dart model with fromMap / toMap
│   │       ├── repositories/          ← CRUD data layer + Riverpod providers
│   │       ├── screens/               ← Login + List + Detail + Create screens
│   │       └── widgets/               ← Card + StateBadge + LoadingOverlay
│   └── test/                          ← Flutter unit tests
│
├── 📁 scripts/
│   ├── deploy.sh                      ← Linux/macOS deploy via xmlrpc
│   ├── deploy.ps1                     ← Windows PowerShell deploy
│   ├── docker-compose.yml             ← Odoo + PostgreSQL dev stack
│   └── odoo.conf                      ← Odoo config for Docker
│
├── .env.example                       ← Environment variable template
├── .gitignore
├── package.json                       ← npm scripts: deploy, dev, flutter:*
└── README.md
```

### Generated Model features

- `name`, `reference` (auto-sequence), `description`, `active`, `color`
- `state` with full state machine: draft → confirmed → in_progress → done | cancelled
- `user_id`, `company_id`, `tag_ids` relational fields
- `date_start`, `date_end`, `duration_days` (computed)
- `priority` (stars widget)
- `@api.constrains` date validation
- `_sql_constraints` unique reference
- `mail.thread` + `mail.activity.mixin` (chatter)
- Business methods: `action_confirm`, `action_start`, `action_done`, `action_cancel`, `action_reset_draft`

### Generated REST API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/{module}` | List records (pagination, search, filter) |
| `GET`  | `/api/{module}/:id` | Get single record |
| `POST` | `/api/{module}` | Create record |
| `PUT`  | `/api/{module}/:id` | Update record |
| `DELETE` | `/api/{module}/:id` | Delete record |
| `POST` | `/api/{module}/:id/action` | Call business action |
| `GET`  | `/api/{module}/stats` | Aggregate stats by state |

All endpoints return standardised JSON: `{ status: "success"|"error", data: ..., meta: ... }`.

---

## Examples

```bash
# Basic module (no API, no Flutter)
npx create-odoo-module hospital-records

# Full stack: Odoo 18 + REST API + Flutter
npx create-odoo-module patient-manager --with-api --with-ui --odoo-version 18

# With tests + reports + OWL components
npx create-odoo-module maintenance-tracker \
  --with-api --with-tests --with-reports --with-owl

# Extra Odoo dependencies
npx create-odoo-module pos-extension \
  --depends "point_of_sale,account" \
  --odoo-version 17

# CI/CD pipeline included
npx create-odoo-module my-module --with-ci --with-tests
```

---

## Pro Templates

Premium pre-built templates for common industry scenarios:

| Template | Description | Includes |
|----------|-------------|----------|
| `fleet`  | Fleet Management | Vehicle tracking, maintenance, fuel logs |
| `hr`     | Human Resources | Employees, contracts, payroll |
| `inventory` | Inventory | Products, lots, barcode scanner |
| `pos`    | Point of Sale | POS extension, custom payments |
| `crm`    | CRM Pipeline | Leads, pipeline, OWL dashboard |

```bash
# List templates
npx create-odoo-module list

# Use a Pro template
npx create-odoo-module my-fleet --template fleet --pro-key YOUR_KEY
```

**Get Pro access:** https://create-odoo-module.dev/pro ($19/month)

---

## Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | ≥ 18    | Required to run the CLI |
| **Docker**  | Any     | Optional — for local Odoo via Docker Compose |
| **Flutter SDK** | ≥ 3.19 | Required only with `--with-ui` |
| **Git**     | Any     | Optional — for git init in generated project |

No Python required on your machine — Python code is deployed to Odoo server.

---

## Publish to npm

```bash
# 1. Login to npm
npm login

# 2. Dry run to verify what will be published
npm pack --dry-run

# 3. Publish
npm publish --access public

# 4. Verify
npx create-odoo-module --version
```

---

## Contributing

```bash
git clone https://github.com/Brah-Timo/create-odoo-module.git
cd create-odoo-module
npm install
npm test
npm link   # Use locally: npx create-odoo-module
```

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Made with ♥ for the Odoo developer community<br>
  <a href="https://create-odoo-module.dev">create-odoo-module.dev</a>
</p>
