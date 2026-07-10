# ARCHITECTURE.md

Status: `Active`
Project: `psdm-framework`

## System Overview

PSDM is a small Node.js CLI package. The executable entrypoint is `bin/psdm.mjs`; command implementations live under `src/commands`; shared helpers live under `src/lib`; validation logic lives under `src/validator`; project templates live under `templates`.

Riscala is the accepted product-facing identity for the CLI. PSDM remains the method and governance compatibility boundary. The staged migration is defined in `docs/RISCALA_BRAND_MIGRATION.md`; current runtime and package names remain unchanged until their respective migration phases are implemented and validated.

The architecture favors explicit modules over framework abstractions:

- `bin/psdm.mjs` dispatches commands for both the `riscala` primary executable and `psdm` compatibility executable.
- `src/commands/*.mjs` owns user-facing command behavior.
- `src/lib/args.mjs` parses CLI options.
- `src/lib/branding.mjs` centralizes the product, category, method, and executable names used by human-facing entrypoint presentation.
- `src/lib/adr.mjs` owns ADR filename generation and scaffold rendering.
- `src/lib/audit.mjs` builds the non-destructive repository adoption preview, detects existing AI governance files, detects AI runtime surfaces from paths and manifests, and emits the AI readiness audit contract.
- `src/lib/classifier.mjs` owns reusable change classification.
- `src/lib/inspect.mjs` composes staged Git evidence with reusable change classification.
- `src/commands/shell.mjs` owns the interactive readline lifecycle and delegates slash commands to an allowlist router.
- `src/lib/shell.mjs` builds target-specific project context and renders the dependency-free read-only terminal UI.
- `src/lib/action-record.mjs` binds proposed Git commits to repository identity, branch, binary staged diff, classification, and approval policy.
- `src/lib/approval-receipt.mjs` canonicalizes receipt payloads, pins public-key fingerprints, and verifies detached signatures against the live action.
- `src/lib/enforcement.mjs` owns CI-oriented maximum change-level enforcement.
- `src/lib/pr-checklist.mjs` generates pull request checklist content from classification output.
- `src/lib/config.mjs` loads PSDM configuration and validates optional AI policy declarations.
- `src/lib/config.mjs` also applies validation profile presets and exposes the supported profile list.
- `src/lib/artifacts.mjs` defines baseline artifact contracts.
- AI guardrail templates are profile-scoped through `ai-agent` so PSDM can govern AI runtime risk without imposing those artifacts on non-AI projects.
- The Knowledge as Code Layer is documented as a transversal method layer. It does not add CLI dependencies, generated artifacts, or runtime infrastructure requirements.
- `src/lib/risk-paths.mjs` validates and evaluates file path risk rules.
- `src/lib/git.mjs` inspects repository state and parses staged file status using NUL-delimited Git output so path handling remains deterministic.
- `src/validator/validate-method.mjs` evaluates method compliance.

## Architecture Decisions

- Use dependency-free JavaScript modules to keep installation and audit surface small.
- Use JSON output as a stable automation contract while preserving human-readable output.
- Keep configuration local to the target repository through `psdm.config.json`.
- Keep PSDM as a governance layer, not an AI observability platform; runtime traces, dashboards, hosted evals, token telemetry, cost reports, and latency measurements should come from external tools or project-owned scripts.
- Treat Git-backed Markdown and YAML as the source of truth for project knowledge. Vector databases, graph databases, GraphRAG indexes, and agent memories are derived runtime indexes or caches.
- Treat Obsidian as an optional authoring environment, not as a PSDM dependency or as proof that an operational Knowledge Graph exists.
- Treat unsupported profile values as invalid local policy rather than silently relying on default behavior.
- Treat malformed risk path rules as invalid local policy and ignore them during path matching.
- Treat risk classification as advisory unless CI enforcement is explicitly configured through `psdm enforce` or the composite Action.
- Treat Git as the source of staged change evidence; staged inspection must not infer content semantics or silently include unstaged and untracked files.
- Apply a Level 1 floor to staged file changes, then allow deterministic description and risk-path signals to elevate but never lower the result.
- Make adoption audit non-destructive so existing repositories can evaluate impact before initialization.
- Preserve existing agent, assistant, skill, prompt, and Copilot-style instructions during adoption, and create a separate PSDM adoption plan when integration is needed.
- Keep templates plain Markdown so teams can adapt them without special tooling.
- Keep generated artifacts separate from framework docs where possible.
- Separate product branding from method contracts: Riscala may change human-facing identity, while PSDM config, artifacts, and automation remain stable unless explicitly versioned.
- Map both executable names to one entrypoint so compatibility cannot drift into a second implementation.
- Separate agent proposal and execution from human approval; an agent must never issue its own authority.
- Bind high-risk approval receipts to deterministic action content and invalidate them when any bound value changes.
- Treat `AGENTS.md` as a governance adapter, not as the enforcement boundary; hooks, required checks, protected environments, and signature verification provide enforcement.
- Keep the first interactive shell read-only and allowlist-routed; it must not execute arbitrary shell input or expose mutating slash commands before approval enforcement exists.
- Never provide receipt signing inside the agent-accessible CLI; Riscala verifies authority created through an external trusted channel.
- Fail action preparation closed when approval policy is invalid, required trust is missing, or the staged binding cannot be calculated.

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
- staged inspection scope, evidence, decisions, or JSON output;
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
- Knowledge as Code semantics, required artifacts, source-of-truth boundaries, or runtime index expectations.
- Riscala/PSDM naming boundaries, executable compatibility, package transition, or brand migration semantics.
- agent justification, approval receipts, human presence, content binding, or enforcement boundaries.
- interactive shell routing, permitted commands, project-context rendering, or mutation boundaries.
- action-record bindings, approval trust policy, receipt canonicalization, signature verification, expiry, or replay semantics.
