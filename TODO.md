# TODO.md

Status: `Active`
Repository: `psdm-framework`
Last Updated: `2026-07-08`

## Purpose

Track concrete next tasks for PSDM Framework development.

This file must be updated with every meaningful project advance. Completed items should move to `Done` instead of disappearing without trace.

## Now

- [ ] Confirm npm scope ownership for `@ptech`.

## Next

- [ ] Record explicit owner approval with `CONFIRM NPM BETA PUBLISH`.

## Later

- [ ] Add richer runnable example projects.

## Done

- [x] MVP CLI scaffold.
- [x] PSDM templates.
- [x] JSON output mode.
- [x] Config support.
- [x] Feature artifacts.
- [x] Git dirty-state awareness.
- [x] GitHub Action MVP.
- [x] Tool registry draft.
- [x] Backend/platform risk path classification.
- [x] Repository-level `AGENTS.md`.
- [x] Root `ROADMAP.md`.
- [x] Root `TODO.md`.
- [x] Root `psdm.config.json` for this repository.
- [x] Initialized missing PSDM baseline artifacts for the framework itself.
- [x] Refined draft-marker detection for operational `TODO.md` references.
- [x] Added pre-init audit for existing projects.
- [x] Added `psdm pr-checklist`.
- [x] Added CLI fixtures for audit, classify, and checklist behavior.
- [x] Added CLI fixtures for validate, custom config, and feature artifacts.
- [x] Added validation profiles.
- [x] Restored fresh-template review warning for unresolved draft markers.
- [x] Added formal validation for unsupported profiles.
- [x] Added config schema stability documentation.
- [x] Required rationale for every final `Siguiente accion`.
- [x] Added CI change-level enforcement.
- [x] Added risk path schema validation.
- [x] Added ADR generation.
- [x] Prepared beta release notes.
- [x] Created public docs index.
- [x] Added existing AI governance detection to audit.
- [x] Added PSDM adoption plan generation for existing AI governance.
- [x] Completed AI readiness gap analysis for governance, guardrails, costs, latency, prompt injection, and PII.
- [x] Defined the AI readiness audit contract for `psdm audit --json`.
- [x] Added human-readable AI readiness output to `psdm audit`.
- [x] Added AI readiness audit fixture coverage.
- [x] Implemented AI surface detection in `src/lib/audit.mjs`.
- [x] Added governance gap detection for AI readiness artifact groups.
- [x] Designed optional AI policy fields for `psdm.config.json`.
- [x] Added AI policy validation fixtures.
- [x] Accepted ADR keeping PSDM as governance layer, not AI observability platform.
- [x] Added AI guardrail templates for PII, prompt injection, cost, latency, evals, and tool security.
- [x] Added `ai-agent` profile fixture for AI guardrail artifact creation.
- [x] Bumped package status to `0.17.0-alpha`.
- [x] Documented downstream GitHub Action validation protocol.
- [x] Fixed downstream Action smoke bootstrap issues found during first external run.
- [x] Fixed `psdm init` idempotence for PSDM-managed `AGENTS.md`.
- [x] Executed downstream GitHub Action validation with pass and expected-fail evidence.
- [x] Added example project fixture coverage.
- [x] Prepared public package release checklist.
- [x] Decided package metadata gaps before beta.
- [x] Defined public npm release automation.
- [x] Decided final beta version string and dist-tag.
- [x] Bumped package status to `1.0.0-beta.1`.
- [x] Ran strict release check on clean tree.
- [x] Checked npm publish readiness and found npm auth missing.
- [x] Configured npm CLI authentication.
- [x] Ran npm publish dry-run for `1.0.0-beta.1`.
- [x] Normalized `bin.psdm` package metadata before publish.
- [x] Started public repository readiness cleanup.
- [x] Sanitized private downstream validation evidence from public docs.
- [x] Added root `CONTRIBUTING.md` and `SECURITY.md`.
- [x] Added public `CODE_OF_CONDUCT.md`, issue templates, and PR template.
- [x] Revalidated release check and npm publish dry-run after public-readiness cleanup.
- [x] Added README branding polish, logo reference, badges, and governance flow.
- [x] Added GitHub metadata guidance for public beta presentation.
- [x] Added `assets` to package allowlist for npm README logo rendering.
- [x] Bumped package status to `0.16.0-alpha`.
- [x] Bumped package status to `0.15.0-alpha`.
- [x] Bumped package status to `0.14.0-alpha`.
- [x] Filled `docs/PROJECT_BRIEF.md` with framework-specific context.
- [x] Filled `docs/SPEC.md` with CLI/config behavior scope.
- [x] Filled `docs/ARCHITECTURE.md` with current module boundaries.
- [x] Filled `docs/TESTING.md` with validation commands and expected outcomes.
- [x] Filled `docs/SECURITY.md` with secret/data/tooling assumptions.
- [x] Filled `docs/DEPLOYMENT.md` with npm/GitHub release assumptions.
- [x] Filled `docs/OPERATIONS.md` with maintenance and CI expectations.
- [x] Bumped package status to `0.9.0-alpha`.
- [x] Bumped package status to `0.10.0-alpha`.
- [x] Bumped package status to `0.11.0-alpha`.
- [x] Bumped package status to `0.12.0-alpha`.
- [x] Bumped package status to `0.13.0-alpha`.

## Update Rule

Every implementation advance must update this file when it completes a task, creates a new task, changes priority, or changes the next execution target.
