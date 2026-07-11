# Riscala Product Task List

Status: `Active`
Date: `2026-07-11`

## Outcome

The developer works normally in Codex, Claude, Cursor, or another coding agent. Riscala preserves direction across chats, shows exact boundaries, and stops proposed transitions in the developer's language.

The CLI is for setup, inspection, recovery, and automation. It is not the main daily conversation interface.

## Principles

- Agent-native before CLI-centric.
- Spanish and English without configuration expertise.
- Active Work is task direction; `AGENTS.md` is repository-wide policy.
- An LLM may interpret language but never grant authority.
- Repository, path, Git, and CI checks remain deterministic.
- No marketing claim without a working demo.

## P0 — Fix Current Shell Friction

- [x] Show up to five changed paths in the banner and `/status`.
- [x] Preserve staged, unstaged, and untracked markers.
- [x] Show `+N more` without sending unstaged files to `/inspect --staged`.
- [x] Make `/status` visibly refresh state with a timestamp or state delta.
- [x] Show actual `/validate` warning and failure messages.
- [x] Detect path-like `/review` input and explain that an intention is required.
- [x] Suggest the correct `review --file` syntax.
- [x] Confirm Judgment Brief renders each `You decide` item once.
- [x] Make `/approval` reflect effective repository policy.
- [x] Preserve the current `/help` Authority and Safety copy.

Acceptance:

- [x] A warning is actionable without leaving the shell.
- [x] Every initial-panel field has an obvious purpose.
- [x] `/review AGENTS.md` produces corrective guidance, not a misleading Git error.

## P0 — Make Active Work The Entry Point

- [x] Detect `.riscala/ACTIVE_WORK.md` when `riscala shell` starts.
- [x] Show objective, mode, allowed, forbidden, and next action first.
- [x] If missing, offer `/work [mode] <objective>` as the minimal setup.
- [x] Allow continue, close, or propose transition.
- [ ] Move audit, validate, impact, review, and approval to an advanced menu.
- [x] Never overwrite Active Work silently.

Acceptance:

- [x] First use creates a useful boundary in under one minute.
- [x] A new shell session restores direction without reconstructing the repository.
- [x] The first screen answers where, why, what may change, and when to stop once Active Work exists.

## P0 — Spanish And English

- [x] Detect initial language from system locale.
- [x] Translate the primary Active Work, status, help-boundary, and setup messages.
- [x] Add `/language es|en`.
- [x] Persist language in Active Work.
- [x] Keep JSON keys in English.
- [x] Test accents, long Spanish text, wrapping, and monochrome output.

Acceptance:

- [x] A Spanish-speaking developer completes first use without English instructions.
- [x] Language changes presentation, never policy semantics.

## P1 — Agent-Native Continuity

- [ ] Define minimal adapters for Codex, Claude, and Cursor.
- [ ] Keep `.riscala/ACTIVE_WORK.md` as source of truth; adapters only point to it.
- [ ] Require fresh chats to read Active Work before proposing mutation.
- [ ] Compare new requests with repository, objective, mode, allowed, and forbidden.
- [ ] Stop and propose transition when a boundary changes.
- [ ] Keep examples, suggestions, and open questions non-authoritative.
- [ ] Avoid copying full project context into tool-specific files.

Acceptance:

- [ ] Codex, Claude, and Cursor recover the same boundary in fresh chats.
- [ ] All stop on repository and mode transitions.
- [ ] Same-boundary reasoning proceeds without approval noise.

## P1 — Active Work Lifecycle

- [x] Support active, transition proposed, and closed states, with superseded boundaries preserved in history.
- [ ] Preserve decisions, facts, examples, suggestions, questions, and next action.
- [x] Record old mode, requested boundary, changed fields, and explicit continue/close decision.
- [x] Preserve transition history without chat transcripts.
- [ ] Detect repository/Active Work conflicts.

Acceptance:

- [x] Design can transition to implementation without losing the prior boundary history.
- [ ] Repository changes always create a visible transition.
- [x] Closed work cannot be treated silently as active.

## P1 — Deterministic Control

- [ ] Compare current repository with Active Work repository.
- [ ] Compare staged and unstaged paths with allowed and forbidden paths.
- [ ] Report exact file and violated boundary.
- [ ] Distinguish advisory findings from enforced failures.
- [ ] Keep solo-developer defaults lightweight.
- [ ] Preserve optional stricter team and production policy.

Acceptance:

- [ ] Out-of-scope files are identified exactly.
- [ ] Same-scope low-risk work avoids unrelated governance.
- [ ] CI and local boundary results agree.

## P2 — Optional LLM Interpretation

- [ ] Keep Riscala usable without an LLM.
- [ ] Add a provider-neutral OpenAI-compatible endpoint.
- [ ] Support local Ollama first and optional DeepSeek API.
- [ ] Use the model only for language, intent, summary, ambiguity, and possible transitions.
- [ ] Require structured output: language, requested action, possible boundary changes, confidence, questions.
- [ ] Never allow the model to approve, edit authority silently, or invoke tools.
- [ ] Exclude secrets and private data from remote inference.
- [ ] Warn before sending context outside the machine.
- [ ] Fall back to the deterministic guided flow.

Acceptance:

- [ ] Equivalent Spanish and English requests propose equivalent transitions.
- [ ] Invalid model output cannot change Active Work.
- [ ] Local and offline use remains possible.

## P2 — Product Evidence

- [ ] Record a real first-use demo in Spanish.
- [ ] Record fresh-agent continuity.
- [ ] Record repository and mode transition blocks.
- [ ] Test in one real project without modifying another repository.
- [ ] Measure time-to-value, false stops, missed transitions, and confusion.
- [ ] Compare honestly with runtime enforcement and behavioral-contract products.
- [ ] Update positioning only after demos pass.
- [ ] Reproduce the Claude experiment: an inspect-only request must stop before clone, write, or commit actions.

## P2 — Local Repository Consultant

- [ ] Evaluate Gemma locally for Spanish repository questions, summaries, and boundary explanations.
- [ ] Start with bounded file inventory and text search; do not add a vector database initially.
- [ ] Answer with repository-relative file and line references.
- [ ] Treat repository content as untrusted data, never as model instructions.
- [ ] Enforce local-only mode, path allowlists, secret exclusions, ephemeral context, and no training on repository data.
- [ ] Give the consultant no shell, network, write, commit, push, or deploy tools.
- [ ] Support an enterprise-approved bring-your-own local model instead of hard-coding Gemma.

Acceptance:

- [ ] A developer can ask in Spanish how a private repository works without code leaving the machine.
- [ ] Every architectural claim includes inspectable file evidence.
- [ ] Prompt injection inside repository files cannot cause tool execution or broader file access.

## Deferred

- Hosted SaaS and runtime vector/graph memory.
- Trust scores, agent reputation, and arbitrary production tool-call interception.
- Autonomous approval and broad spec generation.
- Additional languages before Spanish and English work well.

## Definition Of Usable

Riscala is usable when a developer opens their preferred coding agent, recovers active work automatically, communicates in their language, sees exact boundaries, and receives a clear stop before a repository, objective, mode, or scope transition—without learning the internal PSDM command set.
