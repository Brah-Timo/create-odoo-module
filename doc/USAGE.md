# CLI Usage Reference

Complete reference for all `create-odoo-module` CLI arguments, flags, subcommands, and examples.

---

## Synopsis

```
npx create-odoo-module [module-name] [options]
npx create-odoo-module <subcommand> [args]
```

---

## Arguments

### `[module-name]`

Name of the Odoo module to generate.

**Rules:**
- Lowercase letters, digits, hyphens (`-`) and underscores (`_`) only
- Must start with a lowercase letter
- Length: 2–64 characters
- Cannot be a reserved Odoo core module name (e.g. `base`, `sale`, `account`, `mail`)

**Examples of valid names:**

```
fleet-manager
hospital_records
my-crm-extension
pos-custom-payments
```

**If omitted**, the CLI enters interactive mode and prompts for the name.

---

## Options / Flags

### Feature flags

| Flag | Default | Description |
|------|---------|-------------|
| `--with-api` | `false` | Generate REST API controllers (GET/POST/PUT/DELETE/stats) |
| `--with-ui` | `false` | Generate Flutter mobile app (login + CRUD screens) |
| `--with-tests` | `false` | Generate Python pytest suite (10 tests) + Dart flutter_test |
| `--with-reports` | `false` | Generate QWeb PDF report template |
| `--with-owl` | `false` | Generate OWL JavaScript component (replaces empty JS stub) |
| `--with-wizard` | `false` | Generate transient model wizard (bulk actions dialog) |
| `--with-docker` | `true` | Generate Docker Compose dev environment |
| `--with-ci` | `false` | Generate GitHub Actions CI/CD pipeline |

**To disable a default-true flag**, use the `--no-` prefix:

```bash
npx create-odoo-module my-module --no-docker
```

---

### Odoo configuration

| Flag | Default | Description |
|------|---------|-------------|
| `--odoo-version <ver>` | `17` | Target Odoo version: `16`, `17`, or `18` |
| `--author <name>` | `"Your Company"` | Author / company name (written into `__manifest__.py`) |
| `--website <url>` | `"https://yourcompany.com"` | Author website URL |
| `--category <cat>` | `"Custom"` | Odoo app category (e.g. `Accounting`, `Sales`, `Manufacturing`) |
| `--depends <modules>` | `""` | Extra Odoo depends, comma-separated (e.g. `"sale,account"`) |

**Extra depends** are added after the default `['base', 'mail', 'web']`. Each depend must match
the pattern `^[a-z][a-z0-9_]*$`.

```bash
# Module that extends sale_management and account
npx create-odoo-module invoice-tracker --depends "sale_management,account"
```

---

### Pro options

| Flag | Default | Description |
|------|---------|-------------|
| `--template <name>` | `null` | Use a Pro template: `fleet`, `hr`, `inventory`, `pos`, `crm` |
| `--pro-key <key>` | `null` | Pro license key (required for `--template`) |

```bash
npx create-odoo-module my-fleet \
  --template fleet \
  --pro-key sk-pro-abc123xyz
```

---

### Behaviour flags

| Flag | Default | Description |
|------|---------|-------------|
| `--no-interactive` | — | Skip all interactive prompts; use flags only |
| `--no-git` | — | Skip `git init` in the generated project |
| `--verbose` | `false` | Show verbose output (file paths, generator steps) |
| `-v, --version` | — | Print current CLI version |
| `-h, --help` | — | Show help text |

---

## Subcommands

### `list`

Lists all available Pro templates.

```bash
npx create-odoo-module list
```

**Output:**

```
  Available Templates:

  [PRO]   fleet        Fleet Management
           Vehicle tracking, maintenance, fuel logs

  [PRO]   hr           Human Resources
           Employees, contracts, payroll, leaves

  [PRO]   inventory    Inventory
           Products, lots, barcode scanner, moves

  [PRO]   pos          Point of Sale
           POS extension with custom payment methods

  [PRO]   crm          CRM Pipeline
           Leads, pipeline, activities, dashboard

  Get Pro access → https://create-odoo-module.dev/pro
```

---

### `upgrade <module-path>`

_(Planned for v1.1.0)_

Upgrades an existing project scaffold to the latest template version.

```bash
npx create-odoo-module upgrade ./fleet-manager
```

---

## Interactive Mode

When called with no flags (or without `--no-interactive`), the CLI prompts for all settings:

```
? Module name (e.g. fleet-manager): fleet-manager
? Odoo version:
  ▸ 18.0  (latest)
    17.0  (stable) ← recommended
    16.0  (LTS)
? Select features to include: (Press <space> to select)
   ◯ REST API           GET/POST/PUT/DELETE endpoints
   ◯ Flutter App        Mobile app with login + CRUD
   ◯ Unit Tests         Python pytest + Dart flutter_test
   ◯ QWeb Reports       PDF report template
   ◯ OWL Components     JavaScript UI widgets
   ◯ Wizard             Transient model dialog
   ◉ Docker Compose     Local Odoo dev environment
   ◯ GitHub Actions CI  Automated testing pipeline
? Author / Company name: Acme Corp
? Odoo app category: Custom
? Odoo server URL (for .env): http://localhost:8069
? Odoo database name (for .env): odoo
```

If a module name is provided but no feature flags are given, the interactive prompts still run
(feature selection only). Use `--no-interactive` to suppress all prompts.

---

## Environment Variables (generated `.env`)

The generated `.env.example` contains:

```env
# ── Odoo Server ──────────────────────────────────────────────────
ODOO_URL=http://localhost:8069
ODOO_DB=odoo
ODOO_USER=admin
ODOO_PASSWORD=admin
ODOO_ADDONS_PATH=/opt/odoo/custom-addons
ODOO_SERVICE=odoo

# ── Flutter App ───────────────────────────────────────────────────
FLUTTER_ODOO_BASE_URL=http://localhost:8069
FLUTTER_ODOO_DB=odoo

# ── Pro License (optional) ────────────────────────────────────────
CREATE_ODOO_MODULE_PRO_KEY=
```

---

## npm Scripts (generated `package.json`)

After generating, the project root `package.json` provides:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Odoo + PostgreSQL via Docker Compose |
| `npm run dev:stop` | Stop Docker containers |
| `npm run dev:logs` | Tail Odoo container logs |
| `npm run deploy` | Run `scripts/deploy.sh` (Linux/macOS) |
| `npm run deploy:win` | Run `scripts/deploy.ps1` (Windows) |
| `npm run odoo:test` | Run pytest on `odoo_module/tests/` |
| `npm run odoo:lint` | Run flake8 on `odoo_module/` |
| `npm run odoo:shell` | Open Odoo shell in Docker |
| `npm run flutter:run` | `flutter run` in `flutter_app/` |
| `npm run flutter:build:android` | Build Android APK (release) |
| `npm run flutter:build:ios` | Build iOS archive (release) |
| `npm run flutter:test` | Run Dart tests |
| `npm run flutter:analyze` | `flutter analyze` |

Flutter scripts are only present when generated with `--with-ui`.

---

## Examples

### Minimal module (Odoo only, no extras)

```bash
npx create-odoo-module hospital-records
```

Generates: Odoo Python module + XML views + Docker Compose.

---

### Full stack — Odoo 17 + REST API + Flutter

```bash
npx create-odoo-module patient-manager \
  --with-api \
  --with-ui \
  --odoo-version 17 \
  --author "MedTech Solutions" \
  --category "Healthcare"
```

---

### Full stack — Odoo 18 + everything

```bash
npx create-odoo-module maintenance-tracker \
  --with-api \
  --with-ui \
  --with-tests \
  --with-reports \
  --with-owl \
  --with-wizard \
  --with-ci \
  --odoo-version 18 \
  --author "FactoryOps" \
  --category "Manufacturing"
```

---

### Module extending sale + account (Odoo 17)

```bash
npx create-odoo-module sales-dashboard \
  --with-api \
  --with-reports \
  --depends "sale_management,account" \
  --odoo-version 17
```

---

### CI/CD with GitHub Actions, no interactive prompts

```bash
npx create-odoo-module my-module \
  --with-api \
  --with-tests \
  --with-ci \
  --odoo-version 17 \
  --author "My Company" \
  --no-interactive \
  --no-git
```

---

### Pro template (Fleet Management)

```bash
# List available templates first
npx create-odoo-module list

# Generate with Pro template
npx create-odoo-module company-fleet \
  --template fleet \
  --pro-key sk-pro-abc123xyz \
  --with-ui \
  --no-interactive
```

---

### Local development (link the CLI)

```bash
git clone https://github.com/Brah-Timo/create-odoo-module.git
cd create-odoo-module
npm install
npm link                          # Makes `create-odoo-module` available globally

create-odoo-module my-test-module --with-api --verbose
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error (bad module name, missing required flag) |
| `1` | Generation error (file write failure, etc.) |
| `1` | User aborted (answered "No" to overwrite prompt) |

---

## Validation Rules for Module Name

| Rule | Example that fails |
|------|--------------------|
| Must start with lowercase letter | `9fleet`, `-manager` |
| Only `a-z`, `0-9`, `-`, `_` | `Fleet Manager`, `fleet@corp` |
| Minimum 2 characters | `a` |
| Maximum 64 characters | _(very long name)_ |
| Not a reserved Odoo name | `base`, `mail`, `sale`, `account`, `stock` |

Reserved names (full list):
`base`, `web`, `mail`, `portal`, `website`, `sale`, `purchase`, `account`, `stock`, `hr`, `crm`,
`project`, `mrp`, `point_of_sale`, `fleet`, `maintenance`, `helpdesk`, `sign`, `survey`,
`timesheet`, `odoo`, `openerp`.
