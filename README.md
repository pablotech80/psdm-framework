<p align="center">
  <img src="./assets/riscala-hero.jpg" alt="Riscala — AI Code Governance for Software Delivery" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/npm-beta-cb3837" alt="npm beta" />
  <img src="https://img.shields.io/npm/dw/%40ptechsolution%2Fpsdm-framework?label=downloads" alt="npm weekly downloads" />
  <img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT license" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-339933" alt="Node.js >=20.0.0" />
  <img src="https://img.shields.io/badge/GitHub%20Action-ready-2088ff" alt="GitHub Action" />
</p>

<p align="center">
  <strong>Govern every change at the right level.</strong>
</p>

<p align="center">
  Govern AI-assisted software delivery with specification, architecture, risk-based controls, and production-ready governance.
</p>

Riscala is the product-facing CLI powered by the PSDM governance method. It helps repositories, teams, developers, AI agents, technical leads, and product teams keep delivery controlled while moving quickly.

AI-assisted development is fast, but speed without governance creates risk.

Riscala uses PSDM to decide how much process a change needs based on risk: small safe changes stay fast; security, data, AI, infrastructure, and production-sensitive changes get stronger governance.

Riscala is currently beta software and is still distributed through the compatibility package `@ptechsolution/psdm-framework`. It is a local CLI and GitHub Action, not a hosted platform.

Try the currently published beta with the compatibility executable:

```bash
npm install -g @ptechsolution/psdm-framework@beta
riscala audit
```

The compatibility executable remains available:

```bash
psdm audit
```

## Table Of Contents

- [Why PSDM Exists](#why-psdm-exists)
- [Governance Flow](#governance-flow)
- [What PSDM Provides](#what-psdm-provides)
- [Status](#status)
- [Install](#install)
- [CLI](#cli)
- [Quick Start](#quick-start)
- [Model And Tool Independence](#model-and-tool-independence)
- [Knowledge As Code Layer](#knowledge-as-code-layer)
- [Common Workflows](#common-workflows)
- [Local Validation](#local-validation)
- [Contributing And Security](#contributing-and-security)
- [What PSDM Is Not](#what-psdm-is-not)
- [Examples](#examples)
- [Configuration](#configuration)
- [Feature Artifacts](#feature-artifacts)
- [Backend And Platform Governance](#backend-and-platform-governance)
- [Change Levels](#change-levels)
- [Production Gate](#production-gate)
- [GitHub Action](#github-action)
- [Design Principles](#design-principles)
- [Current Limitations](#current-limitations)

## Why PSDM Exists

AI can generate code quickly. Repositories still need durable context: product intent, specifications, architecture decisions, test expectations, security boundaries, deployment rules, and operational ownership.

PSDM gives AI-assisted teams a repeatable governance layer. It helps developers, AI agents, technical leads, and product teams classify change risk, create the right artifacts, and keep delivery controlled without forcing heavyweight process onto small changes.

## Governance Flow

```mermaid
flowchart TD
    A[Idea or Change] --> B[Risk Classification]
    B --> C{Change Level}
    C -->|Level 0-1| D[Fast Path]
    C -->|Level 2| E[Product Spec + Tests]
    C -->|Level 3| F[Security / Data / AI Governance]
    C -->|Level 4| G[Deployment / Operations / Rollback]
    D --> H[Validate]
    E --> H
    F --> H
    G --> H
    H --> I[Controlled Delivery]
```

## What PSDM Provides

- Repository audit before adoption.
- Governance templates for specs, architecture, security, testing, deployment, operations, and ADRs.
- Change-level classification from descriptions and touched paths.
- Staged Git change inspection with deterministic file and risk-path evidence.
- CI enforcement for maximum allowed change level.
- AI readiness checks for guardrails, data classification, cost, latency, evals, prompt injection, PII, and tool security.
- AI-agent governance templates for projects using LLMs, tools, prompts, RAG, or automation.
- Agent Decision Protocol separating agent justification and execution from content-bound human approval.
- Knowledge as Code guidance for versioning intent, decisions, rules, prompts, workflows, verification criteria, and evolution notes.
- JSON output for automation and GitHub Action workflows.
- Public beta release gates for package contents, docs, and repository readiness.

## Status

Latest published beta: `1.0.0-beta.5`.

Current `main` is developing the beta.6 Product Reset: Riscala now centers repository-grounded technical judgment before implementation while preserving the existing PSDM compatibility surface.

## Install

Install the published beta from npm:

```bash
npm install -g @ptechsolution/psdm-framework@beta
```

Then run:

```bash
riscala help
```

The existing `psdm` executable remains supported with identical commands and behavior during the Riscala migration. Both `riscala help` and `psdm help` work from the npm beta package.

For development from this checkout:

```bash
npm install -g .
```

Then run:

```bash
riscala help
```

The command reference below uses the primary `riscala` executable. Use `psdm` only when compatibility with older automation is needed; command behavior is identical.

## CLI

### Technical Judgment (beta.6 development)

Build a read-only Judgment Brief from a proposed change without initializing PSDM artifacts:

```bash
riscala impact "add Google OAuth login while preserving passwords"
```

Adjust explanation density without changing the underlying facts or safety semantics:

```bash
riscala impact "add Google OAuth login" --guidance learn
riscala impact "add Google OAuth login" --guidance balanced
riscala impact "add Google OAuth login" --guidance concise
riscala impact "add Google OAuth login" --json
```

The brief separates observed repository evidence, inferred impact, options, advisory recommendation, uncertainty, and decisions reserved for the developer. `impact` is read-only, does not require `riscala init`, and never creates or simulates an owner decision.

After implementation, compare a CLI-declared expected file scope with the real Git index:

```bash
git add src/auth/login.mjs tests/auth/login.test.mjs
riscala review "add Google OAuth login" --staged \
  --files src/auth/login.mjs,tests/auth/login.test.mjs
```

`review` reports staged files outside the declared scope, expected files that are missing, unexpected auth/schema/AI/config/deployment surfaces, package dependency changes, and the absence of supplied validation results. The Change Envelope is an advisory CLI input with `authorityVerified: false`; Decision Review never approves, commits, or establishes human authority.

### Repository

```bash
riscala audit [target] [--json] [--feature <name>] [--config <path>]
riscala check [target] [--json] [--feature <name>] [--config <path>]
riscala validate [target] [--json] [--feature <name>] [--config <path>]
riscala report [target] [--json] [--feature <name>] [--config <path>]
riscala inspect --staged [--json] [--target <path>] [--config <path>]
```

### Interactive Shell

```bash
riscala shell [target] [--config <path>]
riscala action prepare git.commit [--target <path>] [--config <path>] [--json]
riscala approval verify git.commit --receipt <path> [--target <path>] [--config <path>] [--json]
riscala approval enforce git.commit [--receipt <path>] [--target <path>] [--config <path>] [--json]
riscala hook <install|remove|status> pre-commit [--target <path>] [--json]
```

The dependency-free shell shows the selected project's name, branch, working-tree counts, and active PSDM policy. It is intentionally read-only while still exposing the main governance workflow:

```text
/help
/status
/audit
/check
/validate
/report
/inspect
/classify <change description>
/pr-checklist <change description>
/init-preview
/hook-status
/action
/approval
/exit
```

Interactive terminals use Ptech cyan (`#00A8E8`) with a light accent (`#38BDF8`) for the Riscala frame and prompt. Color is automatically disabled for pipes, non-TTY output, `TERM=dumb`, and the `NO_COLOR` convention.

Type `/` at the interactive prompt to open the dependency-free command palette. Filter by typing, navigate with `↑`/`↓`, run with `Enter`, complete with `Tab`, and dismiss with `Esc`. Piped sessions preserve the original line-oriented behavior.

Shell commands use the same fixed-width result panels. Each result has a clear title, semantic state, and a contextual next action where useful, so repeated commands remain visually consistent without changing the read-only security boundary. `/audit` and `/init-preview` reuse the existing non-destructive audit engine. `/check`, `/validate`, and `/report` summarize baseline readiness. `/classify` and `/pr-checklist` prepare governance decisions from a described change. `/hook-status`, `/action`, and `/approval` expose the approval boundary without creating receipts, installing hooks, committing, pushing, or publishing.

### Initialization

```bash
riscala init [target]
riscala init [target] --dry-run
riscala init [target] --feature <name>
```

### Governance

```bash
riscala classify "<change description>" [--json] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
riscala enforce "<change description>" [--json] [--max-level "Level 2"] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
riscala pr-checklist "<change description>" [--json] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
```

### Architecture

```bash
riscala adr "<decision title>" [--json] [--target <path>] [--date YYYY-MM-DD] [--status Proposed]
```

## Quick Start

Inside a project:

```bash
riscala audit
# Analyze repository readiness before writing files.

riscala init
# Bootstrap PSDM governance artifacts.

riscala validate
# Validate the governance baseline.
```

Use `riscala audit` before initializing PSDM in an existing project. It does not modify files; it shows current state, what `riscala init` would create or skip, pros, cons, and recommendations.

If the repository already has `AGENTS.md`, Copilot, Cursor, Claude, Codex, skills, prompts, or AI instruction files, `riscala audit` reports adoption mode `integrate` and recommends preserving those files. During `riscala init`, PSDM creates `docs/PSDM_ADOPTION.md` so the integration plan is explicit.

`riscala audit --json` also emits `aiReadiness`, a stable contract for AI runtime readiness signals. It reports detected AI surfaces, governance artifact groups, gaps, and recommendations for guardrails, data classification, cost, latency, evals, prompt injection, PII, and tool security. Current detection covers common AI folders and manifest dependencies such as OpenAI, Anthropic, LangChain, LlamaIndex, vector stores, embeddings, and n8n. The contract is documented in `docs/AI_READINESS_AUDIT.md`.

`riscala init` also creates `psdm.config.json`. Existing files are skipped.

## Model And Tool Independence

PSDM is independent from any specific model, provider, coding assistant, or init command. It does not replace `claude init`, Cursor rules, Copilot instructions, Codex instructions, custom skills, prompts, or agent runtimes. It gives them a shared governance layer.

Teams customize PSDM through `psdm.config.json`, `AGENTS.md`, `docs/CHANGE_GOVERNANCE.md`, `docs/TOOL_REGISTRY.md`, and AI guardrail docs. Tool-specific files should adapt those rules for a given assistant, but must not weaken PSDM change-level, security, data, deployment, approval, or release boundaries.

See `docs/MODEL_AND_TOOL_INDEPENDENCE.md` for customization examples.

## Knowledge As Code Layer

PSDM treats knowledge as a first-class artifact. A project should not preserve only source code, but also intent, specifications, architectural decisions, business rules, agent instructions, workflows, prompts, verification criteria, and evolution notes as versioned knowledge assets.

Knowledge as Code is a transversal layer, not a new mandatory phase. Markdown and YAML in Git remain the source of truth. Obsidian can be used as an optional authoring tool; vector databases and graph databases are derived runtime indexes, not the primary record.

RAG retrieves semantically similar text fragments. A Knowledge Graph connects explicit entities and relationships such as rules, workflows, agents, systems, owners, and decisions. GraphRAG is an advanced evolution path, not a starting requirement.

See `docs/KNOWLEDGE_AS_CODE.md` for structure, tool roles, maturity levels, and an example knowledge note.

## Common Workflows

### Classify a Change

```bash
riscala classify "change Supabase RLS policy for client documents"
```

Expected result:

```text
Estimated level: Level 3
```

Machine-readable output:

```bash
riscala audit --json
riscala validate --json
riscala classify "change Stripe webhook ownership validation" --json
```

Classify by description and touched files:

```bash
riscala classify "small cleanup" --file backend/auth/session.py
```

Configured risk paths can raise the level even when the description is vague:

```text
Estimated level: Level 3
```

### Inspect Staged Changes

Inspect the Git index without writing files or requiring a change description:

```bash
riscala inspect --staged
```

The command reports staged file status, applies a Level 1 minimum to any real file change, and raises the result when a configured `riskPath` matches. It does not inspect unstaged or untracked files.

Use JSON output for automation:

```bash
riscala inspect --staged --json
```

The JSON contract includes `decision`, `git.changes`, `files`, `evidence`, and `classification`. `NO_STAGED_CHANGES` is a successful no-op; `NOT_A_GIT_REPOSITORY` exits non-zero.

### Open The Interactive Shell

Open the read-only terminal UI in the current project:

```bash
riscala shell
```

Use `/status` to refresh project context and `/inspect` to review staged changes. Mutating slash commands remain blocked until trusted approvers and independent enforcement hooks are configured. See `docs/INTERACTIVE_SHELL.md` for the interface and safety contract.

### Prepare And Verify Approval

Create a machine-readable record for the exact staged diff:

```bash
riscala action prepare git.commit --json
```

After a trusted external signer returns a receipt, verify it against the live Git index:

```bash
riscala approval verify git.commit --receipt ./approval-receipt.json --json
```

Riscala does not sign receipts. Signing must happen through a hardware-backed or separately authenticated channel. See `docs/ACTION_RECORDS_AND_APPROVAL_RECEIPTS.md`.

Install the local pre-commit enforcement hook after a trusted approver is configured:

```bash
riscala hook install pre-commit
```

The hook consumes a valid receipt once and blocks invalid or missing Level 3/4 approval. It preserves existing unmanaged hooks instead of overwriting them. Local hooks can still be bypassed with Git options or filesystem control, so protected branches and remote required checks remain necessary for agent-resistant enforcement.

### Solo Maintainer And Team Mode

Riscala separates local governance from repository ownership rules:

- solo maintainer mode keeps required CI checks, admin enforcement, conversation resolution, and blocked force pushes/deletions, but does not require an approving reviewer;
- team mode should add at least one required approving review from a maintainer with write access;
- high-risk Level 3/4 changes still require content-bound approval when project policy says approval is required.

This keeps the product usable for one maintainer without weakening the path to team governance later.

### Generate A PR Checklist

Generate a PR checklist:

```bash
riscala pr-checklist "change auth session validation" --file backend/auth/session.py
```

### Enforce In CI

Enforce a maximum level in CI:

```bash
riscala enforce "small cleanup" --file src/index.mjs --max-level "Level 2"
```

### Create An ADR

Create an ADR:

```bash
riscala adr "Adopt CI change level enforcement"
```

## Local Validation

Run local fixtures:

```bash
npm test
```

Run the non-publishing release gate:

```bash
npm run release:check
```

Use `npm run release:check -- --allow-dirty` only when validating local changes before commit.

Beta release scope and exit criteria are tracked in `docs/BETA_RELEASE_NOTES.md`.

The public documentation index is `docs/INDEX.md`.

## Contributing And Security

Public contribution expectations are in `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.

Security reporting expectations are in `SECURITY.md`. Do not open public issues for secrets, credentials, exploitable behavior, private repository output, or customer data.

## What PSDM Is Not

PSDM is not a hosted observability platform, a runtime security product, a secret scanner, or a replacement for owner approval. It provides governance artifacts, local validation, change classification, CI enforcement hooks, and AI-agent guardrail templates.

## Examples

`examples/nextjs-saas` is a lightweight SaaS/AI fixture used by `npm test`.

It is not a runnable application. It exists to prove that PSDM can audit, initialize, and validate a downstream-like project with package metadata, prompt assets, and an AI-assisted backend surface without requiring external services or dependency installation.

## Configuration

`psdm.config.json` is optional. When it is absent, PSDM uses the default baseline artifacts.

Minimal example:

```json
{
  "profile": "backend-api"
}
```

Use the README to start. Use `docs/CONFIG_SCHEMA.md` for the full schema, supported fields, compatibility rules, AI policy fields, and `riskPaths` examples.

Supported profiles:

```text
standard
framework
backend-api
ai-agent
saas
monorepo
```

Profiles add sensible default artifacts and risk paths for common repository types. Explicit config still wins for project-specific policy.

The `ai-agent` profile adds guardrail artifacts for AI runtime governance:

```text
docs/AI_GUARDRAILS.md
docs/DATA_CLASSIFICATION.md
docs/COST_LATENCY_BUDGET.md
docs/PROMPT_INJECTION_TESTS.md
docs/AI_EVALS.md
```

These artifacts define policy, evidence, owners, gates, and accepted external reports. They do not turn PSDM into a native tracing, observability, or hosted eval platform.

Unsupported profile values fail validation instead of silently falling back to `standard`. The validation JSON still reports `config.profile.name` and `config.profile.recognized` so automation can surface the exact policy problem.

Schema stability rules are documented in `docs/CONFIG_SCHEMA.md`.

The optional `ai` block declares repository-level AI policy for PII, redaction, cost budgets, latency SLOs, tool registry expectations, eval requirements, prompt-injection testing, and human approval. `null` means the policy is intentionally not declared yet; invalid field types fail validation.

Use a non-default config path:

```bash
riscala validate --config ./governance/psdm.config.json
```

## Feature Artifacts

For product changes that should not require rewriting the whole project baseline, create scoped artifacts:

```bash
riscala init --feature billing
riscala validate --feature billing
```

Default feature paths:

```text
docs/features/<feature>/PROJECT_BRIEF.md
docs/features/<feature>/SPEC.md
docs/features/<feature>/ARCHITECTURE.md
docs/features/<feature>/SECURITY.md
docs/features/<feature>/TESTING.md
```

## Backend And Platform Governance

PSDM governs the whole repository, but its strongest controls usually apply to backend and platform surfaces:

- authentication and authorization;
- payments and billing;
- database migrations;
- infrastructure and deployment;
- AI agents and RAG pipelines;
- CI/CD workflows.

These controls live in `riskPaths`. A matching path raises the minimum change level even when the textual change description looks low risk.

`riscala inspect --staged` obtains touched paths directly from the Git index, so developers do not need to repeat them through `--file` or `--files` before review.

`riscala validate` fails when `riskPaths` contains malformed rules. Invalid risk path rules are ignored by classification so a broken local policy does not crash the CLI.

## Change Levels

| Level | Meaning | Governance |
|---|---|---|
| Level 0 | Safe trivial change | Diff review only. |
| Level 1 | Local low-risk code change | Scope note, relevant docs, narrow validation. |
| Level 2 | Product behavior change | Product spec, tasks, testing, architecture review if needed. |
| Level 3 | Security / data / payment / AI change | Spec, architecture, security, testing, owner approval. |
| Level 4 | Deployment / operations / infrastructure change | Deployment, operations, rollback plan, explicit production confirmation. |

## Production Gate

Production execution is never implied.

Commands that mutate production require exact owner confirmation:

```text
CONFIRM PRODUCTION DEPLOY
```

## GitHub Action

This repository includes a composite GitHub Action:

Replace `<owner>` with the public GitHub owner for the repository.

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: <owner>/psdm-framework@main
    with:
      target: .
```

The action writes `psdm-report.json` and fails when validation has blocking failures.

Enable change-level enforcement:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: <owner>/psdm-framework@main
    with:
      target: .
      enforce-change-level: 'true'
      change-description: ${{ github.event.pull_request.title }}
      files: src/index.mjs,docs/SPEC.md
      max-level: Level 2
```

The action writes `psdm-enforcement.json` and fails when the classified change exceeds `max-level`.

## Design Principles

- Risk-scaled governance.
- Specification before significant implementation.
- Knowledge as a versioned project asset.
- Explicit AI-agent boundaries.
- Agents justify meaningful mutations but cannot authorize their own high-risk actions.
- Security-sensitive work requires security context.
- Deployment-sensitive work requires rollback context.
- Documentation must support delivery, not replace it.

## Current Limitations

This beta does not yet provide:

- Full AI agent security runtime guardrail enforcement.
- Tool registry enforcement.
- Deep code-level semantic AI readiness detection.
- SBOM or supply-chain scanning.
- Deep semantic validation of specs.
- Remote approval service, remote replay persistence, or hardware signing ceremony integration.

Freshly initialized templates intentionally contain placeholders. `riscala validate` reports them as warnings and returns `METHOD_BASELINE_REVIEW_REQUIRED` until the artifacts are filled with project-specific content.

See `docs/ROADMAP.md`.

---

Built by Ptech AI Applied Lab

PSDM is the open governance framework behind the PTECH SPEC-DRIVEN METHOD.

Specification-first AI Engineering.

https://ptechsolution.net
