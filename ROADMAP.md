# ROADMAP.md

Status: `Active`
Repository: `psdm-framework`
Last Updated: `2026-07-11`

## Purpose

Track the active delivery roadmap for the PSDM Framework.

This file is operational and must be updated with every meaningful project advance. The broader product roadmap remains in `docs/ROADMAP.md`; this root roadmap records the current execution state.

## Current State

PSDM is published at `1.0.0-beta.5`; npm dist-tags `beta` and `latest` point to `1.0.0-beta.5`.

Riscala has entered a Product Reset for `1.0.0-beta.6`. The new North Star is developer judgment amplification: repository-grounded impact before implementation, explicit developer decisions, and staged verification against accepted intent and scope. Existing governance, Git, JSON, CI, approval, and compatibility primitives remain available but no longer define the primary daily experience.

Completed:

- Accepted the beta.6 Product Reset: PSDM remains the reasoning method, Riscala amplifies developer judgment, `AGENTS.md` adapts execution, and the developer retains final authority.
- Defined the beta.6 judgment domain, trust model, Judgment Brief, owner-controlled Change Envelope, staged Decision Review, explanation-density modes, and greenfield/legacy boundaries.
- Stale npm `latest` dist-tag resolved by aligning it with `1.0.0-beta.5` after registry removal attempts were rejected.
- README hero updated to the Riscala product identity while preserving PSDM as the internal governance method.
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
- Beta pre-publish check passed release validation but is blocked on npm authentication and explicit publish approval.
- npm CLI authentication configured; publish dry-run passed after normalizing `bin.psdm`.
- Public repository readiness started: private downstream evidence sanitized, social contribution files added, and package dry-run revalidated.
- Public beta presentation polish started: README branding, logo reference, GitHub metadata guidance, and asset packaging added.
- Model and tool independence documented so PSDM remains neutral across Claude, Cursor, Copilot, Codex, skills, prompts, and agents.
- Model and tool independence added to the generated `AGENTS.md` template and repository agent rules.
- README navigation improved with a public-facing table of contents.
- Final README density, CLI grouping, minimal config example, footer, and publication metadata checklist polished for public beta.
- GitHub repository description, website, and topics configured for public beta presentation.
- Public security reporting policy documented for beta trust readiness.
- Automated security checks added: CodeQL, dependency review, Dependabot config, secret scanning, push protection, Dependabot security updates, and private vulnerability reporting.
- npm trusted publishing/provenance plan documented and public npm metadata added.
- Release evidence, tag policy, and beta exit criteria documented.
- npm scope ownership confirmed for `@ptechsolution`; package scope updated from unavailable `@ptech`.
- Protected npm trusted publishing workflow added for first beta publication.
- One-time manual bootstrap path accepted for `1.0.0-beta.1` after npm trusted publisher `E404`, pending explicit publish approval.
- `@ptechsolution/psdm-framework@1.0.0-beta.1` published to npm and verified with clean install.
- Git tag and GitHub pre-release `v1.0.0-beta.1` created.
- `1.0.0-beta.2` published as a presentation-only beta refresh without CLI behavior changes.
- npm trusted publishing configured for future releases.
- Protected npm publish workflow dry-run mode and expected-version guard added.
- Protected npm publish workflow dry-run executed successfully.
- `1.0.0-beta.3` candidate prepared for trusted publishing validation.
- Protected npm publish workflow dry-run passed for `1.0.0-beta.3`.
- `1.0.0-beta.3` published through protected trusted publishing workflow.
- Public README install path now promotes npm `@beta` first, with local checkout installation kept as the development path.
- GitHub social preview image asset prepared at `assets/psdm-social-preview.png`.
- GitHub social preview image configured in repository settings.
- Knowledge as Code Layer documented as a transversal PSDM method layer without adding runtime or tooling dependencies.
- `1.0.0-beta.4` candidate prepared to publish Knowledge as Code documentation to npm beta.
- Release checker npm pack parsing made compatible with npm dry-run JSON output used by the protected publish workflow.
- Release checker npm pack manifest detection hardened for wrapped JSON output from newer npm versions in CI.
- Protected npm workflow now uses the runner-provided npm when it satisfies trusted publishing requirements instead of upgrading unconditionally to `npm@latest`.
- Protected npm publish workflow dry-run passed for `1.0.0-beta.4`.
- `1.0.0-beta.4` published through protected trusted publishing workflow.
- Git tag and GitHub pre-release `v1.0.0-beta.4` created.
- Clean install from npm `@beta` verified for `1.0.0-beta.4`.
- Dependency-free `psdm inspect --staged` added with deterministic Git evidence, a Level 1 floor, risk-path elevation, and JSON output.
- Staged inspection fixture coverage added for risk elevation, the Level 1 floor, renames, an empty Git index, and non-Git targets.
- Riscala accepted as the product-facing identity, with AI Code Governance for Software Delivery as the category and PSDM preserved as the method.
- Staged Riscala brand migration plan documented without changing runtime, package, config, or JSON contracts.
- Riscala Phase 1 implemented with dual executable aliases, shared entrypoint, product headers, and installed-package parity validation.
- Agent Decision Protocol accepted: agents must justify meaningful mutations and cannot authorize their own high-risk actions.
- Content-bound approval receipt and human-presence architecture documented before mutating shell commands.
- Repository and generated `AGENTS.md` rules updated with why, expected improvement, evidence, and next-action rationale requirements.
- Root `AGENTS.md` added as a default Level 3 risk path with regression coverage.
- Dependency-free `riscala shell` MVP implemented with target-specific context, read-only slash-command routing, and explicit mutation blocking.
- Git porcelain parsing corrected so the first unstaged record is not misreported as staged in shell status.
- Git commit action records implemented with repository, branch, binary staged diff, classification, and approval-policy binding.
- Detached approval receipt verification implemented with trusted approver fingerprints, strong modes, expiry, and live-content invalidation.
- Managed pre-commit enforcement implemented with one-time local receipt consumption, exclusive locking, and unmanaged-hook preservation.
- Local hook enforcement explicitly bounded as defense in depth; protected remote checks remain required against unrestricted agents.
- Approval, action-record, replay, and Git-hook implementation paths classified as Level 3 by default.
- Riscala shell visual identity aligned with Ptech cyan, semantic TTY colors, `NO_COLOR`, and a branded prompt without installation scripts.
- Dependency-free slash command palette added with filtering, keyboard navigation, completion, and TTY-safe raw-mode restoration.
- Shell command results unified into fixed-width product panels with wrapped evidence, semantic states, and contextual next actions.
- Read-only `/audit` added to the shell by reusing the existing adoption and AI-readiness audit engine.
- Shell audit copy refined from internal field values into current-state, product-facing Riscala language.
- Incomplete AI-project audit output now surfaces priority gaps while preserving stable PSDM artifact names.
- Read-only `/validate` added to the shell by reusing the existing validator and prioritizing failed artifacts.
- Riscala shell expanded into a fuller read-only governance console with `/check`, `/report`, `/classify`, `/pr-checklist`, `/init-preview`, `/hook-status`, `/action`, and `/approval`.
- `1.0.0-beta.5` release candidate preparation started to publish the Riscala executable and complete interactive shell through npm beta.
- First owner public key enrolled for content-bound Level 3/4 approval verification.
- `1.0.0-beta.5` published through protected trusted publishing and verified with clean npm install.
- Local managed pre-commit hook activated for this checkout.
- GitHub branch protection enabled for `main` in solo-maintainer mode with strict `validate-framework` and `Analyze JavaScript` checks, admin enforcement, conversation resolution, and blocked force pushes/deletions.
- Public documentation aligned with the published `1.0.0-beta.5` Riscala executable and the solo-maintainer/team governance distinction.

## Active Milestone

`1.0.0-beta.6`: developer-judgment vertical slice.

Goal:

Deliver the first complete Riscala judgment loop for greenfield and legacy repositories without turning project-lifecycle governance into daily developer friction.

Planned outcomes:

- Produce a repository-grounded Judgment Brief before implementation.
- Separate observed facts, inferences, options, recommendations, uncertainty, and developer decisions.
- Represent accepted intent and scope in a minimal, tool-neutral change envelope.
- Compare staged implementation with the accepted decision and required evidence.
- Support `learn`, `balanced`, `concise`, and JSON output without changing safety semantics.
- Provide first value without mandatory `init` or a complete PSDM artifact set.
- Validate the flow in at least one greenfield and one legacy project.
- Preserve existing executable, config, JSON, CI, and package compatibility.
- Keep SaaS, remote approval, package migration, repository rename, and runtime knowledge infrastructure out of beta.6.

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
- [x] Configure npm authentication for beta publish.
- [x] Start public repository readiness cleanup.
- [x] Add public contribution, conduct, issue, and PR templates.
- [x] Add README branding and GitHub metadata guidance for public beta.
- [x] Document model and tool independence for project customization.
- [x] Add model and tool independence rule to `AGENTS.md` template.
- [x] Add README table of contents for public navigation.
- [x] Polish README density, CLI groups, configuration section, footer, and publication checklist.
- [x] Configure GitHub repository description, website, and topics.
- [x] Document public security reporting policy.
- [x] Add CodeQL, dependency review, Dependabot config, and GitHub security settings.
- [x] Add npm trusted publishing/provenance plan and public package metadata.
- [x] Define release evidence, tag policy, and beta exit criteria.
- [x] Confirm npm scope ownership and package name under `@ptechsolution`.
- [x] Add protected npm trusted publishing workflow.
- [x] Decide one-time manual bootstrap path after npm trusted publisher `E404`.
- [x] Record explicit owner approval for beta publish.
- [x] Publish `@ptechsolution/psdm-framework@1.0.0-beta.1`.
- [x] Create Git tag and GitHub pre-release `v1.0.0-beta.1`.
- [x] Publish `@ptechsolution/psdm-framework@1.0.0-beta.2`.
- [x] Create Git tag and GitHub pre-release `v1.0.0-beta.2`.
- [x] Configure npm trusted publishing for future releases.
- [x] Add protected workflow dry-run mode and expected-version guard.
- [x] Verify protected npm publish workflow in dry-run mode.
- [x] Prepare `1.0.0-beta.3` candidate for trusted publishing validation.
- [x] Verify `1.0.0-beta.3` through protected workflow dry-run.
- [x] Publish `@ptechsolution/psdm-framework@1.0.0-beta.3` through trusted publishing.
- [x] Create Git tag and GitHub pre-release `v1.0.0-beta.3`.
- [x] Promote npm `@beta` as the primary public install command in README.
- [x] Prepare GitHub social preview image asset.
- [x] Upload GitHub social preview image in repository settings.
- [x] Document Knowledge as Code Layer as optional method guidance.
- [x] Prepare `1.0.0-beta.4` candidate for Knowledge as Code documentation publication.
- [x] Fix release checker package dry-run parsing for protected npm workflow.
- [x] Harden release checker package manifest detection for protected npm workflow compatibility.
- [x] Remove unconditional `npm@latest` upgrade from protected npm workflow.
- [x] Verify protected npm publish workflow dry-run for `1.0.0-beta.4`.
- [x] Publish `@ptechsolution/psdm-framework@1.0.0-beta.4` through trusted publishing.
- [x] Create Git tag and GitHub pre-release `v1.0.0-beta.4`.
- [x] Verify clean install from npm `@beta` for `1.0.0-beta.4`.
- [x] Resolve npm `latest` dist-tag follow-up by aligning `latest` with `1.0.0-beta.5`.

### `1.0.0`

- [ ] Stable CLI API.
- [x] Staged Git change inspection with explainable risk-path evidence.
- [x] Accept Riscala product identity and compatibility boundaries.
- [x] Add the `riscala` executable alias with `psdm` parity before interactive CLI work.
- [x] Design and implement the dependency-free `riscala shell` MVP.
- [x] Define agent decision and human-presence approval architecture.
- [x] Implement machine-readable action records and receipt verification before mutating slash commands.
- [x] Implement managed pre-commit receipt enforcement with local replay protection.
- [x] Enroll a real owner public key.
- [x] Activate local hook and protected branch enforcement.
- [x] Document solo-maintainer versus team governance mode.
- [ ] Add a required remote approval check for content-bound Level 3/4 actions.
- [ ] Stable config schema.
- [x] Public package release checklist.
- [x] Decide package metadata gaps before beta.
- [x] Define public npm release automation.
- [x] Decide final beta version string and npm dist-tag.
- [x] Configure npm authentication for beta publish.
- [x] Start public repository readiness cleanup.
- [x] Add public contribution, conduct, issue, and PR templates.
- [x] Add README branding and GitHub metadata guidance for public beta.
- [x] Document model and tool independence for project customization.
- [x] Add model and tool independence rule to `AGENTS.md` template.
- [x] Add README table of contents for public navigation.
- [x] Polish README density, CLI groups, configuration section, footer, and publication checklist.
- [x] Configure GitHub repository description, website, and topics.
- [x] Document public security reporting policy.
- [x] Add CodeQL, dependency review, Dependabot config, and GitHub security settings.
- [x] Add npm trusted publishing/provenance plan and public package metadata.
- [x] Define release evidence, tag policy, and beta exit criteria.
- [x] Confirm npm scope ownership and package name under `@ptechsolution`.
- [x] Add protected npm trusted publishing workflow.
- [x] Decide one-time manual bootstrap path after npm trusted publisher `E404`.
- [x] Record explicit owner approval for beta publish.
- [x] Public npm package readiness for beta.
- [x] Create Git tag and GitHub pre-release `v1.0.0-beta.1`.
- [x] Configure npm trusted publishing for future releases.
- [x] Resolve stale npm `latest` dist-tag before stable release.
- [x] Documentation site or complete docs index.
- [x] Example project fixture coverage.

## Update Rule

Every implementation advance must update this file when it changes milestone status, scope, completed work, or the next recommended action.
