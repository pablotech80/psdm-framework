# CHANGE_GOVERNANCE.md

Status: `Active`
Project: `psdm-framework`

## Change Levels

PSDM uses five risk levels:

| Level | Meaning | Framework Examples |
|---|---|---|
| Level 0 | Safe trivial change | Typo, formatting, small docs wording. |
| Level 1 | Local low-risk change | Small internal refactor with no command behavior change. |
| Level 2 | Product behavior change | CLI option, template, report, or command behavior change. |
| Level 3 | Security, data, payment, or AI governance change | Validator logic, risk path logic, config semantics, agent policy. |
| Level 4 | Deployment, operations, or infrastructure change | GitHub Action, package metadata, CI/release flow. |

## Required Artifacts

- Level 0: clear scope and diff review.
- Level 1: scope note, relevant docs, focused validation.
- Level 2: `docs/SPEC.md`, `docs/TASKS.md`, `docs/TESTING.md`.
- Level 3: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/TESTING.md`, owner review.
- Level 4: `docs/DEPLOYMENT.md`, `docs/OPERATIONS.md`, rollback or recovery notes, owner review.

Feature-scoped artifacts may be used when a change is isolated and does not alter framework-wide contracts.

Use `psdm adr "<decision title>"` when a Level 3 or Level 4 change creates or reverses a durable architecture, security, CI, deployment, config, or governance decision.

## CI Enforcement

`psdm enforce` blocks a change when its classified level exceeds the configured maximum level. The GitHub Action can run this gate with `enforce-change-level: 'true'`, a change description, touched files, and a maximum allowed level.

Before commit or PR preparation, `riscala inspect --staged` can derive the touched file list directly from the Git index and explain the minimum level and matching risk-path evidence. It is advisory and does not stage, modify, approve, or commit files.

## Agent Decision Governance

Agents must justify meaningful mutations before execution and report evidence, deviations, next action, and next-action rationale afterward. An agent cannot approve its own action.

For configured high-risk mutations, approval must be issued through a trusted human-presence boundary and bound to the exact content and target. A phrase available to the same terminal is not proof of human identity. See `docs/AGENT_DECISION_PROTOCOL.md`.

For staged Git commits, `riscala action prepare git.commit --json` creates the proposed binding and `riscala approval verify git.commit --receipt <path> --json` verifies a detached receipt. These commands are read-only; commit enforcement remains unavailable until a protected pre-commit boundary is installed.

## Stop Conditions

Stop before implementation when:

- the change level is unclear;
- JSON output compatibility is uncertain;
- config behavior could break existing repositories;
- validation could approve unsafe states;
- a command may mutate production or external systems;
- secrets or private data may be exposed;
- required owner approval is missing for Level 3 or Level 4 work.
- an agent would need to generate, enter, or reuse its own approval.
