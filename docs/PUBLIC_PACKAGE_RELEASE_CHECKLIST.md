# PUBLIC_PACKAGE_RELEASE_CHECKLIST.md

Status: `Active`
Project: `psdm-framework`
Release Target: `1.0.0-beta.1`

## Purpose

Define the manual release gate before PSDM is published as a public package or tagged as a reusable beta.

This checklist is intentionally operational. It does not publish anything by itself and does not replace explicit owner approval.

## Release Decision

Before release, confirm:

- [x] Target version is agreed and written in `package.json`: `1.0.0-beta.1`.
- [x] Release type is agreed: `beta`.
- [x] Release channel is agreed: npm public package and GitHub tag after approval.
- [ ] Owner approval is recorded for public publication with explicit `CONFIRM NPM BETA PUBLISH`.
- [x] No production deployment is implied by this release.

## Repository Preflight

- [ ] Working tree is clean before packaging.
- [ ] Current branch is the intended release branch.
- [ ] Latest commit is pushed.
- [ ] `README.md`, `docs/INDEX.md`, and `docs/BETA_RELEASE_NOTES.md` describe the release scope.
- [ ] `ROADMAP.md` and `TODO.md` reflect the current release state and next action.
- [ ] `docs/DOWNSTREAM_ACTION_VALIDATION.md` has current downstream Action evidence.
- [ ] `docs/PUBLIC_REPOSITORY_READINESS.md` has no blocking public-readiness findings.
- [ ] `docs/RELEASE_EVIDENCE.md` defines required release evidence for the target.
- [x] Public collaboration files are present: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, and PR template.

## Validation Commands

Run from repository root:

```bash
npm run release:check
```

Equivalent expanded validation:

```bash
for file in bin/psdm.mjs src/**/*.mjs tests/**/*.mjs; do node --check "$file"; done
npm test
node bin/psdm.mjs validate . --json
node bin/psdm.mjs help
node bin/psdm.mjs audit . --json
node bin/psdm.mjs classify "small cleanup" --file src/validator/validate-method.mjs --json
node bin/psdm.mjs enforce "small cleanup" --file src/validator/validate-method.mjs --max-level "Level 3" --json
node bin/psdm.mjs adr "Validate release readiness" --target "$(mktemp -d)" --date 2026-07-08 --json
npm pack --dry-run
git diff --check
```

Expected:

- [x] Syntax checks pass.
- [x] `npm test` passes.
- [x] `psdm validate . --json` has `failures: 0`.
- [x] CLI smoke commands return expected JSON or help text.
- [x] `npm pack --dry-run` completes.
- [x] `git diff --check` reports no whitespace errors.

## Package Metadata

Verify `package.json`:

- [x] `name` is final for the intended public package: `@ptechsolution/psdm-framework`.
- [x] `version` matches the release target: `1.0.0-beta.1`.
- [x] `description` is clear and public-safe.
- [x] `license` is correct.
- [x] `bin.psdm` points to `bin/psdm.mjs`.
- [x] `engines.node` matches supported runtime.
- [x] `keywords` are useful for discovery.
- [x] `publishConfig.access` is set to `public` for scoped package publication.
- [x] Repository, homepage, and bugs metadata point to the public GitHub repository.
- [x] `files` allowlist is present to control package contents.

## Tarball Contents

Inspect `npm pack --dry-run` output.

Must include:

- [x] `bin/psdm.mjs`
- [x] `src/**`
- [x] `templates/**`
- [x] `action.yml`
- [x] `assets/psdm-logo.png`
- [x] `CODE_OF_CONDUCT.md`
- [x] `README.md`
- [x] `LICENSE`
- [x] `docs/INDEX.md`
- [x] `docs/CONFIG_SCHEMA.md`
- [x] `docs/BETA_RELEASE_NOTES.md`
- [x] `docs/MODEL_AND_TOOL_INDEPENDENCE.md`
- [x] `docs/PUBLICATION_CHECKLIST.md`
- [x] `docs/DOWNSTREAM_ACTION_VALIDATION.md`
- [x] `examples/nextjs-saas/**`
- [x] `scripts/release-check.mjs`
- [x] `CONTRIBUTING.md`
- [x] `SECURITY.md`
- [x] `docs/PUBLIC_REPOSITORY_READINESS.md`
- [x] `tests/cli-fixtures.mjs`

Must not include:

- [x] local `.env` files;
- [x] local package tarballs;
- [x] secrets, tokens, credentials, or private data;
- [x] generated coverage output;
- [x] temporary downstream smoke repositories;
- [x] editor or OS metadata.

## GitHub Action Gate

Before beta:

- [ ] `action.yml` points to supported CLI paths.
- [ ] Downstream pass scenario succeeds.
- [ ] Downstream expected-fail scenario fails for the intended governance reason.
- [ ] Private repository Action access requirements are documented if applicable.
- [ ] GitHub Actions warnings are reviewed and either resolved or accepted.

## Security And Privacy Gate

- [x] No examples contain real API keys, customer data, production URLs, or secrets.
- [x] Documentation does not instruct users to paste secrets into prompts.
- [x] AI guardrail docs preserve the governance-layer boundary.
- [x] Model and tool independence is documented for Claude, Cursor, Copilot, Codex, skills, prompts, and other AI tooling.
- [x] Package contents are reviewed for local-only files.
- [x] Release notes disclose known limitations around simple secret scanning and advisory classification.
- [ ] Public repository readiness blockers are resolved or explicitly deferred before publication.
- [ ] npm trusted publishing/provenance blockers are resolved or explicitly deferred before publication.

## Publication Gate

Do not run publication commands until all prior sections pass and owner approval is explicit.

Commands, when approved:

```bash
npm publish --access public --tag beta
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

Adjust version, tag, and npm dist-tag for the actual release.

For trusted publishing, follow `docs/NPM_TRUSTED_PUBLISHING.md` and record evidence from `docs/RELEASE_EVIDENCE.md`.

## Post-Release Verification

After publication:

- [ ] Confirm package appears under the expected npm name.
- [ ] Install in a clean temp directory.
- [ ] Run `psdm help`.
- [ ] Run `psdm init`, `psdm validate`, and `psdm audit --json` in a temp project.
- [ ] Confirm GitHub release/tag points to the intended commit.
- [ ] Record package URL, tag URL, version, and validation result in release notes.
- [ ] Record release evidence using `docs/RELEASE_EVIDENCE.md`.

## Rollback

If release validation fails after publication:

- [ ] Stop further promotion.
- [ ] Deprecate the affected npm version if needed.
- [ ] Publish a patch only after root cause and validation are documented.
- [ ] Update `docs/BETA_RELEASE_NOTES.md` with the known issue.
- [ ] Keep the Git tag unless owner explicitly decides to move or supersede it.

## Open Release Gaps

- [x] Earlier metadata decision recorded: defer `repository`, `homepage`, and `bugs` until the GitHub repository or docs site is public.
- [x] Add `repository`, `homepage`, and `bugs` metadata after the GitHub repository became public.
- [x] Define npm trusted publishing/provenance plan.
- [x] Define release evidence and beta exit policy.
- [x] Decide whether to introduce an npm `files` allowlist before beta: yes, keep one in `package.json`.
- [x] Decide whether release validation should become an npm script or CI workflow: yes, use `npm run release:check` locally and in CI.
- [x] Decide final beta version string and dist-tag: `1.0.0-beta.1` with npm dist-tag `beta`.
- [x] Configure npm authentication for the publishing owner or CI.
- [x] Confirm npm scope ownership or publish permission for `@ptechsolution`.
- [ ] Record explicit owner approval before running `npm publish`.

## Decision Record

Decision date: `2026-07-08`

- Package name: use `@ptechsolution/psdm-framework`; `@ptech` was not available, and `@ptechsolution` is controlled by the publishing owner.
- GitHub metadata: add `repository`, `homepage`, and `bugs` after the repository became public, so npm provenance and package presentation can point to accessible source.
- Package contents: add a `files` allowlist before beta to reduce accidental publication of local or unrelated files.
- Scoped publication: set `publishConfig.access` to `public` so an approved scoped npm publish uses the intended access mode.
- Authentication: npm CLI authentication is configured for a publisher account; publication remains blocked until explicit owner approval is confirmed.
- Release automation: use `npm run release:check` as the repeatable non-publishing gate. It supports `-- --allow-dirty` for local development validation, but CI and real release checks should run without that flag.
- Beta versioning: use `1.0.0-beta.1` for the first public beta candidate and npm dist-tag `beta` to avoid promoting it as `latest`.
- Trusted publishing: plan GitHub Actions OIDC with workflow filename `npm-publish.yml`, protected environment `npm-publish`, and npm provenance before promoting beyond beta.
- Release evidence: keep beta as `beta` until release evidence, compatibility, downstream validation, and stable-release criteria are satisfied for `1.0.0`.

## Pre-Publish Check - 2026-07-08

Result:

- `npm run release:check`: passed.
- `npm view @ptechsolution/psdm-framework name version --json`: returned `E404`; no public package is visible under this name, or current credentials cannot access it.
- `npm whoami`: authentication was not available during this earlier check.
- Publish status: was blocked until npm authentication and explicit owner approval were available.

## Pre-Publish Check - 2026-07-08 After npm Login

Result:

- `npm whoami`: authenticated publisher account verified.
- `npm view @ptechsolution/psdm-framework name version --json`: returned `E404`; no public package is visible under this name.
- `npm run release:check`: passed.
- `npm publish --dry-run --access public --tag beta`: passed after normalizing `bin.psdm` to `bin/psdm.mjs` with `npm pkg fix`.
- Publish status: blocked on npm scope ownership confirmation and explicit owner approval with `CONFIRM NPM BETA PUBLISH`.

## Public Readiness Review - 2026-07-08

Result:

- Removed private downstream repository URLs, GitHub Actions run URLs, and local absolute paths from public downstream validation docs.
- Added root `CONTRIBUTING.md` and `SECURITY.md`.
- Added root `CODE_OF_CONDUCT.md`, issue templates, and PR template.
- Added `docs/PUBLIC_REPOSITORY_READINESS.md`.
- Added README branding guidance, logo reference, badges, and governance flow.
- Added `assets` to npm package allowlist so the README logo is packaged.
- Re-ran `npm run release:check -- --allow-dirty`: passed.
- Re-ran `npm publish --dry-run --access public --tag beta`: passed with 85 files.
- Former scope candidate `@ptech` was not available for the publishing owner.
- `@ptechsolution` was created as the controlled npm organization scope.
- `npm team ls ptechsolution --json` returned `["ptechsolution:developers"]`.
- `npm view @ptechsolution/psdm-framework name version --json` returned `E404`; no public package is currently visible under this name.
- Remaining blocker: explicit owner approval is still required before real publication.

## Trusted Publishing Plan - 2026-07-08

Result:

- Added public `repository`, `homepage`, and `bugs` metadata to `package.json`.
- Added `docs/NPM_TRUSTED_PUBLISHING.md`.
- Planned npm trusted publisher configuration for GitHub Actions, workflow `npm-publish.yml`, and protected environment `npm-publish`.
- Kept executable publishing workflow out of the repository until npm scope ownership, trusted publisher settings, and explicit owner approval are confirmed.

## Release Evidence Policy - 2026-07-08

Result:

- Added `docs/RELEASE_EVIDENCE.md`.
- Defined beta and stable tag policy.
- Defined required release evidence fields.
- Defined when PSDM can leave beta and become `1.0.0` with npm dist-tag `latest`.
