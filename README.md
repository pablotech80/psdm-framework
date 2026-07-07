# PSDM Framework

PTECH SPEC-DRIVEN METHOD is a governance framework for AI-assisted software projects.

It helps teams decide how much process a change needs based on risk. The goal is not bureaucracy. The goal is controlled delivery: small safe changes stay fast, production-sensitive changes get stronger governance.

## Status

`0.1.0` MVP

This repository currently provides:

- PSDM project templates.
- A local CLI.
- Baseline artifact checks.
- Baseline structure validation.
- Change-level classification.
- Markdown compliance reports.

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
psdm check [target]
psdm validate [target]
psdm classify "<change description>"
psdm report [target]
```

## Quick Start

Inside a project:

```bash
psdm init
psdm check
psdm validate
```

Classify a change:

```bash
psdm classify "change Supabase RLS policy for client documents"
```

Expected result:

```text
Estimated level: Level 3
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

## Design Principles

- Risk-scaled governance.
- Specification before significant implementation.
- Explicit AI-agent boundaries.
- Security-sensitive work requires security context.
- Deployment-sensitive work requires rollback context.
- Documentation must support delivery, not replace it.

## Current Limitations

This MVP does not yet provide:

- GitHub Action.
- Full AI agent security runtime guardrail enforcement.
- Tool registry enforcement.
- SBOM or supply-chain scanning.
- Deep semantic validation of specs.

Freshly initialized templates intentionally contain placeholders. `psdm validate` reports them as warnings and returns `METHOD_BASELINE_REVIEW_REQUIRED` until the artifacts are filled with project-specific content.

See `docs/ROADMAP.md`.
