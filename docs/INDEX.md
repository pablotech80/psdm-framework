# INDEX.md

Status: `Active`
Project: `psdm-framework`

## Purpose

This index is the public documentation entrypoint for PSDM Framework.

Use it to find the right document by task: adopting PSDM in an existing project, configuring governance policy, using the CLI, adding CI enforcement, understanding risk levels, or preparing a release.

## Start Here

- `README.md`: quick start, CLI overview, configuration example, GitHub Action usage.
- `docs/PSDM_OVERVIEW.md`: method overview and governance model.
- `docs/KNOWLEDGE_AS_CODE.md`: optional Knowledge as Code Layer for versioning intent, decisions, rules, prompts, workflows, verification criteria, and evolution notes.
- `docs/PROJECT_BRIEF.md`: project purpose, audience, and success criteria.
- `docs/BETA_RELEASE_NOTES.md`: beta release scope, validation, limitations, and exit criteria.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`: public collaboration and reporting expectations.

## Adoption

- `README.md`: local installation and basic commands.
- `docs/PSDM_OVERVIEW.md`: why PSDM exists and how governance scales by risk.
- `docs/MODEL_AND_TOOL_INDEPENDENCE.md`: how PSDM coexists with Claude, Cursor, Copilot, Codex, skills, prompts, and other AI tooling.
- `docs/KNOWLEDGE_AS_CODE.md`: how Git-backed Markdown/YAML remains the knowledge source of truth while RAG, Knowledge Graphs, GraphRAG, Obsidian, and runtime indexes stay optional.
- `docs/CHANGE_LEVELS.md`: Level 0 through Level 4 definitions.
- `docs/RISK_PATHS.md`: path-aware classification rules.
- `examples/nextjs-saas/README.md`: downstream-like SaaS/AI fixture coverage.

Recommended adoption flow:

```bash
psdm audit
psdm init
psdm check
psdm validate
```

Use `psdm audit` first for existing repositories because it previews files that would be created or skipped.

When `psdm audit` detects existing AI governance files, `psdm init` creates `docs/PSDM_ADOPTION.md` from `templates/PSDM_ADOPTION.md` instead of overwriting existing instructions.

## CLI Reference

- `README.md`: supported commands and examples.
- `docs/SPEC.md`: functional requirements and acceptance criteria.
- `docs/TESTING.md`: validation commands and regression expectations.

Current commands:

- `psdm audit`
- `psdm adr`
- `psdm init`
- `psdm check`
- `psdm validate`
- `psdm classify`
- `psdm enforce`
- `psdm pr-checklist`
- `psdm report`

## Configuration

- `docs/CONFIG_SCHEMA.md`: stable `psdm.config.json` contract.
- `templates/psdm.config.json`: generated config template.
- `docs/RISK_PATHS.md`: `riskPaths` schema and matching behavior.

Key policy concepts:

- validation profiles;
- required baseline artifacts;
- feature-scoped artifacts;
- risk path rules;
- git dirty-state awareness;
- config schema versioning.

## Governance

- `AGENTS.md`: agent operating rules for this repository.
- `docs/CHANGE_GOVERNANCE.md`: change levels, required artifacts, stop conditions, and CI enforcement.
- `docs/ARCHITECTURE.md`: module boundaries and architecture gate.
- `docs/SECURITY.md`: threat model and security gate.
- `docs/AI_AGENT_SECURITY.md`: AI-agent and tool-use security expectations.
- `docs/AI_READINESS_AUDIT.md`: `psdm audit --json` contract for AI readiness signals and governance gaps.
- `docs/MODEL_AND_TOOL_INDEPENDENCE.md`: model-neutral governance and tool-specific adapter guidance.
- `docs/KNOWLEDGE_AS_CODE.md`: source-of-truth and runtime-index boundaries for governed project knowledge.
- `docs/TOOL_REGISTRY.md`: tool registry direction.
- `ADRs/README.md`: ADR usage guidance.

Use `psdm adr "<decision title>"` when a Level 3 or Level 4 change creates or reverses a durable architecture, security, CI, deployment, config, or governance decision.

## CI And Release

- `action.yml`: composite GitHub Action metadata.
- `docs/DOWNSTREAM_ACTION_VALIDATION.md`: downstream GitHub Action smoke-test protocol.
- `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`: manual package publication readiness gate.
- `docs/NPM_TRUSTED_PUBLISHING.md`: trusted publishing and provenance plan.
- `docs/RELEASE_EVIDENCE.md`: release evidence, tag policy, and beta exit criteria.
- `docs/PUBLICATION_CHECKLIST.md`: final public repository metadata checklist.
- `docs/PUBLIC_REPOSITORY_READINESS.md`: public repository presentation and privacy gate.
- `docs/DEPLOYMENT.md`: packaging and publication gate.
- `docs/OPERATIONS.md`: operational signals and maintenance expectations.
- `docs/BETA_RELEASE_NOTES.md`: beta release readiness and exit criteria.

CI policy flow:

```bash
psdm validate . --json
psdm enforce "change description" --files "src/index.mjs" --max-level "Level 2" --json
```

## Artifact Templates

- `templates/AGENTS.md`
- `templates/AI_GUARDRAILS.md`
- `templates/AI_EVALS.md`
- `templates/PROJECT_BRIEF.md`
- `templates/PSDM_ADOPTION.md`
- `templates/DATA_CLASSIFICATION.md`
- `templates/COST_LATENCY_BUDGET.md`
- `templates/PROMPT_INJECTION_TESTS.md`
- `templates/SPEC.md`
- `templates/ARCHITECTURE.md`
- `templates/CHANGE_GOVERNANCE.md`
- `templates/TASKS.md`
- `templates/TESTING.md`
- `templates/DEPLOYMENT.md`
- `templates/SECURITY.md`
- `templates/OPERATIONS.md`
- `templates/ADR.md`
- `templates/ADRS_README.md`
- `templates/psdm.config.json`

Templates are intentionally plain Markdown and JSON so teams can adapt them without additional tooling.

## Maintainer Workflow

- `ROADMAP.md`: current execution state.
- `TODO.md`: current next task and completed work log.
- `docs/ROADMAP.md`: broader product roadmap.
- `docs/TASKS.md`: operational task workflow.
- `docs/BETA_RELEASE_NOTES.md`: release readiness record.
- `CONTRIBUTING.md`: contribution expectations.
- `CODE_OF_CONDUCT.md`: public conduct expectations.
- `SECURITY.md`: vulnerability reporting policy.

Before merging meaningful changes, keep `ROADMAP.md` and `TODO.md` current and run the validation commands listed in `docs/TESTING.md`.
