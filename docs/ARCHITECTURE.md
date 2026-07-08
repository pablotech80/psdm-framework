# ARCHITECTURE.md

Status: `Active`
Project: `psdm-framework`

## System Overview

PSDM is a small Node.js CLI package. The executable entrypoint is `bin/psdm.mjs`; command implementations live under `src/commands`; shared helpers live under `src/lib`; validation logic lives under `src/validator`; project templates live under `templates`.

The architecture favors explicit modules over framework abstractions:

- `bin/psdm.mjs` dispatches commands.
- `src/commands/*.mjs` owns user-facing command behavior.
- `src/lib/args.mjs` parses CLI options.
- `src/lib/adr.mjs` owns ADR filename generation and scaffold rendering.
- `src/lib/audit.mjs` builds the non-destructive repository adoption preview, detects existing AI governance files, detects AI runtime surfaces from paths and manifests, and emits the AI readiness audit contract.
- `src/lib/classifier.mjs` owns reusable change classification.
- `src/lib/enforcement.mjs` owns CI-oriented maximum change-level enforcement.
- `src/lib/pr-checklist.mjs` generates pull request checklist content from classification output.
- `src/lib/config.mjs` loads PSDM configuration and validates optional AI policy declarations.
- `src/lib/config.mjs` also applies validation profile presets and exposes the supported profile list.
- `src/lib/artifacts.mjs` defines baseline artifact contracts.
- AI guardrail templates are profile-scoped through `ai-agent` so PSDM can govern AI runtime risk without imposing those artifacts on non-AI projects.
- `src/lib/risk-paths.mjs` validates and evaluates file path risk rules.
- `src/lib/git.mjs` inspects repository state.
- `src/validator/validate-method.mjs` evaluates method compliance.

## Architecture Decisions

- Use dependency-free JavaScript modules to keep installation and audit surface small.
- Use JSON output as a stable automation contract while preserving human-readable output.
- Keep configuration local to the target repository through `psdm.config.json`.
- Keep PSDM as a governance layer, not an AI observability platform; runtime traces, dashboards, hosted evals, token telemetry, cost reports, and latency measurements should come from external tools or project-owned scripts.
- Treat unsupported profile values as invalid local policy rather than silently relying on default behavior.
- Treat malformed risk path rules as invalid local policy and ignore them during path matching.
- Treat risk classification as advisory unless CI enforcement is explicitly configured through `psdm enforce` or the composite Action.
- Make adoption audit non-destructive so existing repositories can evaluate impact before initialization.
- Preserve existing agent, assistant, skill, prompt, and Copilot-style instructions during adoption, and create a separate PSDM adoption plan when integration is needed.
- Keep templates plain Markdown so teams can adapt them without special tooling.
- Keep generated artifacts separate from framework docs where possible.

## Architecture Gate

Changes require architecture review when they affect:

- command contracts or exit codes;
- pre-init audit semantics;
- AI readiness JSON output shape;
- AI surface detection heuristics;
- existing AI governance detection;
- adoption plan creation;
- ADR scaffold semantics;
- change classification and PR checklist semantics;
- change-level enforcement semantics;
- JSON output shape;
- config schema or defaults;
- AI policy schema, defaults, or validation;
- validation profile behavior;
- profile-scoped AI guardrail artifact requirements;
- validator decisions;
- risk path schema validation;
- risk path matching;
- package distribution;
- GitHub Action behavior;
- governance semantics for high-risk change levels.
- the boundary between PSDM governance and external runtime observability.
