# Contributing to create-odoo-module

Thank you for your interest in contributing! This document covers everything you need to get
started — from environment setup through to submitting a pull request.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Adding a New Generator](#adding-a-new-generator)
- [Adding a New CLI Flag](#adding-a-new-cli-flag)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

Be kind, inclusive, and professional. Constructive feedback is welcome; personal attacks are not.
By contributing you agree to abide by the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Git | any |

### Clone and install

```bash
git clone https://github.com/Brah-Timo/create-odoo-module.git
cd create-odoo-module
npm install
```

### Link for local use

```bash
npm link
```

Now `create-odoo-module` (and `npx create-odoo-module`) use your local code.

### Verify setup

```bash
create-odoo-module --version   # should print 1.0.0
npm test                       # all tests should pass
```

---

## Project Structure

```
create-odoo-module/
├── bin/create-odoo-module.js  ← CLI entry point
├── src/
│   ├── cli/                   ← Orchestration, prompts, validation
│   ├── generators/            ← File content generators
│   ├── config/                ← Defaults and constants
│   └── utils/                 ← Shared utilities
├── tests/                     ← Jest test suite
├── doc/                       ← Documentation (this folder)
└── example/                   ← Complete working example output
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full internal design.

---

## Making Changes

### 1. Create a feature branch

```bash
git checkout -b feat/my-feature
# or
git checkout -b fix/bug-description
```

### 2. Make your changes

- Edit source files in `src/`
- Add / update tests in `tests/`
- Update documentation in `doc/` if your change affects user-facing behaviour

### 3. Run tests

```bash
npm test
```

All tests must pass before submitting.

### 4. Lint

```bash
npm run lint
```

Fix any ESLint errors before committing.

---

## Testing

### Test files

| File | What it covers |
|------|----------------|
| `tests/cli.test.js` | `validateModuleName`, `buildConfig`, argument parsing |
| `tests/generators.test.js` | Generated file content (manifest keys, model fields, etc.) |
| `tests/string-utils.test.js` | All string transformation functions |

### Running tests

```bash
npm test                  # Run all tests with coverage
npm run test:watch        # Watch mode (re-run on file save)
```

### Writing a new test

```js
// tests/my-feature.test.js
'use strict';

const { myFunction } = require('../src/utils/my-util');

describe('myFunction', () => {
  it('returns expected value for basic input', () => {
    expect(myFunction('input')).toBe('expected-output');
  });

  it('handles edge case: empty string', () => {
    expect(myFunction('')).toBe('');
  });
});
```

### Generator tests

Generator tests work by calling the generator function and asserting on file content:

```js
const fs      = require('fs-extra');
const os      = require('os');
const path    = require('path');
const { generateOdooModule } = require('../src/generators/odoo-generator');

describe('generateOdooModule', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'com-test-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('generates __manifest__.py with correct version', async () => {
    const config = buildTestConfig('test-module', { odooVersion: '17' });
    await generateOdooModule(tmpDir, config);
    const manifest = await fs.readFile(
      path.join(tmpDir, 'odoo_module', '__manifest__.py'), 'utf8'
    );
    expect(manifest).toContain("'version': '17.0.1.0.0'");
  });
});
```

---

## Code Style

### JavaScript conventions

- `'use strict';` at top of every file
- Prefer `const` over `let`; avoid `var`
- 2-space indentation
- Single quotes for strings
- Trailing commas in multiline arrays/objects
- Semi-colons required
- Max line length: 100 characters (soft limit)

### Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| File names | `kebab-case.js` | `string-utils.js` |
| Functions | `camelCase` | `generateOdooModule` |
| Constants | `UPPER_SNAKE_CASE` | `CORE_DEPENDS` |
| Classes | `PascalCase` | `FleetManagerWidget` |

### Generator functions

Pure string generator functions must:
- Be named `gen{Something}(params...)` (lowercase `gen` prefix)
- Accept only serialisable parameters (no side effects)
- Return a `string` (the file content)
- Be deterministic given the same inputs

```js
// ✅ Good
function genManifest({ s, P, L, depends, config }) {
  return `# -*- coding: utf-8 -*-\n{'name': '${L}', ...}\n`;
}

// ❌ Bad — has side effects, not pure
function genManifest(config) {
  fs.writeFileSync('manifest.py', `{'name': '${config.L}'}`);  // don't do this
}
```

### ESLint

The project uses ESLint (config in `package.json`). Run:

```bash
npm run lint          # check + auto-fix
```

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or generator capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build process, tooling, dependency updates |
| `perf` | Performance improvement |

**Scopes (optional):**

`cli`, `generator`, `odoo`, `flutter`, `deploy`, `utils`, `tests`, `docs`

**Examples:**

```bash
git commit -m "feat(generator): add --with-graphql flag for GraphQL controller"
git commit -m "fix(cli): handle module names with leading underscores"
git commit -m "docs(api): add Postman collection example"
git commit -m "test(utils): add edge cases for toSnakeCase with consecutive separators"
git commit -m "chore: update commander to v12"
```

---

## Pull Request Process

### Before submitting

- [ ] All tests pass: `npm test`
- [ ] No lint errors: `npm run lint`
- [ ] New feature has test coverage
- [ ] Documentation updated (CLI flags, doc files, CHANGELOG)
- [ ] Commit message follows conventions

### PR checklist

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch from `main`
4. **Make** your changes following the guidelines above
5. **Push** to your fork
6. **Open** a PR against `main` with a clear description

### PR description template

```markdown
## What
Brief description of what this PR does.

## Why
Why this change is needed.

## How
How it was implemented (if non-obvious).

## Testing
How you tested it. Include any commands run.

## Checklist
- [ ] Tests pass
- [ ] Lint passes
- [ ] Docs updated
- [ ] CHANGELOG entry added
```

### Review process

- PRs are reviewed within 3 business days
- At least 1 approving review is required before merging
- CI must be green (tests + lint)
- Squash-merge is preferred for clean history

---

## Adding a New Generator

See [ARCHITECTURE.md — Adding a New Generator](./ARCHITECTURE.md#adding-a-new-generator) for the
step-by-step guide.

**Summary:**
1. Create `src/generators/{name}-generator.js`
2. Export `generate{Name}(targetDir, config)` async function
3. Import and call it from `src/cli/index.js` (guarded by feature flag)
4. Add `--with-{name}` flag in `bin/create-odoo-module.js`
5. Add to `buildConfig()` in `src/cli/index.js`
6. Write tests in `tests/generators.test.js`
7. Document in `doc/`

---

## Adding a New CLI Flag

1. **`bin/create-odoo-module.js`** — add `.option()` to the Commander program:

```js
.option('--with-graphql', 'Include GraphQL endpoint (Strawberry)', false)
```

2. **`src/cli/index.js`** — add to `buildConfig()`:

```js
withGraphql: !!options.withGraphql,
```

3. **`src/cli/index.js`** — call the generator in `runCLI()`:

```js
if (config.withGraphql) {
  spinner.start('Generating GraphQL endpoint...');
  await generateGraphqlLayer(targetDir, config);
  spinner.succeed('GraphQL endpoint → odoo_module/graphql/');
}
```

4. **`src/cli/prompts.js`** — optionally add to the interactive checkbox list:

```js
{
  name: `${chalk.bold('GraphQL')}           ${chalk.dim('Strawberry GraphQL endpoint')}`,
  value: 'withGraphql',
  checked: false,
},
```

5. **`doc/USAGE.md`** — add to the flags table.

---

## Reporting Bugs

Use the GitHub Issues template:

1. Go to https://github.com/Brah-Timo/create-odoo-module/issues/new
2. Choose **Bug Report**
3. Fill in:
   - create-odoo-module version (`npx create-odoo-module --version`)
   - Node.js version (`node --version`)
   - OS and version
   - Command you ran (exact)
   - Expected behaviour
   - Actual behaviour (include error output)

---

## Requesting Features

1. Go to https://github.com/Brah-Timo/create-odoo-module/issues/new
2. Choose **Feature Request**
3. Describe:
   - What problem you're trying to solve
   - Proposed solution
   - Alternatives considered
   - Any existing workarounds

Pro template requests should be sent to: contact@create-odoo-module.dev

---

## Release Process (maintainers only)

1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. `npm test` — ensure all tests pass
4. `git tag v1.x.x && git push origin v1.x.x`
5. `npm publish --access public`
6. Create GitHub Release with changelog notes
