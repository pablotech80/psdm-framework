# ROADMAP.md

Status: `Active`
Repository: `psdm-framework`
Last Updated: `2026-07-08`

## Purpose

Track the active delivery roadmap for the PSDM Framework.

This file is operational and must be updated with every meaningful project advance. The broader product roadmap remains in `docs/ROADMAP.md`; this root roadmap records the current execution state.

## Current State

PSDM is at `0.11.0-alpha`.

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
- Fresh-template review warnings restored for unresolved draft markers.

## Active Milestone

`0.11.0-alpha`: CI change-level enforcement.

Goal:

Make `psdm-framework` comply with its own governance model without turning development into heavy process.

Planned outcomes:

- Root `ROADMAP.md` and `TODO.md` kept current with every advance.
- Root `psdm.config.json`.
- Filled baseline PSDM artifacts for the framework itself.
- Clean self-validation path for the framework baseline.
- Non-destructive adoption audit for already-started projects.
- Pull request checklist generation from change level and risk paths.
- Dependency-free CLI fixtures for high-value workflows.
- Fixture coverage for initialized projects, custom config, and feature artifacts.
- Validation profiles for standard, framework, backend API, AI agent, SaaS, and monorepo repositories.
- Formal validation for unsupported profile values.
- Stable config schema documentation.
- Final-response rule requiring next-action rationale.
- CI gate that fails when a classified change exceeds the configured maximum level.
- Validation policy that distinguishes framework source docs from generated project artifacts.
- PR/checklist workflow for risky backend/platform changes.

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

### `1.0.0-beta`

- [x] Change-level enforcement in CI.
- [ ] Security-sensitive path rule validation.
- [ ] ADR generator.
- [ ] Tested fixtures for CLI behavior.

### `1.0.0`

- [ ] Stable CLI API.
- [ ] Stable config schema.
- [ ] Public npm package readiness.
- [ ] Documentation site or complete docs index.

## Update Rule

Every implementation advance must update this file when it changes milestone status, scope, completed work, or the next recommended action.
