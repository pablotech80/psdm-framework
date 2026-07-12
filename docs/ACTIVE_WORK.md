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
allowed_paths
allowed
forbidden
must_preserve
stop_conditions
status
```

- **Repository:** the only writable project target.
- **Objective:** the active outcome.
- **Mode:** `inspect`, `experiment`, `design`, `implement`, or `release`.
- **Allowed paths:** optional exact, directory, or glob patterns normalized against the Git root.
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

## Handoff Contract

Before ending a turn with meaningful progress, an adapted agent records:

- completed work;
- validation evidence;
- decisions taken;
- open questions;
- pending work;
- one exact next action.

Only the current handoff is restored as operational context; lifecycle history records handoff events without copying chat transcripts. A fresh chat follows `Handoff > Next Action` unless it conflicts with the boundary or a newer explicit developer instruction. The developer should not need to reconstruct this context manually.

## Canonical Local State

`.riscala/ACTIVE_WORK.md` is the human-readable project mirror, not the sole authority. Riscala stores canonical local state under the user configuration directory, keyed by a stable repository identity derived from the normalized Git remote when available. Each update receives a monotonic revision and is written atomically.

`riscala work show` synchronizes an older project mirror before returning context. Agent adapters must use this command instead of trusting a directly read Markdown file. Concurrent or stale writers fail with `ACTIVE_WORK_LOCKED` or `STALE_REVISION` rather than overwriting newer work.

This guarantee covers chats, snapshots, and local clones that can access the same Riscala configuration directory. It does not claim cross-device or remote-agent continuity; those environments must stop when canonical state is unavailable.

## Transition Rule

A new instruction does not expand previous authority.

Stop before acting when a request changes:

```text
repository | objective | mode | allowed | forbidden | authority
```

The transition proposal must state the current boundary, requested boundary, changed fields, risks, and authority required. Acceptance creates a new boundary; it does not retroactively authorize earlier actions.

The shell lifecycle is:

```text
/work <mode> <objective>
  -> /work transition <mode> <new objective>
  -> /work continue
  -> /work close
```

`transition` records a pending boundary. `continue` is the explicit developer action that activates it. `close` prevents the previous boundary from being restored as active. Each decision appends timestamped lifecycle history without storing the conversation transcript.

## Verification

Before mutation, compare the requested action with Active Work. After mutation, compare changed files and actions with the same boundary and verify `must_preserve` evidence. `/review` reports staged violations as advisory evidence. When the optional managed pre-commit hook is installed, the same violations block the commit before approval evaluation.

Agent adapters make the pre-mutation comparison explicit across repository, objective, mode, allowed paths/actions, forbidden actions, and preservation rules. Every dimension is `aligned`, `conflicting`, or `unresolved`; mutation proceeds only when all dimensions are aligned. This assessment is deterministic for repository, mode, and paths, while semantic alignment with the objective remains a disclosed agent judgment rather than a false claim of complete understanding.

The repository check is anchored to the initial working repository before the agent follows a requested path or workspace change. Active Work found inside a requested target cannot authorize entering that same target; otherwise the request would replace the boundary before being evaluated.

This rule is evidence-backed. In the first Codex experiment, the agent entered the requested Flowleads path and incorrectly treated its local Active Work as proof that the repository matched. After anchoring authority to the initial repository, the repeated experiment stayed in `psdm-framework`, did not read Flowleads, and reported both repository and mode conflicts.

A technically correct result can still be outside authority.

## Trust Boundary

Git-backed Markdown or YAML is the portable source of task context. It is not proof of identity or strong approval, and it must not contain secrets, credentials, private customer data, production values, or conversation dumps.

## Invariants

1. Repository, objective, mode, scope, and authority are independent boundaries.
2. General agent instructions do not replace the active task boundary.
3. Boundary changes require explicit transitions.
4. Agents may record authority but may not invent or approve it.
5. Low-risk work remains lightweight when the boundary does not change.
