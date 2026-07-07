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

## CI Enforcement

`psdm enforce` blocks a change when its classified level exceeds the configured maximum level. The GitHub Action can run this gate with `enforce-change-level: 'true'`, a change description, touched files, and a maximum allowed level.

## Stop Conditions

Stop before implementation when:

- the change level is unclear;
- JSON output compatibility is uncertain;
- config behavior could break existing repositories;
- validation could approve unsafe states;
- a command may mutate production or external systems;
- secrets or private data may be exposed;
- required owner approval is missing for Level 3 or Level 4 work.
