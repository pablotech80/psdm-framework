# TODO.md

Status: `Active`
Repository: `psdm-framework`
Last Updated: `2026-07-11`

## Purpose

Track concrete next tasks for Riscala product development and PSDM method preservation.

This file must be updated with every meaningful project advance. Completed items should move to `Done` instead of disappearing without trace.

## Now

- [ ] Execute `docs/PRODUCT_TASK_LIST.md` in priority order, continuing with the Active Work lifecycle and agent adapters.
- [x] Complete and validate the P0 shell visibility and actionable-error increment.
- [x] Make Active Work the shell entry point with `/work`, restoration in `/status`, and non-overwrite protection.
- [x] Add Spanish/English shell onboarding with locale detection, `/language`, and Active Work persistence.
- [x] Make the shell operational with explicit Active Work transition, continue, close, and lifecycle history.
- [x] Add an idempotent universal adapter installer for Codex, Claude, Cursor, Windsurf, OpenCode, and Antigravity.
- [x] Make external Decision Review honor Active Work language and normalize nested-project paths against the Git root.

- [x] Record the continuity experiment and its governance failure without modifying the laboratory repository.
- [x] Reframe beta.6 around Continuity and Control instead of generic technical recommendations.
- [x] Define the minimal Active Work contract and explicit transition rule.
- [x] Record the second beta.6 Product Reset as an accepted ADR and relate it explicitly to the earlier judgment decision.
- [ ] Decide which existing `impact` and `review` behavior remains useful after Active Work validation.
- [x] Implement the smallest beta.6 increment: create and show a non-overwriting Active Work boundary.
- [x] Prepare the versioned beta.6 candidate and pass the full local release check.
- [x] Publish beta.6 through the protected workflow and verify a clean npm install.
- [x] Remove mandatory external commit signatures from this solo-maintainer repository to restore a simple explicit-owner workflow.

- [x] Accept the beta.6 Product Reset centered on amplifying developer judgment.
- [x] Define the beta.6 domain model: Project Context, Observed Evidence, Change Intent, Impact Hypothesis, Decision Option, Owner Decision, Change Envelope, Verification Evidence, and Learning.
- [x] Define the Judgment Brief contract with explicit facts, inferences, options, trade-offs, recommendation, uncertainty, and owner-decision boundaries.
- [x] Define the staged Decision Review contract that compares accepted intent and scope with the real Git diff and validation evidence.
- [x] Specify `learn`, `balanced`, `concise`, and JSON renderings of the same reasoning result.
- [x] Implement the first read-only `riscala impact` Judgment Brief without requiring `riscala init`.
- [x] Add deterministic repository evidence for Git state, manifests, project identity, validation scripts, dependencies, structure, and expected paths.
- [x] Add intent-specific reasoning for authentication, data/schema, delivery, AI behavior, local presentation, and explicit-uncertainty fallback.
- [x] Add fixtures for low-risk concise output, auth learning output, unknown greenfield intent, invalid guidance, no mutation, and developer-only authority.
- [x] Implement an authority-unverified advisory Change Envelope from CLI-declared expected files.
- [x] Implement `riscala review --staged` for expected/staged scope comparison and advisory readiness.
- [x] Detect scope drift, expected files missing from staged state, unexpected sensitive surfaces, and package dependency deltas.
- [x] Add Decision Review fixtures for aligned scope, delivery drift, dependency changes, missing expected scope, no staged changes, and non-approval semantics.
- [x] Validate greenfield first use without init and correct the flow to start with user, problem, outcome, scope, and expensive-to-get-wrong concerns.
- [x] Validate against a temporary snapshot of a real Ptech legacy repository without mutating its source checkout.
- [x] Add bounded selected-file import and HTTP-handler evidence after real validation exposed generic legacy reasoning.
- [x] Add lead/contact/API judgment for consent, data processing, routing, persistence, fallback, and user-visible contracts.
- [x] Refine evidence density and replace ambiguous aligned wording with `scope_aligned_evidence_unverified`.

## Next

- [ ] Specify the transition workflow without simulating human authority.

- [x] Design and validate the greenfield flow so useful reasoning precedes optional artifact creation.
- [x] Design and validate legacy discovery with bounded repository evidence, uncertainty, and no source mutation.
- [x] Map existing audit, classify, inspect, risk-path, config, JSON, and Git primitives into the first judgment loop.
- [ ] Revisit product-direction classification only if the minimal beta.6 implementation requires it.
- [ ] Decide and validate how an explicit owner decision can bind to a Change Envelope without treating agent-controlled CLI input as human-presence proof.
- [x] Add representative learning, balanced, and concise acceptance fixtures.
- [x] Validate beta.6 in a greenfield scenario and a temporary snapshot of a real legacy repository.
- [x] Realign product positioning, README quick start, help hierarchy, shell guidance, and public docs around developer judgment.
- [x] Run a clean-install journey from the package tarball using only public documentation before beta.6 candidate preparation.

## Later

- [ ] Decide whether remote content-bound approval adds value after the judgment loop is validated.
- [ ] Reconsider package and repository migration only after beta.6 usage evidence.
- [ ] Add richer runnable examples that teach technical judgment rather than framework compliance.
- [ ] Verify npm provenance presentation as release evidence, not product direction.

## Done

- [x] Resolve the stale npm `latest` tag by aligning it with `1.0.0-beta.5` after removal remained rejected by the registry.
- [x] Replace the README logo header with the Riscala product hero asset.
- [x] Applied Ptech cyan `#00A8E8` and light accent `#38BDF8` to the interactive shell and `riscala ❯` prompt.
- [x] Added TTY, `NO_COLOR`, `TERM=dumb`, pipe, and ANSI-layout regression coverage without npm lifecycle scripts.
- [x] Added a dependency-free slash command palette with filtering, arrow navigation, Tab completion, Enter execution, and raw-mode restoration.
- [x] Unified `/status`, `/inspect`, and `/help` into complete result panels with wrapped evidence and contextual next actions.
- [x] Added read-only `/audit` to the shell with adoption, artifact, AI-readiness, gap, Git, and next-action summary.
- [x] Replaced internal `/audit` field wording with current-state artifacts, expanded adoption, specific Git state, and Riscala-native recommendations.
- [x] Added prioritized AI gap focus and prevented executable-brand normalization from renaming `psdm.config.json`.
- [x] Added read-only `/validate` to the shell with decision, check counts, focus artifacts, and contextual next action.
- [x] Expanded the read-only shell into a fuller governance console with check, report, classify, PR checklist, init preview, hook status, action record, and approval-boundary commands.
- [x] Prepared `1.0.0-beta.5` release candidate metadata for publishing Riscala shell after explicit owner approval.
- [x] Published `@ptechsolution/psdm-framework@1.0.0-beta.5` through protected trusted publishing.
- [x] Created Git tag and GitHub pre-release `v1.0.0-beta.5`.
- [x] Verified clean install from npm `@beta` for `1.0.0-beta.5`.
- [x] Aligned public docs with published `1.0.0-beta.5` and documented solo-maintainer versus team governance mode.
- [x] Enrolled the first owner public key for content-bound Level 3/4 approval verification.
- [x] Activated the local managed pre-commit hook for this checkout.
- [x] Enabled GitHub branch protection on `main` with solo-maintainer checks, admin enforcement, conversation resolution, and blocked force pushes/deletions.
- [x] Implemented managed pre-commit receipt enforcement with exclusive locking and one-time local consumption.
- [x] Added hook install, status, and removal commands that preserve unmanaged hooks and respect Git hook paths.
- [x] Added fixtures proving low-risk allow, high-risk denial, replay rejection, and existing-hook preservation.
- [x] Classified approval, action-record, replay-enforcement, and Git-hook modules as Level 3 by default.
- [x] Implemented machine-readable `git.commit` action records bound to repository, branch, staged diff, and classification.
- [x] Added fail-closed approval policy with required Level 3/4 approval and pinned trusted approvers.
- [x] Implemented detached signature, key fingerprint, strong-mode, expiry, and live-content receipt verification.
- [x] Added real Ed25519 fixtures for valid approval, phrase rejection, changed content, missing trust, and invalid policy.
- [x] Implemented the read-only dependency-free `riscala shell` MVP with `/help`, `/status`, `/inspect`, and `/exit`.
- [x] Added target-specific shell context and staged/unstaged/untracked working-tree counts.
- [x] Blocked mutating slash commands until content-bound approval enforcement exists.
- [x] Fixed first-record Git porcelain whitespace handling and added shell regression coverage.
- [x] Accepted the Agent Decision Protocol and prohibition on agent self-approval.
- [x] Defined content-bound approval receipts and hardware/remote human-presence boundaries.
- [x] Added before/after decision requirements to repository and generated `AGENTS.md` rules.
- [x] Classified root `AGENTS.md` changes as Level 3 by default.
- [x] Implemented Riscala Phase 1 with dual executable aliases and human-facing product headers.
- [x] Added installed-package parity validation for `riscala` and `psdm`.
- [x] Accepted Riscala as the product identity while preserving PSDM as the governance method.
- [x] Added the Riscala brand migration plan and compatibility boundaries.
- [x] Added dependency-free `psdm inspect --staged` with deterministic Git evidence and JSON output.
- [x] Added staged inspection fixtures for risk-path elevation, the Level 1 floor, renames, no staged changes, and non-Git targets.
- [x] MVP CLI scaffold.
- [x] PSDM templates.
- [x] JSON output mode.
- [x] Config support.
- [x] Feature artifacts.
- [x] Git dirty-state awareness.
- [x] GitHub Action MVP.
- [x] Tool registry draft.
- [x] Backend/platform risk path classification.
- [x] Repository-level `AGENTS.md`.
- [x] Root `ROADMAP.md`.
- [x] Root `TODO.md`.
- [x] Root `psdm.config.json` for this repository.
- [x] Initialized missing PSDM baseline artifacts for the framework itself.
- [x] Refined draft-marker detection for operational `TODO.md` references.
- [x] Added pre-init audit for existing projects.
- [x] Added `psdm pr-checklist`.
- [x] Added CLI fixtures for audit, classify, and checklist behavior.
- [x] Added CLI fixtures for validate, custom config, and feature artifacts.
- [x] Added validation profiles.
- [x] Restored fresh-template review warning for unresolved draft markers.
- [x] Added formal validation for unsupported profiles.
- [x] Added config schema stability documentation.
- [x] Required rationale for every final `Siguiente accion`.
- [x] Added CI change-level enforcement.
- [x] Added risk path schema validation.
- [x] Added ADR generation.
- [x] Prepared beta release notes.
- [x] Created public docs index.
- [x] Added existing AI governance detection to audit.
- [x] Added PSDM adoption plan generation for existing AI governance.
- [x] Completed AI readiness gap analysis for governance, guardrails, costs, latency, prompt injection, and PII.
- [x] Defined the AI readiness audit contract for `psdm audit --json`.
- [x] Added human-readable AI readiness output to `psdm audit`.
- [x] Added AI readiness audit fixture coverage.
- [x] Implemented AI surface detection in `src/lib/audit.mjs`.
- [x] Added governance gap detection for AI readiness artifact groups.
- [x] Designed optional AI policy fields for `psdm.config.json`.
- [x] Added AI policy validation fixtures.
- [x] Accepted ADR keeping PSDM as governance layer, not AI observability platform.
- [x] Added AI guardrail templates for PII, prompt injection, cost, latency, evals, and tool security.
- [x] Added `ai-agent` profile fixture for AI guardrail artifact creation.
- [x] Bumped package status to `0.17.0-alpha`.
- [x] Documented downstream GitHub Action validation protocol.
- [x] Fixed downstream Action smoke bootstrap issues found during first external run.
- [x] Fixed `psdm init` idempotence for PSDM-managed `AGENTS.md`.
- [x] Executed downstream GitHub Action validation with pass and expected-fail evidence.
- [x] Added example project fixture coverage.
- [x] Prepared public package release checklist.
- [x] Decided package metadata gaps before beta.
- [x] Defined public npm release automation.
- [x] Decided final beta version string and dist-tag.
- [x] Bumped package status to `1.0.0-beta.1`.
- [x] Ran strict release check on clean tree.
- [x] Checked npm publish readiness and found npm auth missing.
- [x] Configured npm CLI authentication.
- [x] Ran npm publish dry-run for `1.0.0-beta.1`.
- [x] Normalized `bin.psdm` package metadata before publish.
- [x] Started public repository readiness cleanup.
- [x] Sanitized private downstream validation evidence from public docs.
- [x] Added root `CONTRIBUTING.md` and `SECURITY.md`.
- [x] Added public `CODE_OF_CONDUCT.md`, issue templates, and PR template.
- [x] Revalidated release check and npm publish dry-run after public-readiness cleanup.
- [x] Added README branding polish, logo reference, badges, and governance flow.
- [x] Added GitHub metadata guidance for public beta presentation.
- [x] Added `assets` to package allowlist for npm README logo rendering.
- [x] Documented PSDM model and tool independence for Claude, Cursor, Copilot, Codex, skills, prompts, and agents.
- [x] Added model and tool independence rule to generated `AGENTS.md` template and repository `AGENTS.md`.
- [x] Added README table of contents for public navigation.
- [x] Polished README density, CLI grouping, minimal config example, footer, and publication metadata checklist.
- [x] Configured GitHub repository description, website, and topics for public beta.
- [x] Documented public security reporting policy.
- [x] Added CodeQL, dependency review, Dependabot config, GitHub security settings, and private vulnerability reporting.
- [x] Added npm trusted publishing/provenance plan and public package metadata.
- [x] Defined release evidence, tag policy, and beta exit criteria.
- [x] Confirmed npm scope ownership for `@ptechsolution` and updated package scope.
- [x] Added protected npm trusted publishing workflow for first beta.
- [x] Decided one-time manual bootstrap path after npm trusted publisher `E404`.
- [x] Published `@ptechsolution/psdm-framework@1.0.0-beta.1`.
- [x] Created Git tag and GitHub pre-release `v1.0.0-beta.1`.
- [x] Verified clean install from npm `@beta`.
- [x] Prepared `1.0.0-beta.2` candidate for README presentation updates.
- [x] Ran `npm publish --dry-run --access public --tag beta` for `1.0.0-beta.2`.
- [x] Published `@ptechsolution/psdm-framework@1.0.0-beta.2`.
- [x] Created Git tag and GitHub pre-release `v1.0.0-beta.2`.
- [x] Verified clean install from npm `@beta` for `1.0.0-beta.2`.
- [x] Confirmed npm account 2FA is active during `1.0.0-beta.2` publication.
- [x] Regenerated npm recovery codes after publication support.
- [x] Configured npm trusted publishing for GitHub Actions.
- [x] Added protected workflow dry-run mode and expected-version guard for npm publishing.
- [x] Ran protected npm publish workflow in `dry_run` mode successfully.
- [x] Prepared `1.0.0-beta.3` candidate for trusted publishing validation.
- [x] Ran protected npm publish workflow in `dry_run` mode for `1.0.0-beta.3`.
- [x] Published `@ptechsolution/psdm-framework@1.0.0-beta.3` through trusted publishing.
- [x] Created Git tag and GitHub pre-release `v1.0.0-beta.3`.
- [x] Verified clean install from npm `@beta` for `1.0.0-beta.3`.
- [x] Promoted npm `@beta` as the primary public install command in README.
- [x] Prepared GitHub social preview image asset at `assets/psdm-social-preview.png`.
- [x] Uploaded GitHub social preview image in repository settings.
- [x] Documented Knowledge as Code Layer as optional method guidance.
- [x] Prepared `1.0.0-beta.4` candidate for Knowledge as Code documentation publication.
- [x] Fixed release checker package dry-run parsing for protected npm workflow.
- [x] Hardened release checker package manifest detection for wrapped npm pack JSON output in CI.
- [x] Removed unconditional `npm@latest` upgrade from protected npm workflow.
- [x] Ran protected npm publish workflow dry-run for `1.0.0-beta.4`.
- [x] Recorded explicit owner approval with `CONFIRM NPM BETA PUBLISH`.
- [x] Published `@ptechsolution/psdm-framework@1.0.0-beta.4` through trusted publishing.
- [x] Created Git tag and GitHub pre-release `v1.0.0-beta.4`.
- [x] Verified clean install from npm `@beta` for `1.0.0-beta.4`.
- [x] Bumped package status to `0.16.0-alpha`.
- [x] Bumped package status to `0.15.0-alpha`.
- [x] Bumped package status to `0.14.0-alpha`.
- [x] Filled `docs/PROJECT_BRIEF.md` with framework-specific context.
- [x] Filled `docs/SPEC.md` with CLI/config behavior scope.
- [x] Filled `docs/ARCHITECTURE.md` with current module boundaries.
- [x] Filled `docs/TESTING.md` with validation commands and expected outcomes.
- [x] Filled `docs/SECURITY.md` with secret/data/tooling assumptions.
- [x] Filled `docs/DEPLOYMENT.md` with npm/GitHub release assumptions.
- [x] Filled `docs/OPERATIONS.md` with maintenance and CI expectations.
- [x] Bumped package status to `0.9.0-alpha`.
- [x] Bumped package status to `0.10.0-alpha`.
- [x] Bumped package status to `0.11.0-alpha`.
- [x] Bumped package status to `0.12.0-alpha`.
- [x] Bumped package status to `0.13.0-alpha`.

## Update Rule

Every implementation advance must update this file when it completes a task, creates a new task, changes priority, or changes the next execution target.
