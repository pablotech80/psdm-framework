# CONFIG_SCHEMA.md

Status: `Active`
Project: `psdm-framework`

## Purpose

This document defines the stability contract for `psdm.config.json`.

The config file is the local policy surface for PSDM. It controls required governance artifacts, validation profiles, feature artifact layout, git dirty-state warnings, and risk path classification. The CLI must keep this schema predictable because users can depend on it from local scripts, GitHub Actions, and repository automation.

## Schema Version

Current schema version: `1`.

The `version` field identifies the config format. Version `1` supports additive evolution: new optional fields may be added when existing behavior stays compatible.

## Top-Level Fields

`version`

- Type: number.
- Default: `1`.
- Stability: stable.
- Meaning: identifies the config schema version.

`profile`

- Type: string.
- Default: `standard`.
- Stability: stable values are documented below.
- Meaning: selects a built-in profile preset.

`requiredArtifacts`

- Type: string array.
- Default: PSDM baseline artifacts.
- Stability: stable.
- Meaning: replaces the default baseline artifact list when present and non-empty.

`extraRequiredArtifacts`

- Type: string array.
- Default: empty array.
- Stability: stable.
- Meaning: adds project-specific artifacts without replacing the baseline.

`features.root`

- Type: string.
- Default: `docs/features`.
- Stability: stable.
- Meaning: root directory for feature-scoped artifacts.

`features.requiredArtifacts`

- Type: string array.
- Default: `PROJECT_BRIEF.md`, `SPEC.md`, `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`.
- Stability: stable.
- Meaning: files required inside each feature directory.

`git.warnOnDirty`

- Type: boolean.
- Default: `true`.
- Stability: stable.
- Meaning: controls whether validation warns on uncommitted changes.

`riskPaths`

- Type: object array.
- Default: backend, platform, AI, and CI risk rules.
- Stability: stable object shape.
- Meaning: raises the minimum change level when touched files match configured path patterns.

## Risk Path Object

`pattern`

- Type: string.
- Meaning: glob-like path pattern matched against changed files.

`minimumLevel`

- Type: string.
- Supported values: `Level 1`, `Level 2`, `Level 3`, `Level 4`.
- Meaning: minimum governance level when the pattern matches.

`requiredArtifacts`

- Type: string array.
- Meaning: artifacts expected for changes matching this risk path.

`reason`

- Type: string.
- Meaning: human-readable rationale for the rule.

## Supported Profiles

The supported profile values are:

- `standard`
- `framework`
- `backend-api`
- `ai-agent`
- `saas`
- `monorepo`

Profiles add preset required artifacts and risk paths for common repository types. Project config can still add explicit policy through `requiredArtifacts`, `extraRequiredArtifacts`, and `riskPaths`.

Unsupported profile values are validation failures. PSDM still includes the requested profile name and `recognized: false` in JSON output so automation can report the exact policy error.

## Compatibility Rules

Non-breaking changes:

- Adding optional config fields.
- Adding optional JSON metadata.
- Adding new supported profile values.
- Adding new default risk paths when user config does not replace them.
- Adding stricter validation only when the failure points to an invalid local policy value.

Breaking changes:

- Removing a documented field.
- Renaming a documented field.
- Changing an existing field type.
- Changing the meaning of a supported profile.
- Removing a supported profile.
- Changing JSON decision names or core validation result fields.

Breaking changes require a schema version change and release notes before adoption.

## JSON Output Contract

Validation JSON must keep the following config metadata:

- `config.path`
- `config.exists`
- `config.profile.name`
- `config.profile.recognized`
- `config.profile.requiredArtifacts`
- `config.profile.riskPaths`

Additional fields may be added when they do not alter existing field meaning.
