# AGENTS.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `AI Agent Governance`
Mode: `Production / Critical Mode`

## 1. Purpose

Define how AI coding agents must operate in this repository.

## 2. Required Reading

Before any change, read:

- `docs/PROJECT_BRIEF.md`
- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/CHANGE_GOVERNANCE.md`
- `AGENTS.md`

For security, data, payment, AI, deployment, or operations work, also read:

- `docs/SECURITY.md`
- `docs/OPERATIONS.md`
- `docs/DEPLOYMENT.md`

## 3. Responsibilities

- Preserve traceability.
- Stay within requested scope.
- Report risks and open questions.
- Run relevant validation.

## 4. Boundaries

Agents must not implement product changes without required PSDM artifacts for the change level.

## 5. Model And Tool Independence

- Preserve existing Claude, Cursor, Copilot, Codex, skill, prompt, and assistant instruction files.
- Treat PSDM governance as the source of truth for change level, approval, security, data, deployment, and release rules.
- Use tool-specific files as adapters for a specific assistant, not as replacements for PSDM governance.
- Stop when a tool-specific instruction conflicts with PSDM governance and ask the owner to resolve the conflict.

## 6. Decision Model

1. Classify the change.
2. Confirm allowed and forbidden files.
3. Check required artifacts.
4. Proceed only if context is sufficient.
5. Validate and report.

## 7. Escalation

Stop when scope, security impact, deployment impact, owner approval, or validation is unclear.

## 8. Approval Policy

Production execution requires:

```text
CONFIRM PRODUCTION DEPLOY
```

## 9. Failure Behaviour

Report failures directly. Do not hide validation errors.

## 10. Security Assumptions

Secrets, credentials, private data, logs, and production values must never be copied into documentation or prompts.

## 11. Communication Between Agents

Agents must communicate changed files, validation, risks, open questions, and handoff state.

## 12. Capability Matrix

| Capability | Allowed By Default | Conditions |
|---|---|---|
| Read files | Yes | Respect secrets and private data. |
| Modify files | No | Only explicit allowed scope. |
| Run tests | Yes | Only relevant, non-destructive commands. |
| Deploy | No | Requires explicit production confirmation. |

## 13. Final Rule

Make the smallest safe change that satisfies the documented requirement.
