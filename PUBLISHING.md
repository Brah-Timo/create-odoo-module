# Publishing `create-odoo-module` to npm

## Pre-publish checklist

- [ ] All tests pass: `npm test`
- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] `npm pack --dry-run` reviewed — no sensitive files included

## Steps to publish

### 1. Create npm account
```
https://www.npmjs.com/signup
```

### 2. Login locally
```bash
npm login
# Enter username, password, email, OTP
```

### 3. Verify identity
```bash
npm whoami
# Should print your username
```

### 4. Dry run (verify what will be published)
```bash
npm pack --dry-run
```

Expected output: ~21 files, ~46 KB tarball. Should NOT include:
- `tests/` directory
- `coverage/` directory
- `node_modules/`

### 5. Publish
```bash
npm publish --access public
```

### 6. Verify it's live
```bash
npx create-odoo-module --version
# Should show 1.0.0 and the banner
```

### 7. Test the published package
```bash
npx create-odoo-module my-test-module --with-api --no-interactive
cd my-test-module && ls odoo_module/
```

---

## Version management

```bash
# Patch release (1.0.0 → 1.0.1): bug fixes
npm version patch && npm publish

# Minor release (1.0.0 → 1.1.0): new features, backward compatible
npm version minor && npm publish

# Major release (1.0.0 → 2.0.0): breaking changes
npm version major && npm publish
```

---

## npm package metadata used by npx

When a user runs `npx create-odoo-module`, npm looks for the `bin` field:

```json
{
  "bin": {
    "create-odoo-module": "./bin/create-odoo-module.js"
  }
}
```

This maps the command `create-odoo-module` to `bin/create-odoo-module.js`.

---

## Recommended npm page setup

After publishing, go to https://www.npmjs.com/package/create-odoo-module and:

1. Add a logo/icon
2. Link your GitHub repository
3. Add keywords for discoverability: `odoo`, `flutter`, `scaffold`, `erp`, `cli`

---

## Setting up a GitHub repository

```bash
git remote add origin https://github.com/YOUR_USERNAME/create-odoo-module.git
git branch -M main
git push -u origin main
```

Then add these GitHub Actions secrets (for automated publishing):
- `NPM_TOKEN` — your npm automation token

Create `.github/workflows/publish.yml`:
```yaml
name: Publish to npm
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
