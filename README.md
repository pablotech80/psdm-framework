# PSDM Framework

PTECH SPEC-DRIVEN METHOD is a governance framework for AI-assisted software projects.

It helps teams decide how much process a change needs based on risk. The goal is not bureaucracy. The goal is controlled delivery: small safe changes stay fast, production-sensitive changes get stronger governance.

## Status

`0.2.0-alpha`

This repository currently provides:

- PSDM project templates.
- A local CLI.
- Baseline artifact checks.
- Baseline structure validation.
- Change-level classification.
- Markdown compliance reports.
- Optional `psdm.config.json` policy.
- JSON output for automation.
- Feature-specific PSDM artifacts.
- Dirty git working-tree awareness.
- GitHub Action MVP.

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
psdm init [target]
psdm init [target] --feature <name>
psdm check [target] [--json] [--feature <name>] [--config <path>]
psdm validate [target] [--json] [--feature <name>] [--config <path>]
psdm classify "<change description>" [--json]
psdm report [target] [--json] [--feature <name>] [--config <path>]
```

## Quick Start

Inside a project:

```bash
psdm init
psdm check
psdm validate
```

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
psdm validate --json
psdm classify "change Stripe webhook ownership validation" --json
```

## Configuration

`psdm.config.json` is optional. When it is absent, PSDM uses the default baseline artifacts.

Example:

```json
{
  "version": 1,
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
  }
}
```

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
- SBOM or supply-chain scanning.
- Deep semantic validation of specs.

Freshly initialized templates intentionally contain placeholders. `psdm validate` reports them as warnings and returns `METHOD_BASELINE_REVIEW_REQUIRED` until the artifacts are filled with project-specific content.

See `docs/ROADMAP.md`.
