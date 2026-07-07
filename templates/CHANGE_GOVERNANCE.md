# CHANGE_GOVERNANCE.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Change Classification Policy`
Mode: `Production / Critical Mode`

## 1. Purpose

Define how much governance is required for each change based on type, risk, and impact.

## 2. Scope

This policy applies to human and AI-assisted changes in this repository.

## 3. Core Rule

The method must scale with risk. Small safe changes stay lightweight. Risky changes require stronger governance.

## 4. Change Levels

| Level | Name | Examples |
|---|---|---|
| Level 0 | Safe Trivial Change | Typos, formatting, non-behavioral docs. |
| Level 1 | Local Low-Risk Code Change | Small UI fix, isolated bug fix, minor styling. |
| Level 2 | Product Behavior Change | User flow, dashboard behavior, documents, notifications. |
| Level 3 | Security / Data / Payment / AI Change | Auth, RLS, service-role, payments, webhooks, private data, AI behavior. |
| Level 4 | Deployment / Operations / Infrastructure Change | Docker, CI/CD, env vars, migrations, monitoring, rollback. |

## 5. Required Artifacts by Change Level

| Level | Minimum Required Artifacts | Approval | Validation |
|---|---|---|---|
| Level 0 | Clear scope and diff review. | Requester review. | Diff review. |
| Level 1 | Scope note, `AGENTS.md`, relevant docs. | Requester review. | Relevant command or manual validation. |
| Level 2 | Product-specific `SPEC`, `TASKS`, `TESTING`; architecture review if structure changes. | Owner/delegate. | Task validation and testing coverage. |
| Level 3 | `SPEC`, `ARCHITECTURE`, `SECURITY`, `TASKS`, `TESTING`, ADR if decision-level. | Owner approval. | Security validation and tests. |
| Level 4 | `DEPLOYMENT`, `OPERATIONS`, `SECURITY` if applicable, rollback plan, ADR if needed. | Owner approval. | Deployment/rollback validation. |

## 6. Codex Usage by Change Level

- Level 0: allowed with narrow scope.
- Level 1: allowed with explicit allowed/forbidden files.
- Level 2: allowed only against documented tasks.
- Level 3: must stop if security context is missing.
- Level 4: must not execute production operations without explicit confirmation.

## 7. Approval Rules

Production execution requires exact owner confirmation:

```text
CONFIRM PRODUCTION DEPLOY
```

## 8. ADR Triggers

Create or propose an ADR when a change is expensive to reverse or changes major technology, runtime topology, auth, RLS, payment behavior, AI behavior, API contracts, database schema, or method exceptions.

## 9. Hotfix Policy

Hotfixes require minimal scope, owner approval, risk statement, validation, no unrelated cleanup, and post-fix artifact update.

## 10. Validation Requirements

Validation must match risk. Do not claim readiness when validation is skipped, impossible, or unrelated.

## 11. Stop Conditions

Stop when the change level is unclear, required artifacts are missing, security/deployment impact is discovered, docs and code contradict each other, validation cannot be performed, or the request conflicts with governance.

## 12. Commit Rules

Keep commits scoped to one change level whenever practical.

## 13. Examples

| Situation | Level |
|---|---|
| Fix README typo. | Level 0 |
| Adjust spacing in one component. | Level 1 |
| Change dashboard workflow. | Level 2 |
| Modify RLS or payment webhook. | Level 3 |
| Change Docker deploy. | Level 4 |

## 14. Final Rule

The method must scale with risk.
