# PSDM_ADOPTION.md

Status: `Draft`
Artifact Type: `PSDM Adoption Plan`

## Existing AI Governance

List existing agent, Copilot, Cursor, Claude, Codex, skill, prompt, or AI instruction files detected before PSDM adoption.

## Integration Decision

Describe how PSDM governance will coexist with the existing project instructions.

## Conflict Review

- Confirm ownership of existing AI instructions.
- Identify rules that conflict with PSDM boundaries.
- Identify skills or prompts that can affect tools, secrets, deployment, data access, or production behavior.
- Decide whether existing rules should be linked, merged, or left unchanged.

## PSDM Adoption Actions

- Preserve existing agent and assistant instruction files.
- Add PSDM artifacts without overwriting existing files.
- Document any manual changes to existing AI governance files.
- Run `psdm validate --json` after integration.

## Follow-up

Record owner review, unresolved governance conflicts, and validation evidence.
