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

- [ ] AI guardrail templates for data classification, cost/latency budgets, prompt injection tests, and AI evals.

## Alpha - 0.18

- [ ] Dependency-free AI security test harness fixtures for prompt injection, tool injection, context poisoning, memory poisoning, PII leakage, unsafe output, and tool escalation.

## Beta - 1.0

- [x] Change-level enforcement in CI.
- [x] Security-sensitive file path rule validation.
- [x] ADR generator.
- [x] Beta release notes.

## v1.0

- [ ] Stable CLI API.
- [x] Full documentation index.
- [ ] Tested fixtures.
- [ ] Public npm package.
- [ ] Example projects.

## Enterprise Direction

- [ ] AI tool registry.
- [ ] Runtime guardrail policy model.
- [ ] Prompt injection test harness.
- [ ] PII detection and redaction governance.
- [ ] Cost and latency budget governance.
- [ ] Security regression suite.
- [ ] SBOM and supply-chain guidance.
- [ ] Agent observability standard.
