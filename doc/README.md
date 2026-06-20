# create-odoo-module — Documentation

> **Next.js for Odoo. One command. Full-stack ERP + Flutter app in seconds.**

[![npm version](https://img.shields.io/npm/v/create-odoo-module?color=%23875A7B)](https://www.npmjs.com/package/create-odoo-module)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## What is create-odoo-module?

`create-odoo-module` is a **CLI scaffolding tool** that generates a complete, production-ready
Odoo module project in under 30 seconds. Think of it as _Create React App_ or _Create Next App_
but for the Odoo ERP ecosystem.

A single command produces:

| Output | What it gives you |
|--------|------------------|
| **Odoo Python module** | Models, views, security, sequences, state machine |
| **REST API controllers** | Full CRUD (GET / POST / PUT / DELETE) with standardised JSON |
| **Flutter mobile app** | Login + List + Detail + Create screens, Riverpod state |
| **Deploy scripts** | `deploy.sh` + `deploy.ps1` + Docker Compose |
| **CI/CD pipeline** | GitHub Actions workflow (optional) |

---

## Documentation Index

| File | Description |
|------|-------------|
| **[README.md](./README.md)** | This file — overview and navigation |
| **[USAGE.md](./USAGE.md)** | CLI reference: all flags, arguments, subcommands, examples |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Internal design: directory layout, generator pipeline, data flow |
| **[MODELS.md](./MODELS.md)** | Odoo model generation reference: fields, state machine, constraints |
| **[VIEWS.md](./VIEWS.md)** | View generation reference: Form, List, Kanban, Search, Menus |
| **[API.md](./API.md)** | REST API controller reference: endpoints, request/response format |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to contribute: setup, conventions, testing, PR process |
| **[CHANGELOG.md](./CHANGELOG.md)** | Full version history |

---

## Quick Start

### Prerequisites

| Tool | Version | Required for |
|------|---------|-------------|
| **Node.js** | ≥ 18 | Running the CLI |
| **Docker** | any | Local Odoo dev environment (`--with-docker`) |
| **Flutter SDK** | ≥ 3.19 | Flutter app generation (`--with-ui`) |
| **Git** | any | Auto-init in generated project |

### Installation

No installation needed — use `npx`:

```bash
npx create-odoo-module my-module
```

Or install globally:

```bash
npm install -g create-odoo-module
create-odoo-module my-module
```

### Interactive mode (recommended for first-timers)

```bash
npx create-odoo-module
```

The interactive wizard asks:
1. Module name
2. Odoo version (16 / 17 / 18)
3. Features to include (checkboxes)
4. Author / company name
5. Odoo app category
6. Odoo server URL (for `.env` pre-fill)
7. Database name

### Non-interactive mode (for CI/scripts)

```bash
npx create-odoo-module fleet-manager \
  --with-api \
  --with-ui \
  --with-tests \
  --odoo-version 17 \
  --author "Acme Corp" \
  --no-interactive
```

### After generation

```bash
cd fleet-manager
cp .env.example .env        # Fill in ODOO_URL, ODOO_DB, ODOO_PASSWORD
npm run dev                 # Start Odoo + PostgreSQL via Docker
npm run deploy              # Upload & install module in Odoo
npm run flutter:run         # Launch Flutter app (needs Flutter SDK)
```

---

## Generated Project Structure

```
fleet-manager/
│
├── 📁 odoo_module/                    ← Full Odoo Python module
│   ├── __init__.py
│   ├── __manifest__.py
│   ├── models/
│   │   └── fleet_manager.py
│   ├── views/
│   │   ├── fleet_manager_views.xml
│   │   └── fleet_manager_menus.xml
│   ├── controllers/
│   │   └── fleet_manager_controller.py
│   ├── security/
│   │   ├── ir.model.access.csv
│   │   └── fleet_manager_security.xml
│   ├── data/
│   │   └── fleet_manager_data.xml
│   ├── report/                        (with --with-reports)
│   ├── wizard/                        (with --with-wizard)
│   ├── tests/                         (with --with-tests)
│   ├── static/src/
│   │   ├── js/fleet_manager.js
│   │   └── scss/fleet_manager.scss
│   └── i18n/fleet_manager.pot
│
├── 📁 flutter_app/                    (with --with-ui)
│   ├── lib/
│   │   ├── main.dart
│   │   └── src/
│   │       ├── config/
│   │       ├── core/
│   │       ├── models/
│   │       ├── repositories/
│   │       ├── screens/
│   │       └── widgets/
│   └── test/
│
├── 📁 scripts/
│   ├── deploy.sh
│   ├── deploy.ps1
│   ├── docker-compose.yml
│   └── odoo.conf
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Key Concepts

### Module naming

The CLI converts your module name to multiple formats automatically:

| Input | Snake case | Pascal case | Odoo model | Label |
|-------|-----------|-------------|-----------|-------|
| `fleet-manager` | `fleet_manager` | `FleetManager` | `fleet.manager` | `Fleet Manager` |
| `hospital_records` | `hospital_records` | `HospitalRecords` | `hospital.records` | `Hospital Records` |

### Version format

Odoo module versions follow `{odoo_major}.0.{major}.{minor}.{patch}`:

| Odoo version | Generated version |
|-------------|-----------------|
| 16 | `16.0.1.0.0` |
| 17 | `17.0.1.0.0` |
| 18 | `18.0.1.0.0` |

### State machine

Every generated model includes a complete state machine:

```
draft → confirmed → in_progress → done
  ↓                              ↓
cancelled ←────────────────────←┘
  ↓
draft  (reset)
```

---

## Pro Templates

Premium pre-built templates with domain-specific fields and business logic:

| Template | Description |
|----------|-------------|
| `fleet` | Vehicle tracking, maintenance schedule, fuel logs |
| `hr` | Employee records, contracts, payroll, leave management |
| `inventory` | Products, stock moves, lot tracking, barcode scanner |
| `pos` | Point of Sale extension with custom payment methods |
| `crm` | Lead pipeline, activities, OWL dashboard |

```bash
npx create-odoo-module list                              # Browse templates
npx create-odoo-module my-fleet --template fleet --pro-key YOUR_KEY
```

Get Pro access: https://create-odoo-module.dev/pro

---

## Links

- **Website**: https://create-odoo-module.dev
- **npm**: https://www.npmjs.com/package/create-odoo-module
- **GitHub**: https://github.com/Brah-Timo/create-odoo-module
- **Issues**: https://github.com/Brah-Timo/create-odoo-module/issues
- **Pro**: https://create-odoo-module.dev/pro

---

## License

MIT — see [LICENSE](../LICENSE).
