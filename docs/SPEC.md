# SPEC.md

Status: `Active`
Project: `psdm-framework`

## Functional Requirements

### Beta.6 Developer Judgment

- Provide a repository-grounded Judgment Brief from a developer's change intent without requiring prior `riscala init`.
- Separate observed facts, semantic inference, options, recommendations, uncertainty, and owner decisions in human-readable and machine-readable results.
- Treat owner decisions as external authority that Riscala and AI agents may request or record but never create, infer, approve, or simulate.
- Build a minimal tool-neutral Change Envelope from accepted intent, scope, constraints, expected impact, required evidence, and stop conditions.
- Compare a Change Envelope with staged Git evidence through a Decision Review.
- Report scope drift, unexpected risk surfaces, new dependencies, schema or migration impact, config/CI/deployment changes, missing validation, and contradictions when observable.
- Render the same underlying reasoning result in `learn`, `balanced`, `concise`, and JSON forms without weakening safety semantics.
- Explain why a consequence matters in learning output and avoid repeating obvious context in concise output.
- Support greenfield reasoning from intent and legacy reasoning from read-only repository discovery.
- Reuse existing audit, Git, inspection, risk-path, config, JSON, CI, and approval primitives without making artifact compliance the primary daily experience.
- Keep existing commands and JSON contracts compatible while beta.6 contracts remain additive.
- Keep SaaS, remote approval, autonomous owner decisions, package/repository migration, and runtime knowledge infrastructure out of beta.6.

- Provide a `psdm` CLI with `action`, `approval`, `adr`, `init`, `audit`, `check`, `validate`, `inspect`, `shell`, `classify`, `enforce`, `pr-checklist`, and `report` commands.
- Provide a non-destructive `audit` command that previews repository state and `init` impact.
- Detect existing AI governance files during audit and recommend integration without overwrite.
- Emit an `aiReadiness` contract from `riscala audit --json` and its `psdm` compatibility equivalent for AI surface and governance gap reporting.
- Detect AI readiness surfaces from common folders and manifests for agents, RAG, prompts, embeddings, tools, provider SDKs, vector stores, and automation.
- Create `docs/PSDM_ADOPTION.md` during init when existing AI governance files are detected.
- Do not create an adoption plan only because a repository already contains PSDM-managed `AGENTS.md`.
- Keep the CLI dependency-free and runnable on Node.js 20 or newer.
- Present Riscala as the product-facing CLI identity while preserving PSDM as the governance method.
- Expose `riscala` and `psdm` as compatible executables backed by the same entrypoint.
- Support human-readable command output by default.
- Support JSON output for automation where applicable.
- Read optional `psdm.config.json` policy from the target repository.
- Support validation profiles for common repository types.
- Fail validation when `psdm.config.json` declares an unsupported profile.
- Fail validation when `psdm.config.json` declares malformed `riskPaths`.
- Support optional `ai` policy fields in `psdm.config.json` for PII, redaction, cost, latency, tools, evals, prompt-injection tests, and approvals.
- Fail validation when declared `ai` policy fields have invalid types.
- Provide AI guardrail templates for AI-agent repositories without adding native observability or hosted eval execution.
- Document the stable config schema contract in `docs/CONFIG_SCHEMA.md`.
- Support feature-scoped artifacts under `docs/features/<feature>/`.
- Classify changes using textual signals and configured risk paths.
- Classify root `AGENTS.md` changes as at least Level 3 by default.
- Classify approval, action-record, receipt, replay-enforcement, and Git-hook modules as at least Level 3 by default.
- Inspect staged Git changes without requiring a manual description or file list.
- Treat any staged file change as at least Level 1 and preserve configured risk paths as the deterministic elevation mechanism.
- Emit staged file status, risk-path evidence, and classification in human-readable and JSON output.
- Provide a dependency-free read-only interactive shell with `/help`, `/status`, `/audit`, `/validate`, `/inspect`, and `/exit` routing.
- Calculate shell project, branch, change counts, and active policy from the selected target instead of hardcoding repository context.
- Reject arbitrary input and mutating slash commands until content-bound approval verification is implemented.
- Render the interactive shell with Ptech cyan `#00A8E8`, light accent `#38BDF8`, and semantic repository-state colors when the output is a capable TTY.
- Emit monochrome output for pipes, non-TTY streams, `TERM=dumb`, and `NO_COLOR` without changing visible text or layout.
- Preserve dependency-free, sub-second installation without a visual-only npm `postinstall` script.
- Open an allowlisted command palette when `/` is typed at the start of an interactive TTY prompt.
- Support prefix filtering, arrow navigation, Enter execution, Tab completion, Escape dismissal, and basic cursor editing without changing command authorization.
- Restore terminal raw mode on normal exit, `/exit`, `Ctrl+C`, and `Ctrl+D` paths.
- Render `/status`, `/audit`, `/validate`, `/inspect`, and `/help` through a consistent fixed-width result-panel grammar with wrapped evidence and contextual next actions.
- Reuse the existing non-destructive audit engine for `/audit`; do not duplicate detection logic or invoke initialization.
- Translate internal audit fields into product-facing shell copy without changing the stable audit JSON contract, and recommend the `riscala` executable rather than its `psdm` compatibility alias.
- Preserve stable compatibility artifact names such as `psdm.config.json` when normalizing executable recommendations, and summarize the highest-priority AI gaps in the shell panel.
- Reuse the existing read-only validator for `/validate`, summarize its decision and findings, and never create or update target artifacts.
- Generate a machine-readable `git.commit` action record bound to repository identity, branch, full staged diff hash, and change classification.
- Require Level 3 and Level 4 approval policy and fail action preparation closed when trusted approvers are missing or policy is invalid.
- Verify signed receipts against live staged content, pinned public-key fingerprints, allowed strong approval modes, and configured expiry limits.
- Provide no receipt-signing command inside Riscala.
- Enforce verified Git commit receipts through a managed pre-commit hook and consume each approval ID once in local state.
- Refuse to overwrite existing unmanaged pre-commit hooks and support removal only for Riscala-managed hooks.
- Enforce maximum allowed change level for CI policy gates.
- Generate ADR scaffolds under `ADRs/` for durable architecture and governance decisions.
- Create `ADRs/README.md` during baseline init so the ADR directory is versionable in Git.
- Validate required artifacts, required sections, non-empty files, draft-marker wording, and simple secret-like values.
- Provide templates for newly initialized projects.
- Provide a GitHub Action entrypoint for repository validation.
- Define a model-independent Agent Decision Protocol for meaningful mutating actions.
- Require generated agent rules to prohibit self-approval and require why, expected improvement, risk, validation, evidence, and next-action rationale.
- Treat confirmation phrases as intent signals rather than proof of human identity.
- Maintain at least one downstream-like example fixture that exercises audit, init, and validate behavior.

## Acceptance Criteria

### Beta.6 Judgment Loop

- A greenfield repository receives a useful first Judgment Brief from intent without generated artifacts.
- A legacy repository receives observed evidence, inferred boundaries, unknowns, and confidence without mutation.
- Observed claims include repository-relative provenance and are never merged with semantic inference.
- An owner-decision field cannot be completed by Riscala or an AI agent.
- A low-risk change produces a short result without mandatory documents or manufactured alternatives.
- A learning result explains at least one reusable technical reasoning principle for a representative high-risk change.
- A concise result omits obvious background while retaining non-obvious impact, contradictions, uncertainty, and evidence gaps.
- Decision Review uses staged Git state and reports unstaged/untracked state separately.
- A staged file outside the accepted scope is reported as drift.
- Representative dependency, migration, CI/deployment, and missing-test deviations are detected when supported by deterministic evidence.
- Existing command fixtures, executable alias parity, config compatibility, and JSON contracts remain green.

- `npm pack --dry-run` includes the CLI, source, templates, docs, and root governance files.
- `node bin/psdm.mjs help` documents supported commands and options.
- Installed `riscala help` and `psdm help` produce identical output, with Riscala as the product and PSDM as the method.
- `node bin/psdm.mjs audit <target> --json` emits current artifact state, planned init actions, pros, cons, and recommendations.
- Audit JSON includes existing AI governance detection and an adoption mode of `initialize` or `integrate`.
- Audit JSON includes `aiReadiness.version`, `status`, `surfaces`, `governanceArtifacts`, `gaps`, and `recommendations`.
- AI readiness surfaces include path and manifest signals such as `rag`, `prompts`, `package.json:openai`, and `requirements.txt:tiktoken`.
- `node bin/psdm.mjs init <target>` creates `docs/PSDM_ADOPTION.md` when adopting into a repository with existing AI governance files.
- Re-running `node bin/psdm.mjs init <target>` on a PSDM-initialized repository does not create a false adoption plan.
- `node bin/psdm.mjs adr "<title>" --target <target> --json` creates a non-overwriting ADR file under `ADRs/`.
- `node bin/psdm.mjs init <target>` creates baseline artifacts without overwriting existing files.
- Initialized baselines include a tracked `ADRs/README.md` file.
- `node bin/psdm.mjs init <target> --dry-run` previews the same planned actions without writing files.
- `node bin/psdm.mjs validate <target> --json` emits parseable JSON with decision, results, config, git, and target metadata.
- Validation JSON includes the active profile and whether it was recognized.
- Validation JSON includes normalized `config.ai` policy values.
- Unsupported profiles produce a validation failure on `psdm.config.json`.
- Invalid risk path rules produce validation failures on `psdm.config.json`.
- Invalid AI policy fields produce validation failures on `psdm.config.json`.
- `profile: "ai-agent"` creates guardrail artifacts for AI behavior, data classification, cost/latency budgets, prompt-injection tests, and eval governance.
- `node bin/psdm.mjs classify "<description>" --file <path> --json` includes matched keywords, matched risk paths, required artifacts, and estimated level.
- `AGENTS.md` path classification returns at least Level 3 and requires architecture, security, specification, and testing artifacts.
- `node bin/psdm.mjs inspect --staged --json` reads only the Git index and emits `decision`, `git.changes`, `files`, `evidence`, and `classification`.
- Staged files with no matching risk path classify as at least Level 1; matching risk paths can raise the result to Level 2, Level 3, or Level 4.
- Staged inspection reports `NO_STAGED_CHANGES` without failure and exits non-zero with `NOT_A_GIT_REPOSITORY` when the target is not a Git repository.
- `node bin/psdm.mjs shell <target>` renders target-specific context and routes `/help`, `/status`, `/audit`, `/validate`, `/inspect`, and `/exit` through an allowlist.
- The shell distinguishes staged, unstaged, and untracked Git changes without mutating the repository.
- `/commit`, `/push`, `/pr`, `/merge`, `/publish`, `/release`, and `/deploy` are blocked in the read-only shell.
- Colored and monochrome shell rendering have identical visible text after ANSI removal, and piped shell sessions contain no ANSI escape sequences.
- The slash palette exposes only `/help`, `/status`, `/audit`, `/validate`, `/inspect`, and `/exit`; navigation wraps and filtered selection executes through the existing command router.
- `/audit` reports the same underlying adoption and AI-readiness state as `riscala audit` without modifying the target.
- `/validate` reports the same underlying decision and counts as `riscala validate` without modifying the target.
- Non-interactive shell sessions retain the existing newline-driven contract without cursor-control sequences.
- Shell result panels preserve their visible layout with and without ANSI color and keep long inspection evidence inside the panel boundary.
- `node bin/psdm.mjs action prepare git.commit --json` emits `ACTION_RECORD_READY`, `APPROVAL_POLICY_INCOMPLETE`, or `APPROVAL_POLICY_INVALID` without changing the repository.
- `node bin/psdm.mjs approval verify git.commit --receipt <path> --json` rebuilds the live binding and accepts only an unexpired detached signature from a configured approver.
- Modifying the staged diff, branch, repository, action, approver, key fingerprint, approval mode, or receipt lifetime invalidates approval.
- A cryptographically signed `phrase` approval is rejected because the mode does not establish the required human-presence boundary.
- `riscala approval enforce git.commit` allows unregulated lower-level changes, consumes one valid required receipt, and rejects local replay.
- `riscala hook install pre-commit` installs an executable managed hook at Git's resolved hook path and reports conflicts without overwriting existing content.
- `node bin/psdm.mjs enforce "<description>" --file <path> --max-level "Level 2" --json` exits non-zero when the estimated level exceeds the allowed level.
- `node bin/psdm.mjs pr-checklist "<description>" --file <path>` emits a Markdown checklist derived from change level and risk paths.
- `npm test` runs dependency-free CLI fixtures for the interactive shell, audit, existing AI governance detection, adoption plan creation, ADR generation, init dry-run, classify, staged inspection, enforce, PR checklist, validate, custom config, AI policy validation, AI guardrail templates, validation profiles, invalid risk paths, and feature artifact behavior.
- `npm test` covers the `examples/nextjs-saas` fixture by auditing, initializing, and validating a temporary copy.
- The release check installs the local package and verifies both executable aliases from `node_modules/.bin`.
- Initialized `AGENTS.md` includes the Agent Decision Protocol and self-approval prohibition.
- A clean repository with filled PSDM artifacts can reach `METHOD_BASELINE_APPROVED`.

## Out of Scope

- Runtime enforcement inside deployed applications.
- Native AI observability, tracing, dashboards, hosted eval execution, or LangSmith-style runtime telemetry.
- Deep code-level semantic AI readiness detection.
- Secret scanning beyond simple local pattern detection.
- Full policy-as-code semantics.
- Remote service dependencies.
- Automatic production deployment.
- Receipt signing, hardware-key ceremony integration, remote approval service, remote replay persistence, protected required-check enforcement, or mutating slash commands until separately implemented and validated.
- Replacement for security review, architecture review, or owner approval on high-risk changes.
