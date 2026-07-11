# TASKS.md

Status: `Active`
Project: `psdm-framework`

## Task Plan

Current active work is tracked in root `TODO.md`.

For each meaningful change:

1. Classify risk using description and touched files.
2. Read the required project docs and source modules.
3. Update root `ROADMAP.md` and `TODO.md` when scope or status changes.
4. Implement the smallest coherent change.
5. Run focused validation.
6. Update public docs when CLI, config, templates, or governance behavior changes.
7. Commit and push only after validation is understood.

Near-term framework tasks:

- Define beta.6 JSON contracts for Project Context, Judgment Brief, Owner Decision, Change Envelope, Decision Review, and Learning.
- Map current deterministic repository signals to `ObservedEvidence` without semantic overclaiming.
- Design intent-first greenfield and read-only legacy context collection.
- Implement one Judgment Brief path with learn, balanced, concise, and JSON rendering.
- Implement staged Decision Review for scope drift and representative dependency, migration, CI/deployment, and validation evidence.
- Add acceptance fixtures for learning, experienced, and staff-level reasoning needs using the same underlying result.
- Prove first value without `riscala init` and without a complete PSDM artifact baseline.
- Preserve existing commands, JSON contracts, config, executable aliases, CI, approval, and hook behavior during the additive beta.6 increment.
- Keep this repository self-governing through PSDM artifacts.
- Keep pre-init audit useful for existing projects adopting PSDM.
- Keep PR checklist generation aligned with classifier and risk path behavior.
- Keep staged change inspection aligned with Git and classifier contracts.
- Keep agent decision records, approval bindings, and AGENTS adapters aligned with `docs/AGENT_DECISION_PROTOCOL.md`.
- Add greenfield and legacy judgment-loop example coverage.
- Validate the GitHub Action in a downstream repository workflow.
- Keep fixtures current as CLI behavior changes.

## Completion Criteria

A task is complete when:

- intended behavior is implemented;
- relevant docs are current;
- `ROADMAP.md` and `TODO.md` reflect the new state;
- focused validation has run;
- known validation gaps are documented;
- commit and push status are clear.
