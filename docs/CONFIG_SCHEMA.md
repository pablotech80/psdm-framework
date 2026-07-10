# CONFIG_SCHEMA.md

Status: `Active`
Project: `psdm-framework`

## Purpose

This document defines the stability contract for `psdm.config.json`.

The config file is the local policy surface for PSDM. It controls required governance artifacts, validation profiles, feature artifact layout, git dirty-state warnings, AI policy declarations, approval trust, and risk path classification. The CLI must keep this schema predictable because users can depend on it from local scripts, GitHub Actions, and repository automation.

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

`ai`

- Type: object.
- Default: object with all AI policy values set to `null`.
- Stability: stable object shape.
- Meaning: declares repository-level AI policy for PII, redaction, cost, latency, tool registry, evals, prompt-injection testing, and approval rules.

`riskPaths`

- Type: object array.
- Default: backend, platform, AI, and CI risk rules.
- Stability: stable object shape.
- Meaning: raises the minimum change level when touched files match configured path patterns.

`approval`

- Type: object.
- Default: Level 3 and Level 4 require approval, 600-second maximum receipt lifetime, no action-specific requirements, and no trusted approvers.
- Stability: additive version `1` object shape.
- Meaning: declares when signed approval is required and pins the public trust material allowed to verify it.

## Approval Policy Object

`approval.requiredLevels`

- Type: change-level string array.
- Must include: `Level 3` and `Level 4`.
- Meaning: change classifications that require signed approval. Lower levels may be added for stricter projects.

`approval.requiredActions`

- Type: non-empty string array.
- Default: empty array.
- Meaning: actions that always require approval regardless of classified level. The implemented action identifier is `git.commit`.

`approval.maxReceiptAgeSeconds`

- Type: integer from `60` through `86400`.
- Default: `600`.
- Meaning: maximum permitted interval between receipt issue and expiry.

`approval.trustedApprovers`

- Type: object array.
- Default: empty array.
- Meaning: public identities permitted to approve configured actions. An empty collection makes a required approval policy incomplete and action preparation fails closed.

Each trusted approver requires:

- `id`: unique non-empty identifier;
- `publicKeyPath`: PEM public-key path relative to the config file or absolute;
- `publicKeyFingerprint`: `sha256:` followed by 64 lowercase hexadecimal characters;
- `approvalModes`: non-empty array containing `hardware-signature` or `remote-approval`.

The `phrase` mode is intentionally unsupported for signed high-risk receipts.

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

Malformed risk path rules are validation failures. Classification ignores malformed rules so an invalid config does not crash path matching.

## AI Policy Object

All AI policy fields are optional. `null` means the project has not declared a policy for that field yet. Declaring a field with the wrong type is a validation failure on `psdm.config.json`.

`ai.pii.allowedInPrompts`

- Type: boolean or null.
- Meaning: whether prompts may contain PII or private customer data.

`ai.pii.redactionRequired`

- Type: boolean or null.
- Meaning: whether PII or private data must be redacted before prompt, log, doc, or eval use.

`ai.cost.maxUsdPerRequest`

- Type: positive number or null.
- Meaning: maximum expected provider cost per AI request.

`ai.cost.monthlyBudgetUsd`

- Type: positive number or null.
- Meaning: monthly AI provider budget for the project or service.

`ai.latency.p95Ms`

- Type: positive number or null.
- Meaning: expected p95 latency SLO for AI requests in milliseconds.

`ai.tools.registryRequired`

- Type: boolean or null.
- Meaning: whether AI-accessible tools must be documented in a tool registry.

`ai.tools.humanApprovalForExternalActions`

- Type: boolean or null.
- Meaning: whether externally visible, mutating, production, payment, data, or communication actions require human approval.

`ai.evals.required`

- Type: boolean or null.
- Meaning: whether AI behavior requires an eval suite before release.

`ai.security.promptInjectionTestsRequired`

- Type: boolean or null.
- Meaning: whether prompt-injection and indirect prompt-injection tests are required.

## Supported Profiles

The supported profile values are:

- `standard`
- `framework`
- `backend-api`
- `ai-agent`
- `saas`
- `monorepo`

Profiles add preset required artifacts and risk paths for common repository types. Project config can still add explicit policy through `requiredArtifacts`, `extraRequiredArtifacts`, and `riskPaths`.

The `ai-agent` profile adds AI guardrail artifacts for guardrails, data classification, cost and latency budgets, prompt-injection tests, and eval governance.

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
- `config.ai`
- `config.approval`

Additional fields may be added when they do not alter existing field meaning.
