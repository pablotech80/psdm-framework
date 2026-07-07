# TESTING.md

Status: `Active`
Project: `psdm-framework`

## Validation Commands

Syntax validation:

```bash
for file in bin/psdm.mjs src/**/*.mjs; do node --check "$file"; done
```

CLI smoke validation:

```bash
node bin/psdm.mjs help
node bin/psdm.mjs audit . --json
node bin/psdm.mjs classify "small cleanup" --file src/validator/validate-method.mjs --json
```

Initialized project validation:

```bash
tmpdir=$(mktemp -d)
node bin/psdm.mjs init "$tmpdir"
node bin/psdm.mjs check "$tmpdir" --json
node bin/psdm.mjs validate "$tmpdir" --json
```

Package validation:

```bash
npm pack --dry-run
```

Repository governance validation:

```bash
node bin/psdm.mjs validate . --json
```

## Testing Gate

- Run syntax validation for source changes.
- Run CLI smoke validation for command, parser, config, classifier, or validator changes.
- Run audit validation for changes that affect init, config, or required artifacts.
- Run initialized project validation for template, config, or artifact changes.
- Run package validation before distribution-related changes.
- Treat unexpected validation failures as blocking unless explicitly documented as pre-existing.
