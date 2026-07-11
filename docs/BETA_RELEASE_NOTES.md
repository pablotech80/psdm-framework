# BETA_RELEASE_NOTES.md

Status: `Published`
Latest Beta Release: `1.0.0-beta.5`
Next Beta Candidate: `1.0.0-beta.6 development`
First Beta Release: `1.0.0-beta.1`
Project: `psdm-framework`

## Beta.6 Development — Developer Judgment

Beta.6 refocuses Riscala on amplifying developer technical judgment during AI-assisted development.

The first implemented increment adds a read-only Judgment Brief:

```bash
riscala impact "<change intent>" [--guidance learn|balanced|concise] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>] [--json]
```

Current behavior:

- produces first value without `riscala init`;
- separates deterministic repository evidence from inferred impact;
- exposes assumptions, options, trade-offs, recommendation, uncertainty, and developer decisions required;
- keeps `ownerDecision.value` unset and reserves authority for the developer;
- provides focused reasoning for authentication, data/schema, delivery, AI behavior, and low-risk presentation changes;
- falls back to explicit high uncertainty instead of inventing semantic understanding;
- renders learn, balanced, concise, and JSON views from the same result.

The second implemented increment adds staged Decision Review:

```bash
riscala review "<change intent>" --staged [--file <expected-path>] [--files <expected-paths>] [--guidance learn|balanced|concise] [--target <path>] [--config <path>] [--json]
```

Current Decision Review behavior:

- creates an in-memory advisory Change Envelope from CLI-declared expected files;
- exposes `authorityVerified: false` and keeps the owner decision unset;
- compares expected files with staged Git files;
- reports scope drift and expected files missing from the staged implementation;
- detects observed auth, schema, AI, configuration, dependency, test, documentation, and delivery surfaces;
- compares dependency names between `HEAD:package.json` and the staged index;
- reports test-file presence without claiming tests were executed;
- returns `scope_aligned_evidence_unverified` or `developer_review_required` as advisory readiness, never approval.

This is not yet a beta.6 release candidate. Public onboarding realignment, version bump, and protected publication evidence remain pending. Strong owner-authority binding remains separate from the advisory Change Envelope.

External greenfield and representative legacy validation is now recorded in `docs/BETA6_EXTERNAL_VALIDATION.md`. The validation produced corrections for greenfield intake, selected-file metadata, lead/contact/API reasoning, evidence density, and aligned-scope wording. Public onboarding realignment and a clean-install documentation-only journey remain pending before release-candidate status.

## Beta Release - 1.0.0-beta.5

Status: `Published`

Prepared: `2026-07-10`

Published: `2026-07-10`

Package: `@ptechsolution/psdm-framework@1.0.0-beta.5`

Git tag: `v1.0.0-beta.5`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.5`

Purpose:

- Publish the Riscala executable and interactive governance shell to npm beta.
- Include the Ptech cyan terminal identity and dependency-free slash command palette.
- Include the full read-only shell workflow for `/status`, `/audit`, `/check`, `/validate`, `/report`, `/inspect`, `/classify`, `/pr-checklist`, `/init-preview`, `/hook-status`, `/action`, and `/approval`.
- Preserve `psdm` as a compatibility executable mapped to the same entrypoint.
- Preserve JSON output contracts, `psdm.config.json`, package name, GitHub Action behavior, and dependency-free runtime.
- Enroll the first owner public key for content-bound Level 3/4 approval verification.

Validation:

- Local `npm run release:check -- --allow-dirty`: passed.
- Local `npm publish --dry-run --access public --tag beta`: passed.
- Protected workflow dry-run: passed.
- Explicit owner approval: recorded as `CONFIRM NPM BETA PUBLISH`.
- Protected workflow real publish with provenance: passed.
- npm dist-tag verification: `beta` points to `1.0.0-beta.5`.
- Clean install from npm `@beta`: passed.
- Installed `riscala help` and `psdm help` parity: passed.
- Installed `riscala shell`: passed.

Known limitations:

- Mutating shell commands remain blocked until managed hook activation and protected remote enforcement are configured.
- npm `latest` and `beta` now point to `1.0.0-beta.5`; removal was rejected by the registry, so the stale tag was aligned with the current beta.
- Beta status remains active.

## Riscala Phase 1

Status: `Implemented, not published`

- Adds `riscala` as the primary product executable while retaining `psdm` as a compatibility alias.
- Maps both executable names to `bin/psdm.mjs` so behavior and exit codes cannot diverge.
- Presents Riscala in human-readable headers while preserving PSDM as the method.
- Keeps JSON fields, decision codes, `psdm.config.json`, package name, GitHub Action behavior, and repository identity unchanged.
- Adds local installed-package parity validation to the release gate.
- Requires a separate version decision, protected dry-run, explicit owner approval, publication, and clean-install verification before npm users receive `riscala`.

Published: `2026-07-08`
Package: `@ptechsolution/psdm-framework@1.0.0-beta.1`
Git tag: `v1.0.0-beta.1`
GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.1`

## Release Purpose

`1.0.0-beta.1` is the first release candidate for using PSDM as a reusable governance CLI and GitHub Action in real repositories.

The beta validates whether the framework can support existing projects without destructive setup, classify change risk from descriptions and paths, enforce change-level policy in CI, and generate governance artifacts for durable decisions.

## Included Scope

- Dependency-free Node.js CLI.
- `psdm audit` for non-destructive adoption review.
- `psdm init` and `psdm init --dry-run`.
- Baseline artifact checks through `psdm check`.
- Method validation through `psdm validate`.
- Change classification through `psdm classify`.
- CI policy enforcement through `psdm enforce`.
- Pull request checklist generation through `psdm pr-checklist`.
- ADR scaffold generation through `psdm adr`.
- Markdown compliance reporting through `psdm report`.
- Optional `psdm.config.json` policy.
- Validation profiles for `standard`, `framework`, `backend-api`, `ai-agent`, `saas`, and `monorepo`.
- Feature-scoped artifacts under `docs/features/<feature>/`.
- Risk path classification and risk path schema validation.
- Unsupported profile validation.
- Config schema stability documentation.
- Composite GitHub Action for validation and optional change-level enforcement.

## Compatibility Notes

The beta uses config schema version `1`.

Expected compatible behavior:

- Existing projects can run `psdm audit` without file writes.
- `psdm init` skips existing files instead of overwriting them.
- Missing `psdm.config.json` falls back to default policy.
- Unknown profiles fail validation instead of silently changing policy.
- Malformed risk path rules fail validation and are ignored by classification.
- JSON output is intended for automation and should remain stable across beta patch releases.
- Public package metadata points to the public GitHub repository.
- First beta publication should use npm dist-tag `beta`, not `latest`.

## Operator Validation

Before publishing or tagging beta, run:

```bash
npm run release:check
```

The release check runs the expanded validation gate:

```bash
for file in bin/psdm.mjs src/**/*.mjs tests/**/*.mjs; do node --check "$file"; done
npm test
node bin/psdm.mjs validate . --json
node bin/psdm.mjs help
node bin/psdm.mjs audit . --json
node bin/psdm.mjs classify "small cleanup" --file src/validator/validate-method.mjs --json
node bin/psdm.mjs enforce "small cleanup" --file src/validator/validate-method.mjs --max-level "Level 3" --json
node bin/psdm.mjs adr "Validate beta release readiness" --target "$(mktemp -d)" --date 2026-07-08 --json
npm pack --dry-run
git diff --check
```

Expected result:

- `npm test` passes.
- Repository validation returns `METHOD_BASELINE_APPROVED`.
- Package dry-run includes CLI, source, templates, docs, root governance files, and GitHub Action metadata.
- No local package tarball remains in the repository.
- `npm run release:check` passes without `--allow-dirty` for a real release gate.

## Beta Exit Criteria

The beta is ready for `1.0.0` when:

- CLI command names, core options, and JSON output fields are stable.
- Config schema version `1` has documented compatibility rules.
- GitHub Action behavior is validated in a downstream repository.
- Public docs include a navigable index and example adoption flow.
- Example project coverage demonstrates at least one backend or SaaS repository.
- Release process is documented and repeatable.
- Release evidence policy is documented and applied to the beta.
- Trusted publishing/provenance is configured or explicitly deferred by owner approval.
- Public package readiness checklist is completed or explicitly deferred by owner approval.
- Known limitations are documented with owner-approved follow-up scope.

Publishing `1.0.0-beta.1` does not end beta. PSDM leaves beta only when a later release is intentionally promoted to `1.0.0` and published with npm dist-tag `latest`.

## Known Limitations

- Secret scanning is intentionally simple and local.
- Risk classification remains advisory unless `psdm enforce` is configured.
- Owner approval is represented as governance guidance, not as identity-provider enforcement.
- GitHub Action changed-file discovery is caller-provided through `files`.
- There is no published documentation site yet.

## Release Recommendation

Proceed to beta only after validating the Action in at least one downstream repository workflow, completing `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`, authenticating npm, recording release evidence requirements, and recording explicit owner approval for publication.

## Publication Evidence

- npm package: `https://www.npmjs.com/package/@ptechsolution/psdm-framework/v/1.0.0-beta.1`
- npm dist-tag: `beta`
- npm also reports `latest` on the first beta version; removal returned `E403`.
- Git commit: `a7b2055ee734a3645888132c29f736e9593e9b6f`
- GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.1`
- Clean install from npm `@beta`: passed.
- Trusted publishing was configured after beta publication.

## Beta Release - 1.0.0-beta.2

Status: `Published`

Published: `2026-07-08`

Package: `@ptechsolution/psdm-framework@1.0.0-beta.2`

Git tag: `v1.0.0-beta.2`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.2`

Purpose:

- Refresh npm/GitHub presentation after public beta publication.
- Include the cleaned README badge set.
- Include the npm weekly downloads badge.
- Keep CLI behavior, tests, governance logic, and publishing workflow unchanged.

Validation:

- `npm run release:check`: passed.
- `npm publish --dry-run --access public --tag beta`: passed.
- `npm publish --access public --tag beta`: passed.
- Clean install from npm `@beta`: passed.
- PSDM GitHub Action: passed.
- CodeQL: passed.

Known limitations:

- npm dist-tag `beta` points to `1.0.0-beta.2`.
- npm dist-tag `latest` still points to `1.0.0-beta.1`.
- Trusted publishing was configured after beta publication.

## Beta Release - 1.0.0-beta.3

Status: `Published`

Published: `2026-07-08`

Package: `@ptechsolution/psdm-framework@1.0.0-beta.3`

Git tag: `v1.0.0-beta.3`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.3`

Purpose:

- Validate the protected trusted publishing workflow as the next real release path.
- Include post-`1.0.0-beta.2` release documentation and workflow safety updates.
- Keep CLI behavior, tests, and governance logic unchanged.

Validation:

- Local `npm run release:check`: passed.
- Local `npm publish --dry-run --access public --tag beta`: passed.
- Protected workflow dry-run: passed.
- Protected workflow real publish: passed.
- Clean install from npm `@beta`: passed.
- `npx psdm help`: passed.

Known limitations:

- npm dist-tag `beta` points to `1.0.0-beta.4`.
- npm dist-tag `latest` still points to `1.0.0-beta.1`.

## Beta Release - 1.0.0-beta.4

Status: `Published`

Published: `2026-07-09`

Package: `@ptechsolution/psdm-framework@1.0.0-beta.4`

Git tag: `v1.0.0-beta.4`

GitHub Release: `https://github.com/pablotech80/psdm-framework/releases/tag/v1.0.0-beta.4`

Purpose:

- Publish the Knowledge as Code documentation layer to npm beta.
- Include `docs/KNOWLEDGE_AS_CODE.md`.
- Clarify that Markdown/YAML and Git are the source of truth for project knowledge.
- Clarify that Obsidian is optional authoring, while vector databases, graph databases, and GraphRAG are derived runtime paths.
- Keep CLI behavior, command contracts, JSON output, and runtime dependencies unchanged.

Validation:

- Local `npm run release:check`: passed.
- Local `npm publish --dry-run --access public --tag beta`: passed.
- GitHub PSDM workflow on release commit: passed.
- CodeQL workflow on release commit: passed.
- Protected workflow dry-run: passed.
- Protected workflow real publish: passed after explicit owner approval.
- Clean install from npm `@beta`: passed.

Known limitations:

- npm dist-tag `beta` points to `1.0.0-beta.4`.
- npm dist-tag `latest` still points to `1.0.0-beta.1`.
- Beta status remains active.
