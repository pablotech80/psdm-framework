# Riscala Active Work Contract

Status: `Beta.6 Design Contract`
Date: `2026-07-11`

## Purpose

Keep AI work inside the repository, objective, mode, scope, and authority defined by the developer.

`AGENTS.md` contains general repository rules. Active Work contains the concrete boundary of the current task.

## Minimum Record

```text
repository
objective
mode
allowed
forbidden
must_preserve
stop_conditions
status
```

- **Repository:** the only writable project target.
- **Objective:** the active outcome.
- **Mode:** `inspect`, `experiment`, `design`, `implement`, or `release`.
- **Allowed:** authorized files, areas, and actions.
- **Forbidden:** explicit exclusions.
- **Must preserve:** behavior, decisions, compatibility, or user changes that must remain true.
- **Stop conditions:** boundaries that require a decision before continuing.
- **Status:** `active`, `transition_proposed`, `closed`, or `superseded`.

## Context Categories

Active Work must distinguish:

- `human_decision`;
- `observed_fact`;
- `example`;
- `suggestion`;
- `open_question`.

An example or suggestion never becomes an authorized requirement automatically.

## Transition Rule

A new instruction does not expand previous authority.

Stop before acting when a request changes:

```text
repository | objective | mode | allowed | forbidden | authority
```

The transition proposal must state the current boundary, requested boundary, changed fields, risks, and authority required. Acceptance creates a new boundary; it does not retroactively authorize earlier actions.

## Verification

Before mutation, compare the requested action with Active Work. After mutation, compare changed files and actions with the same boundary and verify `must_preserve` evidence.

A technically correct result can still be outside authority.

## Trust Boundary

Git-backed Markdown or YAML is the portable source of task context. It is not proof of identity or strong approval, and it must not contain secrets, credentials, private customer data, production values, or conversation dumps.

## Invariants

1. Repository, objective, mode, scope, and authority are independent boundaries.
2. General agent instructions do not replace the active task boundary.
3. Boundary changes require explicit transitions.
4. Agents may record authority but may not invent or approve it.
5. Low-risk work remains lightweight when the boundary does not change.
