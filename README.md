# PSDM Framework

PTECH SPEC-DRIVEN METHOD is a governance framework for AI-assisted software projects.

It helps teams decide how much process a change needs based on risk. The goal is not bureaucracy. The goal is controlled delivery: small safe changes stay fast, production-sensitive changes get stronger governance.

## Status

`0.17.0-alpha`

This repository currently provides:

- PSDM project templates.
- A local CLI.
- Pre-init repository audit.
- Existing AI governance detection during audit.
- AI readiness audit JSON contract.
- Optional AI policy fields in `psdm.config.json`.
- AI guardrail templates for `ai-agent` projects.
- ADR generation.
- Pull request checklist generation.
- CLI regression fixtures.
- Validator, custom config, and feature artifact fixtures.
- Validation profiles.
- Unsupported profile validation.
- Risk path schema validation.
- Beta release notes.
- Config schema stability documentation.
- Baseline artifact checks.
- Baseline structure validation.
- Change-level classification.
- CI change-level enforcement.
- Markdown compliance reports.
- Optional `psdm.config.json` policy.
- JSON output for automation.
- Feature-specific PSDM artifacts.
- Dirty git working-tree awareness.
- GitHub Action MVP.
- Backend/platform risk path rules.
- Self-governance baseline artifacts for this repository.

## Install Locally

```bash
npm install -g .
```

Then run:

```bash
psdm help
```

## CLI

```bash
psdm audit [target] [--json] [--feature <name>] [--config <path>]
psdm adr "<decision title>" [--json] [--target <path>] [--date YYYY-MM-DD] [--status Proposed]
psdm init [target]
psdm init [target] --dry-run
psdm init [target] --feature <name>
psdm check [target] [--json] [--feature <name>] [--config <path>]
psdm validate [target] [--json] [--feature <name>] [--config <path>]
psdm classify "<change description>" [--json] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
psdm enforce "<change description>" [--json] [--max-level "Level 2"] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
psdm pr-checklist "<change description>" [--json] [--file <path>] [--files <path,path>] [--target <path>] [--config <path>]
psdm report [target] [--json] [--feature <name>] [--config <path>]
```

## Quick Start

Inside a project:

```bash
psdm audit
psdm init
psdm check
psdm validate
```

Use `psdm audit` before initializing PSDM in an existing project. It does not modify files; it shows current state, what `psdm init` would create or skip, pros, cons, and recommendations.

If the repository already has `AGENTS.md`, Copilot, Cursor, Claude, Codex, skills, prompts, or AI instruction files, `psdm audit` reports adoption mode `integrate` and recommends preserving those files. During `psdm init`, PSDM creates `docs/PSDM_ADOPTION.md` so the integration plan is explicit.

`psdm audit --json` also emits `aiReadiness`, a stable contract for AI runtime readiness signals. It reports detected AI surfaces, governance artifact groups, gaps, and recommendations for guardrails, data classification, cost, latency, evals, prompt injection, PII, and tool security. Current detection covers common AI folders and manifest dependencies such as OpenAI, Anthropic, LangChain, LlamaIndex, vector stores, embeddings, and n8n. The contract is documented in `docs/AI_READINESS_AUDIT.md`.

`psdm init` also creates `psdm.config.json`. Existing files are skipped.

Classify a change:

```bash
psdm classify "change Supabase RLS policy for client documents"
```

Expected result:

```text
Estimated level: Level 3
```

Machine-readable output:

```bash
psdm audit --json
psdm validate --json
psdm classify "change Stripe webhook ownership validation" --json
```

Classify by description and touched files:

```bash
psdm classify "small cleanup" --file backend/auth/session.py
```

Configured risk paths can raise the level even when the description is vague:

```text
Estimated level: Level 3
```

Generate a PR checklist:

```bash
psdm pr-checklist "change auth session validation" --file backend/auth/session.py
```

Enforce a maximum level in CI:

```bash
psdm enforce "small cleanup" --file src/index.mjs --max-level "Level 2"
```

Create an ADR:

```bash
psdm adr "Adopt CI change level enforcement"
```

Run local fixtures:

```bash
npm test
```

Beta release scope and exit criteria are tracked in `docs/BETA_RELEASE_NOTES.md`.

The public documentation index is `docs/INDEX.md`.

## Configuration

`psdm.config.json` is optional. When it is absent, PSDM uses the default baseline artifacts.

Example:

```json
{
  "version": 1,
  "profile": "standard",
  "requiredArtifacts": [
    "AGENTS.md",
    "docs/PROJECT_BRIEF.md",
    "docs/SPEC.md",
    "docs/ARCHITECTURE.md",
    "docs/CHANGE_GOVERNANCE.md",
    "docs/TASKS.md",
    "docs/TESTING.md",
    "docs/DEPLOYMENT.md",
    "docs/SECURITY.md",
    "docs/OPERATIONS.md",
    "ADRs"
  ],
  "extraRequiredArtifacts": [],
  "features": {
    "root": "docs/features",
    "requiredArtifacts": [
      "PROJECT_BRIEF.md",
      "SPEC.md",
      "ARCHITECTURE.md",
      "SECURITY.md",
      "TESTING.md"
    ]
  },
  "git": {
    "warnOnDirty": true
  },
  "ai": {
    "pii": {
      "allowedInPrompts": false,
      "redactionRequired": true
    },
    "cost": {
      "maxUsdPerRequest": null,
      "monthlyBudgetUsd": null
    },
    "latency": {
      "p95Ms": null
    },
    "tools": {
      "registryRequired": true,
      "humanApprovalForExternalActions": true
    },
    "evals": {
      "required": true
    },
    "security": {
      "promptInjectionTestsRequired": true
    }
  },
  "riskPaths": [
    {
      "pattern": "backend/auth/**",
      "minimumLevel": "Level 3",
      "requiredArtifacts": ["docs/SECURITY.md", "docs/TESTING.md"],
      "reason": "Authentication and authorization changes can expose private data or bypass access control."
    },
    {
      "pattern": "backend/migrations/**",
      "minimumLevel": "Level 4",
      "requiredArtifacts": ["docs/DEPLOYMENT.md", "docs/OPERATIONS.md"],
      "reason": "Database migrations can require rollback and production operations planning."
    }
  ]
}
```

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
psdm validate --config ./governance/psdm.config.json
```

## Feature Artifacts

For product changes that should not require rewriting the whole project baseline, create scoped artifacts:

```bash
psdm init --feature billing
psdm validate --feature billing
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

`psdm validate` fails when `riskPaths` contains malformed rules. Invalid risk path rules are ignored by classification so a broken local policy does not crash the CLI.

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

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ptech/psdm-framework@main
    with:
      target: .
```

The action writes `psdm-report.json` and fails when validation has blocking failures.

Enable change-level enforcement:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ptech/psdm-framework@main
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
- Explicit AI-agent boundaries.
- Security-sensitive work requires security context.
- Deployment-sensitive work requires rollback context.
- Documentation must support delivery, not replace it.

## Current Limitations

This alpha does not yet provide:

- Full AI agent security runtime guardrail enforcement.
- Tool registry enforcement.
- Deep code-level semantic AI readiness detection.
- SBOM or supply-chain scanning.
- Deep semantic validation of specs.

Freshly initialized templates intentionally contain placeholders. `psdm validate` reports them as warnings and returns `METHOD_BASELINE_REVIEW_REQUIRED` until the artifacts are filled with project-specific content.

See `docs/ROADMAP.md`.
