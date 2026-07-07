# PSDM Framework Handoff

Use this note to continue the project in a new Codex chat.

## Project

Repository path:

```text
/Users/ptech/repo/psdm-framework
```

Project name:

```text
psdm-framework
```

Package name:

```text
@ptech/psdm-framework
```

Current branch:

```text
main
```

Current status:

```text
MVP created and committed locally.
```

## Goal

Turn PSDM, the PTECH SPEC-DRIVEN METHOD, into a professional installable framework for governing AI-assisted software projects.

The framework must help teams:

- initialize method artifacts;
- classify changes by risk;
- validate repository governance;
- keep AI agents inside explicit boundaries;
- avoid excessive bureaucracy for small changes;
- require stronger controls for security, data, payment, AI, deployment, and operations changes.

## Current MVP

Implemented:

- Node package scaffold.
- CLI binary: `psdm`.
- Commands:
  - `psdm init`
  - `psdm check`
  - `psdm validate`
  - `psdm classify`
  - `psdm report`
- PSDM templates:
  - `PROJECT_BRIEF.md`
  - `SPEC.md`
  - `ARCHITECTURE.md`
  - `CHANGE_GOVERNANCE.md`
  - `AGENTS.md`
  - `TASKS.md`
  - `TESTING.md`
  - `DEPLOYMENT.md`
  - `SECURITY.md`
  - `OPERATIONS.md`
  - `ADR.md`
- Validator:
  - checks required artifacts;
  - checks non-empty files;
  - checks required sections;
  - warns about placeholders;
  - detects simple secret-like patterns.
- Docs:
  - `README.md`
  - `docs/PSDM_OVERVIEW.md`
  - `docs/CHANGE_LEVELS.md`
  - `docs/AI_AGENT_SECURITY.md`
  - `docs/ROADMAP.md`

## Validation Already Run

```bash
node bin/psdm.mjs classify "change Stripe webhook ownership validation"
node bin/psdm.mjs init /tmp/<temporary-project>
node bin/psdm.mjs check /tmp/<temporary-project>
node bin/psdm.mjs validate /tmp/<temporary-project>
npm pack --dry-run
```

Expected validation state for freshly initialized templates:

```text
METHOD_BASELINE_REVIEW_REQUIRED
```

Reason:

```text
Fresh templates intentionally contain placeholders and must be filled with project-specific content before approval.
```

## Important Product Direction

Do not turn PSDM into heavy bureaucracy.

Core principle:

```text
The method must scale with risk.
```

Small safe changes should stay fast. Risky changes require stronger governance.

## Recommended Next Milestone

Build `0.2.0-alpha` with:

1. `psdm.config.json` support.
2. `--json` output for `check`, `validate`, and `classify`.
3. Git dirty-state awareness.
4. GitHub Action MVP.
5. Better change classifier rules.
6. Feature-specific artifact support:
   - `docs/features/<feature>/PROJECT_BRIEF.md`
   - `docs/features/<feature>/SPEC.md`
   - `docs/features/<feature>/ARCHITECTURE.md`
   - `docs/features/<feature>/SECURITY.md`
   - `docs/features/<feature>/TESTING.md`
7. Tool registry design draft:
   - permissions;
   - allowed parameters;
   - forbidden operations;
   - human approval;
   - audit logging.

## Suggested First Prompt For New Chat

```text
You are working inside /Users/ptech/repo/psdm-framework.

This project is the PSDM Framework: a professional installable governance framework for AI-assisted software projects.

Read HANDOFF.md, README.md, package.json, docs/ROADMAP.md, and src/.

Task:
Continue from the MVP and implement the next milestone:
- add psdm.config.json support;
- add --json output to check, validate, classify, and report where useful;
- keep the CLI dependency-free;
- do not overengineer;
- preserve the current command behavior for human-readable output;
- update README and ROADMAP;
- run local validation;
- commit the changes.
```

## Current Commit

Initial MVP commit:

```text
feat: initialize psdm framework mvp
```

This handoff note should be committed as a separate documentation commit.
