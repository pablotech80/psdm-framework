# PSDM Framework Roadmap

## MVP - 0.1

- [x] CLI scaffold.
- [x] Templates.
- [x] `psdm init`.
- [x] `psdm check`.
- [x] `psdm validate`.
- [x] `psdm classify`.
- [x] `psdm report`.

## Alpha - 0.2

- [ ] Better section validation.
- [x] JSON output mode.
- [x] Config file support: `psdm.config.json`.
- [x] Git dirty-state awareness.
- [x] Feature-specific artifact support.
- [ ] Prompt/template version metadata.
- [x] GitHub Action MVP.
- [x] Tool registry design draft.

## Alpha - 0.3

- [x] Backend/platform risk path rules.
- [x] File-aware classification with `--file` and `--files`.
- [ ] Change-level enforcement in CI.
- [ ] Security-sensitive file path rule validation.

## Alpha - 0.4

- [x] Repository-level `AGENTS.md`.
- [x] Root operational `ROADMAP.md` and `TODO.md`.
- [x] Self-governance `psdm.config.json`.
- [x] Framework-specific PSDM baseline artifacts.
- [x] Cleaner draft-marker detection for operational task files.
- [x] Pre-init audit for existing projects.
- [ ] Validation profile support.

## Alpha - 0.5

- [x] Non-destructive `psdm audit`.
- [x] `psdm init --dry-run`.
- [ ] Audit fixtures.

## Alpha - 0.6

- [x] Pull request checklist generator.
- [ ] Validation profile support.

## Alpha - 0.7

- [x] Audit fixtures.
- [x] Classify fixtures.
- [x] Checklist fixtures.
- [x] Validator/config fixtures.
- [x] Feature artifact fixtures.

## Alpha - 0.8

- [x] Validation profile support.
- [ ] Config schema stability docs.

## Alpha - 0.9

- [x] Validation profiles.
- [x] Fresh-template review warnings.

## Alpha - 0.10

- [x] Unsupported profile validation.
- [x] Config schema stability docs.

## Alpha - 0.11

- [x] `psdm enforce`.
- [x] GitHub Action change-level enforcement.
- [x] Enforcement fixtures.

## Alpha - 0.12

- [x] Risk path schema validation.
- [x] Invalid risk path fixture coverage.

## Alpha - 0.13

- [x] ADR generator.
- [x] ADR generation fixture coverage.

## Alpha - 0.14

- [x] Existing AI governance detection.
- [x] PSDM adoption plan generation.

## Alpha - 0.15

- [x] AI readiness audit contract.
- [x] AI surface detection for agents, RAG, prompts, embeddings, tools, provider SDKs, vector stores, and automation folders.
- [x] Governance gap detection for guardrails, data classification, cost, latency, evals, prompt injection, PII, and tool security.
- [x] Human-readable and JSON AI readiness report output.
- [x] AI readiness audit fixtures.

## Alpha - 0.16

- [x] Optional AI policy schema for PII, redaction, tool registry, cost budgets, latency SLOs, evals, and approval rules.
- [x] AI policy validation fixtures.

## Alpha - 0.17

- [x] AI guardrail templates for data classification, cost/latency budgets, prompt injection tests, and AI evals.
- [x] AI-agent profile creates AI guardrail artifacts.
- [x] ADR boundary: PSDM remains governance layer, not AI observability platform.

## Alpha - 0.18

- [ ] Dependency-free AI security test harness fixtures for prompt injection, tool injection, context poisoning, memory poisoning, PII leakage, unsafe output, and tool escalation.

## Beta - 1.0

- [x] Change-level enforcement in CI.
- [x] Security-sensitive file path rule validation.
- [x] ADR generator.
- [x] Beta release notes.
- [x] Downstream GitHub Action validation protocol.
- [x] Downstream Action smoke bootstrap fixes.
- [x] Idempotent init for PSDM-managed governance files.
- [x] Downstream GitHub Action validation executed.
- [x] Example project fixture coverage.
- [x] Public package release checklist.
- [x] Package metadata gap decisions before beta.
- [x] Public npm release check automation.
- [x] Final beta version string and npm dist-tag decision.
- [x] npm authentication for beta publish.
- [x] public repository readiness cleanup started.
- [x] public contribution, conduct, issue, and PR templates.
- [x] README branding and GitHub metadata guidance for public beta.
- [x] Model and tool independence documentation.
- [x] Model and tool independence rule in `AGENTS.md` template.
- [x] README table of contents.
- [x] README density, CLI grouping, minimal config example, footer, and publication checklist polish.
- [x] GitHub repository description, website, and topics configured.
- [x] Public security reporting policy documented.
- [x] CodeQL, dependency review, Dependabot config, GitHub security settings, and private vulnerability reporting.
- [x] npm trusted publishing/provenance plan and public package metadata.
- [x] release evidence, tag policy, and beta exit criteria.
- [x] npm scope ownership and package name under `@ptechsolution`.
- [x] protected npm trusted publishing workflow.
- [x] one-time manual bootstrap path after npm trusted publisher `E404`.
- [x] explicit owner approval for beta publish.
- [x] published npm beta package.
- [x] Git tag and GitHub pre-release.
- [x] published `1.0.0-beta.2` presentation-only beta refresh.
- [x] npm trusted publishing configured for future releases.
- [x] protected npm publish workflow dry-run mode and expected-version guard.
- [x] protected npm publish workflow dry-run executed successfully.
- [x] prepared `1.0.0-beta.3` candidate for trusted publishing validation.
- [x] verified `1.0.0-beta.3` through protected workflow dry-run.
- [x] published `1.0.0-beta.3` through protected trusted publishing workflow.
- [x] Knowledge as Code Layer documented as optional method guidance without adding runtime dependencies.
- [x] prepared `1.0.0-beta.4` candidate for Knowledge as Code documentation publication.
- [x] hardened release checker package manifest detection for protected npm workflow compatibility.
- [x] removed unconditional `npm@latest` upgrade from protected npm workflow.
- [x] verified `1.0.0-beta.4` through protected workflow dry-run.
- [x] published `1.0.0-beta.4` through protected trusted publishing workflow.
- [x] npm `latest` dist-tag follow-up resolved by aligning it with `1.0.0-beta.5`.

## v1.0

### Beta.6 Product Reset

- [x] Refocus Riscala on amplifying developer judgment while preserving PSDM as the reasoning method.
- [x] Define the repository-grounded Judgment Brief contract.
- [x] Define a minimal owner-controlled decision state and change envelope.
- [x] Define staged Decision Review against intent, scope, and evidence.
- [x] Support learning, balanced, concise, and JSON renderings.
- [x] Implement the first read-only Judgment Brief through `riscala impact` without mandatory initialization.
- [x] Add deterministic evidence and representative auth, data, delivery, AI, low-risk, and uncertainty reasoning.
- [x] Add first-use, authority-boundary, and explanation-density fixtures.
- [x] Implement advisory Change Envelope and staged Decision Review without simulating owner authority.
- [x] Detect scope drift, missing expected files, unexpected sensitive surfaces, and package dependency deltas.
- [x] Add aligned, drift, dependency, missing-scope, and no-staged-change fixtures.
- [x] Prove first value without mandatory initialization in greenfield and legacy repositories.
- [x] Reuse existing deterministic Git, risk-path, config, validation, and CI primitives.
- [x] Preserve `riscala`/`psdm`, config, JSON, package, and Action compatibility through the judgment-loop increments.
- [x] Record external greenfield and legacy validation evidence and corrections.
- [x] Realign public positioning, onboarding, help hierarchy, and shell guidance around developer judgment.
- [x] Pass an installed-tarball journey using only public documentation.
- [ ] Validate the complete loop before publishing `1.0.0-beta.6`.

Deferred from beta.6:

- SaaS and hosted state.
- Remote approval.
- Package or repository rename.
- Runtime vector, graph, or GraphRAG infrastructure.
- Additional templates, risk levels, or opaque scoring.

- [ ] Stable CLI API.
- [x] Staged Git change inspection with deterministic file and risk-path evidence.
- [x] Riscala product identity and PSDM compatibility boundary accepted.
- [x] Dual `riscala` and `psdm` executable compatibility.
- [x] Dependency-free interactive `riscala shell` MVP.
- [x] Agent Decision Protocol and human-presence approval architecture.
- [x] Level 3 default risk classification for root `AGENTS.md`.
- [x] Machine-readable Git commit action records and signed receipt verification before mutating slash commands.
- [x] Managed Git pre-commit enforcement with local replay persistence.
- [x] Level 3 default classification for approval, action-record, replay-enforcement, and Git-hook modules.
- [x] Ptech cyan terminal identity with TTY-safe ANSI output and monochrome fallback.
- [x] Interactive slash command palette with filtered keyboard navigation.
- [x] Consistent fixed-width result panels for shell status, inspection, help, and next-action guidance.
- [x] Read-only shell audit summary backed by the existing repository audit engine.
- [x] Product-facing shell audit semantics without changing the stable JSON contract.
- [x] Priority gap focus for incomplete AI projects with stable config-name preservation.
- [x] Read-only shell validation summary backed by the existing validator.
- [x] Full read-only shell command palette for diagnostics, reports, classification, PR checklist preparation, init preview, hook status, action records, and approval-boundary visibility.
- [x] `1.0.0-beta.5` protected publishing dry-run and real trusted publish for the Riscala shell.
- [x] Trusted owner public key enrollment.
- [x] Local managed hook activation and protected branch enforcement.
- [ ] Required remote approval check for content-bound Level 3/4 actions.
- [x] Full documentation index.
- [ ] Tested fixtures.
- [x] Public package release checklist.
- [x] Package metadata gap decisions before beta.
- [x] Public npm release check automation.
- [x] Final beta version string and npm dist-tag decision.
- [x] npm authentication for beta publish.
- [x] public repository readiness cleanup started.
- [x] public contribution, conduct, issue, and PR templates.
- [x] README branding and GitHub metadata guidance for public beta.
- [x] Model and tool independence documentation.
- [x] Model and tool independence rule in `AGENTS.md` template.
- [x] README table of contents.
- [x] README density, CLI grouping, minimal config example, footer, and publication checklist polish.
- [x] GitHub repository description, website, and topics configured.
- [x] Public security reporting policy documented.
- [x] CodeQL, dependency review, Dependabot config, GitHub security settings, and private vulnerability reporting.
- [x] npm trusted publishing/provenance plan and public package metadata.
- [x] release evidence, tag policy, and beta exit criteria.
- [x] npm scope ownership and package name under `@ptechsolution`.
- [x] protected npm trusted publishing workflow.
- [x] one-time manual bootstrap path after npm trusted publisher `E404`.
- [x] explicit owner approval for beta publish.
- [x] Public npm beta package.
- [x] Git tag and GitHub pre-release.
- [x] npm trusted publishing configured for future releases.
- [x] Knowledge as Code Layer documentation.
- [x] `1.0.0-beta.4` Knowledge as Code beta publication.
- [x] stale npm `latest` dist-tag resolved before stable release.
- [x] Example project fixture coverage.
- [ ] Runnable example projects.

## Enterprise Direction

- [ ] AI tool registry.
- [ ] Runtime guardrail policy model.
- [x] Governance-layer boundary instead of native AI observability platform.
- [ ] Prompt injection test harness.
- [ ] PII detection and redaction governance.
- [ ] Cost and latency budget governance.
- [ ] Security regression suite.
- [ ] SBOM and supply-chain guidance.
- [ ] Agent observability standard.
