# Architecture

Internal design, code structure, and data flow of `create-odoo-module`.

---

## Repository Layout

```
create-odoo-module/
│
├── bin/
│   └── create-odoo-module.js      ← Node.js CLI entry point (shebang, Commander setup, banner)
│
├── src/
│   ├── cli/
│   │   ├── index.js               ← Core orchestrator: runCLI(), listTemplates(), buildConfig()
│   │   ├── args-parser.js         ← Pure parsing utilities: parseExtraDepends(), parseOdooVersion()
│   │   ├── prompts.js             ← Inquirer interactive questions: askInteractiveQuestions()
│   │   └── validator.js           ← Module name validation: validateModuleName()
│   │
│   ├── generators/
│   │   ├── odoo-generator.js      ← Python module: models, security, data, tests, wizard, report
│   │   ├── api-generator.js       ← REST API controller (full CRUD)
│   │   ├── ui-generator.js        ← XML views: Form, List, Kanban, Search, Activity, Menus
│   │   ├── flutter-generator.js   ← Flutter/Dart app: pubspec, screens, providers, widgets
│   │   └── deploy-generator.js    ← Deploy scripts: bash, PowerShell, Docker Compose, CI
│   │
│   ├── config/
│   │   ├── defaults.js            ← DEFAULTS, CORE_DEPENDS, COMPATIBILITY_DATES, PRO_TEMPLATES
│   │   └── pro-config.js          ← Pro license verification API config
│   │
│   └── utils/
│       ├── file-system.js         ← writeFile(), mkdirp() wrappers (fs-extra)
│       ├── license-check.js       ← verifyProLicense() — HTTP call + 24h cache
│       ├── logger.js              ← Coloured terminal logger (info/warn/error/verbose)
│       ├── spinner.js             ← ora spinner helpers
│       └── string-utils.js        ← toSnakeCase(), toPascalCase(), toKebabCase(), toOdooModel()
│
├── tests/
│   ├── cli.test.js                ← Tests: validation, config building, interactive flow
│   ├── generators.test.js         ← Tests: output correctness, file existence
│   └── string-utils.test.js       ← Tests: all string transformation functions
│
├── doc/                           ← This documentation folder
├── example/                       ← Complete working example output
│
├── package.json
├── README.md
├── CHANGELOG.md
├── PUBLISHING.md
└── LICENSE
```

---

## Data Flow

```
User runs: npx create-odoo-module fleet-manager --with-api --with-ui
                           │
                           ▼
              bin/create-odoo-module.js
              ┌──────────────────────────────┐
              │  1. Node ≥18 version check   │
              │  2. Update notifier (async)  │
              │  3. Print banner             │
              │  4. Commander.js parse args  │
              └──────────────┬───────────────┘
                             │
                             ▼
              src/cli/index.js → runCLI(moduleName, options)
              ┌──────────────────────────────────────────────────┐
              │  1. Validate module name (validator.js)          │
              │  2. Interactive prompts if needed (prompts.js)   │
              │  3. Build config object (buildConfig)            │
              │  4. Pro license check (license-check.js)        │
              │  5. Check & handle existing target directory     │
              │  6. Run generator pipeline (in sequence)         │
              │  7. Git init (optional)                          │
              │  8. Print success message                        │
              └──────────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────────────────────────┐
              │              │                                   │
              ▼              ▼                                   ▼
    generateOdooModule  generateApiLayer               generateUiLayer
    (always)            (--with-api)                   (always)
              │
              ├── generateFlutterApp  (--with-ui)
              │
              └── generateDeployScripts (always)
```

---

## Config Object

`buildConfig(moduleName, options)` constructs a single **config object** that every generator
receives. This is the single source of truth for the entire generation run.

```js
{
  // Name variants
  moduleName:       "fleet-manager",
  moduleNameSnake:  "fleet_manager",       // for Python identifiers
  moduleNamePascal: "FleetManager",        // for Python class names
  moduleNameKebab:  "fleet-manager",       // for file/directory names
  moduleNameOdoo:   "fleet.manager",       // Odoo technical model name
  moduleNameClass:  "FleetManager",        // alias for Pascal
  moduleNameLabel:  "Fleet Manager",       // human-readable label

  // Odoo settings
  odooVersion:   "17",
  category:      "Custom",
  author:        "Acme Corp",
  website:       "https://acme.com",
  extraDepends:  [],                       // parsed from --depends flag

  // Feature flags (all boolean)
  withApi:       true,
  withUi:        true,
  withTests:     false,
  withReports:   false,
  withOwl:       false,
  withWizard:    false,
  withDocker:    true,
  withCi:        false,

  // Pro
  proKey:        null,
  template:      null,

  // Meta
  year:          2026,
  generatedAt:   "2026-06-20T...",
}
```

Every generator function receives this object and uses `if (config.withApi)` guards to
conditionally emit content.

---

## Generator Architecture

Each generator in `src/generators/` follows the same pattern:

```
generateXxx(targetDir, config)          ← async entry point, called from index.js
  └─ mkdirp(dirs)                       ← create directories
  └─ Promise.all([writeFile(...), ...]) ← write all files in parallel
       └─ genXxx(s, P, M, L, config)   ← pure function returning file content string
```

**Pure string generators** have zero side effects and are trivially testable:

```js
// Example: every generator is just a template string function
function genManifest({ s, P, L, M, depends, compatDate, config }) {
  return `# -*- coding: utf-8 -*-
{
    'name': '${L}',
    'version': '${config.odooVersion}.0.1.0.0',
    ...
}
`;
}
```

---

## Generator Details

### `odoo-generator.js`

Generates the complete Python module. Called unconditionally.

**Directories always created:**
```
odoo_module/
  models/     controllers/    security/
  views/      data/           report/
  tests/      i18n/           static/src/js/
                              static/src/scss/
                              static/description/
  wizard/     (only with --with-wizard)
```

**Files always written:**

| File | Generator function |
|------|--------------------|
| `__init__.py` | `genRootInit(s)` |
| `__manifest__.py` | `genManifest({...})` |
| `models/__init__.py` | `genModelsInit(s, config)` |
| `models/{s}.py` | `genModel(s, P, M, L, config)` |
| `controllers/__init__.py` | `genControllersInit(s)` |
| `security/ir.model.access.csv` | `genSecurityCsv(s, M)` |
| `security/{s}_security.xml` | `genSecurityXml(s, L)` |
| `data/{s}_data.xml` | `genDataXml(s, L)` |
| `i18n/{s}.pot` | `genPot(s, L)` |
| `static/description/index.html` | `genDescription(L, config)` |
| `static/src/js/{s}.js` | `genJs(s, P, config)` |
| `static/src/scss/{s}.scss` | `genScss(s)` |

**Conditionally written:**

| Flag | Files |
|------|-------|
| `--with-tests` | `tests/__init__.py`, `tests/test_{s}.py` |
| `--with-wizard` | `wizard/__init__.py`, `wizard/{s}_wizard.py`, `wizard/{s}_wizard_views.xml` |
| `--with-reports` | `report/{s}_report.xml`, `report/{s}_report_template.xml` |

---

### `api-generator.js`

Generates `controllers/{s}_controller.py` with a `{P}RestController(http.Controller)` class.

Always called when `config.withApi` is `true`.

Endpoints generated (see [API.md](./API.md) for full reference):
- `GET    /api/{endpoint}` — list with pagination + filters
- `GET    /api/{endpoint}/<id>` — single record
- `POST   /api/{endpoint}` — create
- `PUT    /api/{endpoint}/<id>` — update
- `DELETE /api/{endpoint}/<id>` — delete (state-guarded)
- `POST   /api/{endpoint}/<id>/action` — business action dispatch
- `GET    /api/{endpoint}/stats` — aggregate stats by state

The endpoint slug is the kebab-case module name (`fleet_manager` → `fleet-manager`).

---

### `ui-generator.js`

Generates Odoo XML views. Always called.

| File | Content |
|------|---------|
| `views/{s}_views.xml` | Search, Form, List, Kanban, Activity views + `ir.actions.act_window` |
| `views/{s}_menus.xml` | Top-level menu + sub-menu items |

---

### `flutter-generator.js`

Generates a full production-ready Flutter/Dart project. Called when `config.withUi` is `true`.

Key files generated:

| File | Purpose |
|------|---------|
| `pubspec.yaml` | Dependencies: `odoo_rpc`, `flutter_riverpod`, `go_router`, `flutter_secure_storage` |
| `lib/main.dart` | Entry point with Material 3 theme |
| `lib/src/config/odoo_config.dart` | Server URL + DB constants |
| `lib/src/core/odoo_client.dart` | JSON-RPC client with typed `callKw` |
| `lib/src/core/auth_service.dart` | Login/logout with `SharedPreferences` |
| `lib/src/core/exceptions.dart` | `OdooException`, `AuthException`, `NetworkException` |
| `lib/src/models/{s}_model.dart` | Typed `{P}Record` with `fromMap`, `toMap`, `copyWith` |
| `lib/src/repositories/{s}_repository.dart` | CRUD + business action calls |
| `lib/src/providers/{s}_provider.dart` | Riverpod `AsyncNotifier` with pagination |
| `lib/src/screens/login_screen.dart` | Login with session persistence |
| `lib/src/screens/list_screen.dart` | Searchable list with pull-to-refresh |
| `lib/src/screens/detail_screen.dart` | Record detail with action buttons |
| `lib/src/screens/create_screen.dart` | Form to create new records |
| `lib/src/widgets/{s}_card.dart` | Summary card widget |
| `lib/src/widgets/state_badge.dart` | State chip with colour coding |
| `lib/src/widgets/loading_overlay.dart` | Full-screen loading overlay |

---

### `deploy-generator.js`

Generates scripts for deployment and local dev.

| File | Description |
|------|-------------|
| `scripts/deploy.sh` | Linux/macOS: copies module files, calls XML-RPC install/upgrade |
| `scripts/deploy.ps1` | Windows PowerShell equivalent |
| `scripts/docker-compose.yml` | Odoo 17 + PostgreSQL 15 local dev stack |
| `.github/workflows/ci.yml` | GitHub Actions (with `--with-ci` only) |

---

## String Utilities (`string-utils.js`)

| Function | Input | Output |
|----------|-------|--------|
| `toSnakeCase(str)` | `"fleet-manager"` | `"fleet_manager"` |
| `toPascalCase(str)` | `"fleet-manager"` | `"FleetManager"` |
| `toKebabCase(str)` | `"FleetManager"` | `"fleet-manager"` |
| `toTitleCase(str)` | `"fleet-manager"` | `"Fleet Manager"` |
| `toOdooModel(str)` | `"fleet-manager"` | `"fleet.manager"` |
| `padRight(str, len)` | `"hi"`, `10` | `"hi        "` |

All functions handle mixed input (kebab, snake, Pascal, spaces).

---

## Validator (`validator.js`)

`validateModuleName(name)` returns:

```js
// Success
{ valid: true, name: "fleet-manager", warnings: [] }

// Failure
{ valid: false, error: "Module name must start with a lowercase letter" }
```

**Warning** (non-fatal): returned when name has `custom_` prefix or consecutive separators.

---

## Pro License Check (`license-check.js`)

`verifyProLicense(proKey)` performs:
1. POST to `https://create-odoo-module.dev/api/license/verify` with the key
2. Caches result in-memory for 24 hours
3. **Fail-open**: if the request fails (network error, timeout), returns `true` to avoid
   blocking users with temporary connectivity issues

---

## Dependency Graph

```
bin/create-odoo-module.js
  └─ commander
  └─ chalk, gradient-string, boxen, figures
  └─ update-notifier
  └─ src/cli/index.js
       └─ src/cli/prompts.js         → inquirer
       └─ src/cli/validator.js       (no deps)
       └─ src/cli/args-parser.js     (no deps)
       └─ src/utils/license-check.js → axios
       └─ src/utils/string-utils.js  (no deps)
       └─ src/utils/logger.js        → chalk, figures
       └─ src/utils/file-system.js   → fs-extra
       └─ src/generators/
            └─ odoo-generator.js     → file-system, string-utils, defaults, logger
            └─ api-generator.js      → file-system, logger
            └─ ui-generator.js       → file-system, logger
            └─ flutter-generator.js  → file-system, logger
            └─ deploy-generator.js   → file-system, logger, execa
```

---

## Testing Architecture

Tests live in `tests/` and run with **Jest**:

```
tests/
├── cli.test.js           → validateModuleName, buildConfig logic, interactive flow
├── generators.test.js    → file content assertions (manifest keys, model fields, etc.)
└── string-utils.test.js  → all toSnakeCase / toPascalCase / etc. edge cases
```

Run all tests:

```bash
npm test                  # jest --coverage
npm run test:watch        # jest --watch
```

Coverage is collected from `src/**/*.js`.

---

## Adding a New Generator

1. Create `src/generators/my-generator.js`:

```js
'use strict';

const path = require('path');
const { writeFile, mkdirp } = require('../utils/file-system');
const logger = require('../utils/logger');

async function generateMyThing(targetDir, config) {
  const s = config.moduleNameSnake;
  logger.verbose('Generating my thing...');

  await mkdirp(path.join(targetDir, 'my_dir'));
  await writeFile(
    path.join(targetDir, 'my_dir', `${s}_thing.txt`),
    genMyFile(s, config)
  );
}

function genMyFile(s, config) {
  return `# Generated for ${s}\n`;
}

module.exports = { generateMyThing };
```

2. Import and call from `src/cli/index.js`:

```js
const { generateMyThing } = require('../generators/my-generator');
// ...
if (config.withMyThing) {
  spinner.start('Generating my thing...');
  await generateMyThing(targetDir, config);
  spinner.succeed('My thing generated!');
}
```

3. Add the `--with-my-thing` flag in `bin/create-odoo-module.js`.

4. Add the flag to `buildConfig()` in `src/cli/index.js`.

5. Write tests in `tests/generators.test.js`.
