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
- [ ] Owner approval is recorded for public publication.
- [ ] No production deployment is implied by this release.

## Repository Preflight

- [ ] Working tree is clean before packaging.
- [ ] Current branch is the intended release branch.
- [ ] Latest commit is pushed.
- [ ] `README.md`, `docs/INDEX.md`, and `docs/BETA_RELEASE_NOTES.md` describe the release scope.
- [ ] `ROADMAP.md` and `TODO.md` reflect the current release state and next action.
- [ ] `docs/DOWNSTREAM_ACTION_VALIDATION.md` has current downstream Action evidence.

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

- [ ] Syntax checks pass.
- [ ] `npm test` passes.
- [ ] `psdm validate . --json` has `failures: 0`.
- [ ] CLI smoke commands return expected JSON or help text.
- [ ] `npm pack --dry-run` completes.
- [ ] `git diff --check` reports no whitespace errors.

## Package Metadata

Verify `package.json`:

- [x] `name` is final for the intended public package: `@ptech/psdm-framework`.
- [x] `version` matches the release target: `1.0.0-beta.1`.
- [ ] `description` is clear and public-safe.
- [ ] `license` is correct.
- [ ] `bin.psdm` points to `./bin/psdm.mjs`.
- [ ] `engines.node` matches supported runtime.
- [ ] `keywords` are useful for discovery.
- [x] `publishConfig.access` is set to `public` for scoped package publication.
- [x] Repository, homepage, bugs, and funding metadata are explicitly deferred until the GitHub repository or docs site is public.
- [x] `files` allowlist is present to control package contents.

## Tarball Contents

Inspect `npm pack --dry-run` output.

Must include:

- [ ] `bin/psdm.mjs`
- [ ] `src/**`
- [ ] `templates/**`
- [ ] `action.yml`
- [ ] `README.md`
- [ ] `LICENSE`
- [ ] `docs/INDEX.md`
- [ ] `docs/CONFIG_SCHEMA.md`
- [ ] `docs/BETA_RELEASE_NOTES.md`
- [ ] `docs/DOWNSTREAM_ACTION_VALIDATION.md`
- [ ] `examples/nextjs-saas/**`
- [ ] `scripts/release-check.mjs`
- [ ] `tests/cli-fixtures.mjs`

Must not include:

- [ ] local `.env` files;
- [ ] local package tarballs;
- [ ] secrets, tokens, credentials, or private data;
- [ ] generated coverage output;
- [ ] temporary downstream smoke repositories;
- [ ] editor or OS metadata.

## GitHub Action Gate

Before beta:

- [ ] `action.yml` points to supported CLI paths.
- [ ] Downstream pass scenario succeeds.
- [ ] Downstream expected-fail scenario fails for the intended governance reason.
- [ ] Private repository Action access requirements are documented if applicable.
- [ ] GitHub Actions warnings are reviewed and either resolved or accepted.

## Security And Privacy Gate

- [ ] No examples contain real API keys, customer data, production URLs, or secrets.
- [ ] Documentation does not instruct users to paste secrets into prompts.
- [ ] AI guardrail docs preserve the governance-layer boundary.
- [ ] Package contents are reviewed for local-only files.
- [ ] Release notes disclose known limitations around simple secret scanning and advisory classification.

## Publication Gate

Do not run publication commands until all prior sections pass and owner approval is explicit.

Commands, when approved:

```bash
npm publish --access public --tag beta
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

Adjust version, tag, and npm dist-tag for the actual release.

## Post-Release Verification

After publication:

- [ ] Confirm package appears under the expected npm name.
- [ ] Install in a clean temp directory.
- [ ] Run `psdm help`.
- [ ] Run `psdm init`, `psdm validate`, and `psdm audit --json` in a temp project.
- [ ] Confirm GitHub release/tag points to the intended commit.
- [ ] Record package URL, tag URL, version, and validation result in release notes.

## Rollback

If release validation fails after publication:

- [ ] Stop further promotion.
- [ ] Deprecate the affected npm version if needed.
- [ ] Publish a patch only after root cause and validation are documented.
- [ ] Update `docs/BETA_RELEASE_NOTES.md` with the known issue.
- [ ] Keep the Git tag unless owner explicitly decides to move or supersede it.

## Open Release Gaps

- [x] Decide whether to add `repository`, `homepage`, and `bugs` metadata before beta: deferred while `pablotech80/psdm-framework` is private.
- [x] Decide whether to introduce an npm `files` allowlist before beta: yes, keep one in `package.json`.
- [x] Decide whether release validation should become an npm script or CI workflow: yes, use `npm run release:check` locally and in CI.
- [x] Decide final beta version string and dist-tag: `1.0.0-beta.1` with npm dist-tag `beta`.

## Decision Record

Decision date: `2026-07-08`

- Package name: keep `@ptech/psdm-framework`; `npm view @ptech/psdm-framework` returned `E404`, so no public package is currently visible under that name. Publication still requires npm authentication and scope permission.
- GitHub metadata: defer `repository`, `homepage`, and `bugs`; `pablotech80/psdm-framework` is currently private, so public npm metadata would point users to inaccessible links.
- Package contents: add a `files` allowlist before beta to reduce accidental publication of local or unrelated files.
- Scoped publication: set `publishConfig.access` to `public` so an approved scoped npm publish uses the intended access mode.
- Authentication: this machine is not logged into npm; `npm whoami` returned `ENEEDAUTH`, so publication remains blocked until owner login/automation is configured.
- Release automation: use `npm run release:check` as the repeatable non-publishing gate. It supports `-- --allow-dirty` for local development validation, but CI and real release checks should run without that flag.
- Beta versioning: use `1.0.0-beta.1` for the first public beta candidate and npm dist-tag `beta` to avoid promoting it as `latest`.
