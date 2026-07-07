# ARCHITECTURE.md

Status: `Active`
Project: `psdm-framework`

## System Overview

PSDM is a small Node.js CLI package. The executable entrypoint is `bin/psdm.mjs`; command implementations live under `src/commands`; shared helpers live under `src/lib`; validation logic lives under `src/validator`; project templates live under `templates`.

The architecture favors explicit modules over framework abstractions:

- `bin/psdm.mjs` dispatches commands.
- `src/commands/*.mjs` owns user-facing command behavior.
- `src/lib/args.mjs` parses CLI options.
- `src/lib/audit.mjs` builds the non-destructive repository adoption preview.
- `src/lib/config.mjs` loads PSDM configuration.
- `src/lib/artifacts.mjs` defines baseline artifact contracts.
- `src/lib/risk-paths.mjs` evaluates file path risk rules.
- `src/lib/git.mjs` inspects repository state.
- `src/validator/validate-method.mjs` evaluates method compliance.

## Architecture Decisions

- Use dependency-free JavaScript modules to keep installation and audit surface small.
- Use JSON output as a stable automation contract while preserving human-readable output.
- Keep configuration local to the target repository through `psdm.config.json`.
- Treat risk classification as advisory unless CI enforcement is explicitly configured.
- Make adoption audit non-destructive so existing repositories can evaluate impact before initialization.
- Keep templates plain Markdown so teams can adapt them without special tooling.
- Keep generated artifacts separate from framework docs where possible.

## Architecture Gate

Changes require architecture review when they affect:

- command contracts or exit codes;
- pre-init audit semantics;
- JSON output shape;
- config schema or defaults;
- validator decisions;
- risk path matching;
- package distribution;
- GitHub Action behavior;
- governance semantics for high-risk change levels.
