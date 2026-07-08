# DEPLOYMENT.md

Status: `Active`
Project: `psdm-framework`

## Deployment Scope

PSDM distribution currently means packaging and publishing a CLI package, plus maintaining a GitHub Action entrypoint.

Deployment-sensitive surfaces:

- `package.json`
- package metadata and `files` allowlist;
- package executable mapping through `bin.psdm`;
- `bin/psdm.mjs`
- `action.yml`
- `.github/workflows/**`
- `templates/**`
- public docs that describe install or automation behavior

Current local release validation:

```bash
npm run release:check
npm pack --dry-run
```

Manual public package readiness is tracked in `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`.

Trusted publishing and provenance execution is tracked in `docs/NPM_TRUSTED_PUBLISHING.md`.

Release evidence, tag policy, and beta exit criteria are tracked in `docs/RELEASE_EVIDENCE.md`.

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
- complete `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`;
- confirm trusted publishing/provenance readiness in `docs/NPM_TRUSTED_PUBLISHING.md`;
- confirm release evidence requirements in `docs/RELEASE_EVIDENCE.md`;
- use the protected `.github/workflows/npm-publish.yml` workflow for npm trusted publishing;
- confirm no secrets or local-only files are included.

Production publishing is never implied by code changes. Publishing to a package registry requires explicit owner approval.

For beta publication, require an explicit `CONFIRM NPM BETA PUBLISH` instruction after npm authentication is configured.

When trusted publishing is enabled, prefer GitHub Actions OIDC over long-lived npm write tokens.

Downstream GitHub Action validation is tracked in `docs/DOWNSTREAM_ACTION_VALIDATION.md`.
