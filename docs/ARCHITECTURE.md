# ARCHITECTURE.md

Status: `Active`
Project: `psdm-framework`

## System Overview

PSDM is a small Node.js CLI package. The executable entrypoint is `bin/psdm.mjs`; command implementations live under `src/commands`; shared helpers live under `src/lib`; validation logic lives under `src/validator`; project templates live under `templates`.

Riscala is the accepted product-facing identity for the CLI. PSDM remains the method and governance compatibility boundary. The staged migration is defined in `docs/RISCALA_BRAND_MIGRATION.md`; current runtime and package names remain unchanged until their respective migration phases are implemented and validated.

For beta.6, Riscala's primary architecture is a developer-judgment loop rather than artifact compliance. PSDM supplies the construction and reasoning questions; Riscala connects developer intent, repository evidence, explicit owner decisions, AI-assisted execution, staged verification, and selective learning. The domain model and trust boundaries are defined in `docs/JUDGMENT_ARCHITECTURE.md`.

The product entry boundary is read-only `impact` before implementation and `review` against staged evidence afterward. It requires no repository initialization. PSDM artifacts, approvals, hooks, and CI form a deeper risk-scaled layer when durable policy or higher-risk delivery justifies them; they are not mandatory daily ceremony for low-risk work.

The target component flow is:

```text
Project Context + Change Intent
  -> Evidence Collection
  -> Criterion Engine
  -> Judgment Brief
  -> Owner Decision
  -> Change Envelope
  -> Execution Adapter
  -> Staged Decision Review
  -> Learning Candidate
```

Existing audit, classifier, risk-path, staged-inspection, validation, JSON, CI, action-record, approval, and hook modules are reusable primitives. They are not individually the product flow. New beta.6 modules must compose them without duplicating their deterministic evidence contracts.

The architecture favors explicit modules over framework abstractions:

- `src/lib/active-work.mjs` owns the minimal Active Work path, rendering, non-overwriting creation, and reading.
- `src/commands/work.mjs` exposes `work init` and `work show` without coupling continuity to approval enforcement.
- `bin/psdm.mjs` dispatches commands for both the `riscala` primary executable and `psdm` compatibility executable.
- `src/commands/*.mjs` owns user-facing command behavior.
- `src/lib/args.mjs` parses CLI options.
- `src/lib/branding.mjs` centralizes the product, category, method, and executable names used by human-facing entrypoint presentation.
- `src/lib/adr.mjs` owns ADR filename generation and scaffold rendering.
- `src/lib/audit.mjs` builds the non-destructive repository adoption preview, detects existing AI governance files, detects AI runtime surfaces from paths and manifests, and emits the AI readiness audit contract.
- `src/lib/classifier.mjs` owns reusable change classification.
- `src/lib/judgment.mjs` builds beta.6 Project Context, deterministic Observed Evidence, inferred impact hypotheses, owner-authority boundaries, and learn/balanced/concise Judgment Brief rendering.
- `src/commands/impact.mjs` exposes the additive read-only `riscala impact` command and JSON entrypoint without requiring initialization.
- `src/lib/decision-review.mjs` builds an authority-unverified advisory Change Envelope and compares it with staged files, observed risk surfaces, package dependency deltas, and validation evidence.
- `src/commands/review.mjs` exposes the read-only staged Decision Review while preserving the distinction between alignment and owner approval.
- `src/lib/inspect.mjs` composes staged Git evidence with reusable change classification.
- `src/commands/shell.mjs` owns the interactive readline lifecycle and delegates slash commands to an allowlist router.
- `src/lib/shell.mjs` builds target-specific project context, manages the Active Work lifecycle, reuses judgment and inspection engines, and renders the dependency-free governance console.
- `src/lib/terminal-style.mjs` owns Ptech cyan tokens, ANSI styling, and TTY/`NO_COLOR` capability detection.
- `src/lib/shell-menu.mjs` owns slash-command metadata, filtering, selection movement, and palette rendering.
- `src/lib/shell-session.mjs` owns raw TTY input, cursor-safe redraw, line editing, and keyboard navigation while delegating command execution to the existing allowlist router.
- `src/lib/action-record.mjs` binds proposed Git commits to repository identity, branch, binary staged diff, classification, and approval policy.
- `src/lib/approval-receipt.mjs` canonicalizes receipt payloads, pins public-key fingerprints, and verifies detached signatures against the live action.
- `src/lib/approval-enforcement.mjs` consumes verified receipts under an exclusive lock and persists a non-secret local replay ledger.
- `src/lib/git-hook.mjs` installs, inspects, and removes only Riscala-managed pre-commit hooks while preserving existing hooks.
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

- Treat amplification of developer judgment as Riscala's primary product responsibility; project artifact governance remains a PSDM capability, not the default daily experience.
- Keep observed evidence, inference, options, recommendations, owner decisions, and verification as distinct domain concepts.
- Require explicit developer authority for `OwnerDecision`; neither Riscala nor an AI agent may synthesize that authority.
- Use risk to select reasoning depth and evidence, not to impose documents automatically.
- Make greenfield first use intent-first and legacy first use read-only and evidence-first.
- Use staged Git state as the beta.6 implementation boundary for Decision Review while reporting unstaged and untracked state separately.
- Treat CLI-declared expected scope as unverified comparison input; it must never be presented as owner identity, approval, or content-bound authority.
- Render one reasoning model through learn, balanced, concise, and JSON views rather than maintaining persona-specific decision logic.
- Preserve current enforcement as an optional advanced boundary; do not make remote approval a beta.6 prerequisite.

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
- Keep terminal styling outside data and automation contracts; ANSI output is allowed only for interactive human presentation.
- Do not add npm lifecycle scripts or artificial delays solely to simulate installation progress.
- Use raw terminal mode only for an actual input/output TTY and restore the previous terminal state on every supported exit path.
- Keep slash-command metadata allowlisted; the palette must never become an arbitrary shell launcher.
- Never provide receipt signing inside the agent-accessible CLI; Riscala verifies authority created through an external trusted channel.
- Fail action preparation closed when approval policy is invalid, required trust is missing, or the staged binding cannot be calculated.
- Treat local hook and replay state as defense in depth, not as an agent-resistant boundary; protected remote enforcement remains required.

## Architecture Gate

Changes require architecture review when they affect:

- Judgment Brief or Decision Review domain contracts;
- observed/inferred/recommended/owner-decision trust boundaries;
- Change Envelope content or persistence;
- greenfield or legacy context discovery;
- explanation-density semantics;
- scope-drift or implementation-evidence comparison;

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
- terminal color capability detection, brand tokens, prompt rendering, or ANSI isolation.
- slash-menu filtering, selection, raw-mode lifecycle, cursor redraw, or keyboard behavior.
- action-record bindings, approval trust policy, receipt canonicalization, signature verification, expiry, or replay semantics.
- Git hook installation, existing-hook preservation, receipt consumption, local locks, or enforcement bypass boundaries.
