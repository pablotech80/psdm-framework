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
node bin/psdm.mjs adr "Adopt CI change level enforcement" --target "$(mktemp -d)" --date 2026-07-08 --json
node bin/psdm.mjs classify "small cleanup" --file src/validator/validate-method.mjs --json
node bin/psdm.mjs inspect --staged --json
printf '/help\n/status\n/inspect\n/exit\n' | node bin/psdm.mjs shell .
node bin/psdm.mjs action prepare git.commit --json
node bin/psdm.mjs hook status pre-commit --json
node bin/psdm.mjs enforce "small cleanup" --file src/validator/validate-method.mjs --max-level "Level 3" --json
node bin/psdm.mjs adr "Validate beta release readiness" --target "$(mktemp -d)" --date 2026-07-08 --json
node bin/psdm.mjs pr-checklist "small cleanup" --file src/validator/validate-method.mjs
```

Installed executable parity is validated by `npm run release:check`. It installs the local package in a temporary directory, runs both commands, and requires identical output:

```bash
riscala help
psdm help
```

CLI fixture validation:

```bash
npm test
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
npm run release:check -- --allow-dirty
npm pack --dry-run
```

Repository governance validation:

```bash
node bin/psdm.mjs validate . --json
```

## Testing Gate

- Run syntax validation for source changes.
- Run CLI smoke validation for command, parser, config, AI policy, classifier, or validator changes.
- Run audit validation for changes that affect init, config, required artifacts, AI governance detection, AI readiness output, or AI surface detection.
- Run PR checklist validation for changes that affect classification, risk paths, or PR workflow output.
- Run `npm test` for CLI regression coverage around the interactive shell, audit, AI readiness contract, AI surface detection, existing AI governance detection, adoption plan creation, ADR generation, init dry-run, classify, staged inspection, enforce, PR checklist, validate, custom config, AI policy validation, AI guardrail templates, validation profiles, unsupported profile validation, invalid risk path validation, feature artifact behavior, and example project coverage.
- Verify shell fixtures report target-specific context, distinguish staged/unstaged/untracked changes, reuse staged governance classification, and block mutating slash commands.
- Verify Ptech cyan uses `#00A8E8`, colored output preserves plain layout after ANSI removal, and color is disabled for non-TTY, `TERM=dumb`, and `NO_COLOR`.
- Verify approval fixtures with real detached signatures: valid Ed25519 receipt, unsupported phrase mode, changed staged content, missing approver trust, and invalid policy.
- Verify enforcement consumes an approval once, rejects replay, permits lower-risk commits, blocks Level 3 without trust, respects Git hook paths, and preserves unmanaged hooks.
- Run staged inspection fixtures for changes to Git parsing, classification floors, risk-path evidence, or inspect output.
- Verify root `AGENTS.md` classifies as Level 3 when agent governance or default risk paths change.
- Verify approval enforcement and Git hook modules classify as Level 3 by default.
- Run executable alias fixtures and the release check for changes to Riscala branding, `package.json` bin mappings, or help output.
- Run initialized project validation for template, config, AI guardrail, artifact, or Action bootstrap changes.
- Verify initialized `AGENTS.md` contains the Agent Decision Protocol, self-approval prohibition, and next-action rationale requirement.
- Run package validation before distribution-related changes.
- Treat unexpected validation failures as blocking unless explicitly documented as pre-existing.
