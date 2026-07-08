# RELEASE_EVIDENCE.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Define the minimum release evidence required for PSDM public beta and stable releases.

This document does not approve publication. It defines what must be recorded so a maintainer or user can trace a package version back to the repository state that produced it.

## Release Evidence Policy

Every public npm release must record:

- package name;
- package version;
- npm dist-tag;
- Git commit SHA;
- Git tag;
- GitHub release URL when available;
- npm package URL after publication;
- `npm run release:check` result;
- GitHub PSDM workflow result;
- CodeQL workflow result;
- npm dry-run result before publication;
- publication command or trusted publishing workflow reference;
- trusted publisher configuration evidence;
- approval phrase or approval record;
- release date.

For beta releases, this evidence may live in:

- GitHub Release notes;
- `docs/BETA_RELEASE_NOTES.md`;
- `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`.

For stable releases, the GitHub Release should be the primary reader-facing evidence record.

## Tag Policy

Use version tags that match the npm package version:

```text
v1.0.0-beta.1
v1.0.0
```

Beta tags:

- may be unsigned;
- must point to the exact commit used for publication;
- must not be moved after publication unless the owner explicitly documents the correction.

Stable tags:

- should be signed when maintainer signing is configured;
- must point to the exact commit used for publication;
- must not be moved after publication.

## GitHub Release Policy

Create a GitHub Release for public npm releases.

Beta releases must be marked as pre-release.

Stable releases must not be marked as pre-release.

Release notes must include:

- release summary;
- install command;
- validation evidence;
- known limitations;
- rollback or deprecation note if applicable.

## NPM Provenance Policy

When npm trusted publishing is available for the package, publish with provenance:

```bash
npm publish --provenance --access public --tag beta
```

For the first beta, local publication may be accepted only if:

- trusted publishing cannot be configured before the first publish;
- npm scope ownership is confirmed;
- `npm publish --dry-run --access public --tag beta` passes;
- owner approval explicitly accepts local publication for that beta;
- trusted publishing is configured immediately after the first package version exists.

After trusted publishing is configured, prefer GitHub Actions OIDC over long-lived npm write tokens.

## Beta Exit Criteria

PSDM stops being beta when the project meets all of these conditions:

- CLI command names and core options are stable.
- JSON output fields used for automation are stable or versioned.
- `psdm.config.json` schema version `1` has documented compatibility guarantees.
- GitHub Action behavior has passed downstream validation.
- Release evidence has been recorded for at least one beta release.
- Trusted publishing/provenance is configured or explicitly deferred with owner approval.
- Known beta limitations have been resolved or accepted as stable documented limitations.
- Public documentation explains adoption, configuration, security, release, and model/tool independence.
- At least one real or fixture-based downstream project validates `audit`, `init`, `validate`, and CI enforcement.
- No unresolved blocker remains in `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`.

Publishing `1.0.0-beta.1` does not end beta. Beta ends only when a later release is intentionally promoted to `1.0.0` and published with npm dist-tag `latest`.

## Stable Release Evidence Template

```text
Package: @ptechsolution/psdm-framework
Version:
npm dist-tag:
Git commit:
Git tag:
GitHub Release:
npm package:
PSDM workflow:
CodeQL workflow:
npm dry-run:
Publication method:
Trusted publisher:
Approval:
Release date:
Known limitations:
```

## Release Evidence - 1.0.0-beta.1

Package: `@ptechsolution/psdm-framework`

Version: `1.0.0-beta.1`

npm dist-tags:

- `beta`: `1.0.0-beta.1`
- `latest`: `1.0.0-beta.1`

Git commit: `a7b2055ee734a3645888132c29f736e9593e9b6f`

Git tag: `v1.0.0-beta.1`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.1`

npm package: `https://www.npmjs.com/package/@ptechsolution/psdm-framework/v/1.0.0-beta.1`

npm tarball: `https://registry.npmjs.org/@ptechsolution/psdm-framework/-/psdm-framework-1.0.0-beta.1.tgz`

npm integrity: `sha512-FmUFGq4zlShhkdVCjbUNcsNQ6BReWWZux9gPsH7LoqETZecvfniJcTUUG1jsAnsMZES6wniSfMY2OD1V5l09ug==`

PSDM workflow: `https://github.com/pablotech80/psdm-framework/actions/runs/28944891197`

CodeQL workflow: `https://github.com/pablotech80/psdm-framework/actions/runs/28944891099`

npm dry-run: passed before publication with 87 package files.

Publication method: one-time manual bootstrap publication.

Trusted publisher: protected GitHub workflow exists, but npm trusted publisher creation returned `E404` before the package existed and `E403` after publication.

Approval: `CONFIRM NPM BETA PUBLISH`

Release date: `2026-07-08`

Post-release verification:

- Clean install from npm `@beta`: passed.
- `npx psdm help`: passed.

Follow-up:

- First beta was published through the documented manual bootstrap exception.
- npm currently reports `latest` and `beta` on `1.0.0-beta.1`.
- Removing `latest` returned `E403` with npm account `ptech_`, package owner confirmed, package access `read-write`, and npm account 2FA temporarily disabled for the retry.
- npm trusted publishing was later configured successfully.

## Release Evidence - 1.0.0-beta.2

Package: `@ptechsolution/psdm-framework`

Version: `1.0.0-beta.2`

npm dist-tags:

- `beta`: `1.0.0-beta.2`
- `latest`: `1.0.0-beta.1`

Git commit: `8d717a595399f03062992e0a06f135b39847bd94`

Git tag: `v1.0.0-beta.2`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.2`

npm package: `https://www.npmjs.com/package/@ptechsolution/psdm-framework/v/1.0.0-beta.2`

npm tarball: `https://registry.npmjs.org/@ptechsolution/psdm-framework/-/psdm-framework-1.0.0-beta.2.tgz`

npm integrity: `sha512-9dbzlLUNIzuaCjsi+11lOaA0Q9UsBstsmF0Z5xzCnMAufmHeaSGnqw+zBEtSau59hD4WgVdXHoZRP1/lMSUS1Q==`

PSDM workflow: `https://github.com/pablotech80/psdm-framework/actions/runs/28947967690`

CodeQL workflow: `https://github.com/pablotech80/psdm-framework/actions/runs/28947967842`

npm dry-run: passed before publication with 87 package files.

Publication method: manual publication with npm account 2FA.

Trusted publisher: protected GitHub workflow exists; trusted publisher was configured after publication.

Approval: `CONFIRM NPM BETA PUBLISH`

Release date: `2026-07-08`

Post-release verification:

- Clean install from npm `@beta`: passed.
- `npx psdm help`: passed.

Known limitations:

- `1.0.0-beta.2` is a presentation-only beta refresh.
- npm dist-tag `latest` still points to `1.0.0-beta.1`.
- Use trusted publishing for future release automation.

## Trusted Publisher Evidence

Trusted publisher id: `a2992f4e-9060-4100-8d42-e0abcafaf0f3`

Type: `github`

Repository: `pablotech80/psdm-framework`

Workflow file: `npm-publish.yml`

Environment: `npm-publish`

Permissions:

- `createPackage`

Verification command:

```bash
npx npm@latest trust list @ptechsolution/psdm-framework --json
```

Verification date: `2026-07-08`

## Protected Workflow Safety

The protected npm publish workflow requires:

- `expected_version`, which must match `package.json`;
- `dry_run`, defaulting to `true`.

When `dry_run` is `true`, the workflow runs release validation and `npm publish --dry-run --access public --tag beta`.

When `dry_run` is `false`, the workflow first verifies that the requested version is not already published, then runs `npm publish --provenance --access public --tag beta`.

Dry-run evidence:

- workflow run: `https://github.com/pablotech80/psdm-framework/actions/runs/28949864639`
- expected version: `1.0.0-beta.2`
- dry run: `true`
- conclusion: `success`
- real publish step: skipped
- verification date: `2026-07-08`

## Beta 3 Candidate Evidence

Package: `@ptechsolution/psdm-framework`

Version: `1.0.0-beta.3`

Git commit: `2780c2dca182323cca439fa4f91fac28b02c8d95`

Publication status: not published.

Validation:

- Local `npm run release:check`: passed.
- Local `npm publish --dry-run --access public --tag beta`: passed.
- Protected workflow dry-run: passed.

Protected workflow run: `https://github.com/pablotech80/psdm-framework/actions/runs/28950450867`

npm registry check:

- `@ptechsolution/psdm-framework@1.0.0-beta.3`: not found.
- `beta`: `1.0.0-beta.2`
- `latest`: `1.0.0-beta.1`

Next gate:

- real publication requires explicit owner approval.
