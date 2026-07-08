# DEPLOYMENT.md

Status: `Active`
Project: `psdm-framework`

## Deployment Scope

PSDM distribution currently means packaging and publishing a CLI package, plus maintaining a GitHub Action entrypoint.

Deployment-sensitive surfaces:

- `package.json`
- `bin/psdm.mjs`
- `action.yml`
- `.github/workflows/**`
- `templates/**`
- public docs that describe install or automation behavior

Current local release validation:

```bash
npm pack --dry-run
```

## Deployment Gate

Before release or publication:

- confirm version intent;
- review `docs/BETA_RELEASE_NOTES.md`;
- run syntax and CLI smoke validation;
- run initialized project validation;
- inspect `npm pack --dry-run` contents;
- confirm GitHub Action behavior if action files changed;
- validate GitHub Action behavior in a downstream repository before beta/release readiness;
- confirm change-level enforcement behavior when Action inputs or `psdm enforce` change;
- confirm no secrets or local-only files are included.

Production publishing is never implied by code changes. Publishing to a package registry requires explicit owner approval.

Downstream GitHub Action validation is tracked in `docs/DOWNSTREAM_ACTION_VALIDATION.md`.
