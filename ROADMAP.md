# ROADMAP.md

Status: `Active`
Repository: `psdm-framework`
Last Updated: `2026-07-08`

## Purpose

Track the active delivery roadmap for the PSDM Framework.

This file is operational and must be updated with every meaningful project advance. The broader product roadmap remains in `docs/ROADMAP.md`; this root roadmap records the current execution state.

## Current State

PSDM is at `1.0.0-beta.1`.

Completed:

- `0.1.0` MVP CLI and templates.
- `0.2.0-alpha` config, JSON output, feature artifacts, git awareness, GitHub Action MVP, and tool registry draft.
- `0.3.0-alpha` backend/platform risk path classification.
- Repository-level `AGENTS.md` with agent operating rules.
- Root `ROADMAP.md` and `TODO.md` operational tracking.
- Root `psdm.config.json` and baseline PSDM artifacts for this repository.
- Validator draft-marker detection refined to avoid false positives on operational `TODO.md` references.
- Pre-init audit added for existing project adoption.
- PR checklist generation added from classification and risk paths.
- CLI fixtures added for audit, classify, and PR checklist behavior.
- CLI fixtures added for validate, custom config, and feature artifact behavior.
- Validation profiles added for common repository types.
- Unsupported profile values now fail validation as invalid local policy.
- Config schema stability contract documented in `docs/CONFIG_SCHEMA.md`.
- Agent final-response protocol now requires the rationale for the next action.
- CI change-level enforcement added through `psdm enforce` and the composite Action.
- Risk path schema validation added for local policy correctness.
- ADR generation added through `psdm adr`.
- Beta release notes prepared in `docs/BETA_RELEASE_NOTES.md`.
- Public documentation index added in `docs/INDEX.md`.
- Existing AI governance detection added to `psdm audit`.
- PSDM adoption plan generation added for repositories with existing AI governance.
- Fresh-template review warnings restored for unresolved draft markers.
- AI readiness gap analysis completed for governance, guardrails, cost, latency, prompt injection, and PII coverage.
- AI readiness audit JSON contract added to `psdm audit`.
- AI surface detection added for paths and manifests.
- Optional AI policy schema added to `psdm.config.json`.
- ADR accepted to keep PSDM as a governance layer instead of an AI observability platform.
- AI guardrail templates added for the `ai-agent` profile.
- Downstream GitHub Action validation protocol documented.
- GitHub Action downstream smoke blocker fixed by making `ADRs/` versionable during `psdm init` and avoiding validation-time report dirtying.
- `psdm init` idempotence fixed so PSDM-managed `AGENTS.md` does not trigger a false adoption plan.
- Downstream GitHub Action validation executed with pass and expected-fail workflow evidence.
- Example project fixture coverage added for a downstream-like Next.js SaaS/AI project.
- Public package release checklist documented.
- Package metadata gaps decided for beta: npm files allowlist added, public scoped publish configured, and private GitHub metadata deferred.
- Public npm release check automated through `npm run release:check` and CI.
- Final beta version string decided as `1.0.0-beta.1` with npm dist-tag `beta`.

## Active Milestone

`1.0.0-beta`: release readiness.

Goal:

Prepare PSDM for first reusable beta packaging without publishing until owner approval, npm authentication, and final release gates are satisfied.

Planned outcomes:

- Keep package metadata, versioning, tarball contents, and validation gates explicit.
- Preserve the governance-layer boundary for AI readiness and guardrails.
- Confirm downstream Action and local release checks before publication.
- Avoid publishing until owner approval and npm authentication are in place.

## Next Milestones

### `0.4.0-alpha`

- [x] Initialize PSDM governance artifacts for this repository.
- [x] Fill framework-specific `PROJECT_BRIEF`, `SPEC`, `ARCHITECTURE`, `TESTING`, `SECURITY`, `OPERATIONS`, and `DEPLOYMENT` docs.
- [x] Refine draft-marker detection for operational roadmap/task references.
- [x] Add pre-init audit for existing projects.
- [x] Add a validation profile that fits framework repositories.
- [x] Add PR checklist generation.

### `0.5.0-alpha`

- [x] Add non-destructive `psdm audit`.
- [x] Add `psdm init --dry-run`.
- [x] Add CLI fixtures for audit behavior.

### `0.6.0-alpha`

- [x] Add `psdm pr-checklist`.
- [x] Add CLI fixtures for checklist behavior.
- [x] Add a validation profile that fits framework repositories.

### `0.7.0-alpha`

- [x] Add fixtures for audit behavior.
- [x] Add fixtures for classify behavior.
- [x] Add fixtures for checklist behavior.
- [x] Add fixtures for validate behavior.
- [x] Add fixtures for custom config behavior.
- [x] Add fixtures for feature artifacts.

### `0.8.0-alpha`

- [x] Add a validation profile that fits framework repositories.
- [x] Document config schema stability rules.

### `0.9.0-alpha`

- [x] Add validation profiles.
- [x] Restore fresh-template review warnings for unresolved draft markers.

### `0.10.0-alpha`

- [x] Add formal validation for unsupported profiles.
- [x] Document config schema stability rules.
- [x] Require rationale for every final `Siguiente accion`.

### `0.11.0-alpha`

- [x] Add `psdm enforce`.
- [x] Add GitHub Action inputs for change-level enforcement.
- [x] Add CLI fixtures for enforcement pass/fail behavior.

### `0.12.0-alpha`

- [x] Add formal risk path schema validation.
- [x] Ignore malformed risk path rules during path matching.
- [x] Add CLI fixtures for invalid risk path behavior.

### `0.13.0-alpha`

- [x] Add `psdm adr`.
- [x] Add non-overwriting ADR scaffold generation.
- [x] Add CLI fixture for ADR generation.

### `0.14.0-alpha`

- [x] Detect existing AI governance during audit.
- [x] Create PSDM adoption plan when existing AI governance is detected.
- [x] Add CLI fixtures for AI governance detection and adoption plan creation.

### `0.15.0-alpha`

- [x] Define the AI readiness audit JSON contract.
- [x] Add AI surface detection for agents, RAG, prompts, embeddings, tools, provider SDKs, vector stores, and automation folders.
- [x] Add governance gap detection for guardrails, data classification, cost, latency, evals, prompt injection, PII, and tool security.
- [x] Add human-readable AI readiness output to `psdm audit`.
- [x] Add CLI fixtures for AI readiness audit behavior.

### `0.16.0-alpha`

- [x] Extend `psdm.config.json` with optional AI policy fields for PII, redaction, tool registry, cost budgets, latency SLOs, evals, and approval rules.
- [x] Add validation fixtures for invalid AI policy fields.

### `0.17.0-alpha`

- [x] Add AI guardrail templates for data classification, cost/latency budgets, prompt injection tests, and AI evals.
- [x] Add `ai-agent` profile fixture for AI guardrail artifact creation.
- [x] Accept ADR keeping PSDM as governance layer, not AI observability platform.

### `0.18.0-alpha`

- [ ] Add dependency-free AI security test harness fixtures for prompt injection, tool injection, context poisoning, memory poisoning, PII leakage, unsafe output, and tool escalation.

### `1.0.0-beta`

- [x] Change-level enforcement in CI.
- [x] Security-sensitive path rule validation.
- [x] ADR generator.
- [x] Tested fixtures for CLI behavior.
- [x] Prepare beta release notes.
- [x] Document downstream GitHub Action validation protocol.
- [x] Fix downstream Action smoke bootstrap issues found during first external run.
- [x] Fix false existing-governance detection on already initialized PSDM repositories.
- [x] Execute downstream GitHub Action validation.
- [x] Add example project fixture coverage.
- [x] Decide final beta version string and npm dist-tag.

### `1.0.0`

- [ ] Stable CLI API.
- [ ] Stable config schema.
- [x] Public package release checklist.
- [x] Decide package metadata gaps before beta.
- [x] Define public npm release automation.
- [x] Decide final beta version string and npm dist-tag.
- [ ] Public npm package readiness.
- [x] Documentation site or complete docs index.
- [x] Example project fixture coverage.

## Update Rule

Every implementation advance must update this file when it changes milestone status, scope, completed work, or the next recommended action.
