# SPEC.md

Status: `Active`
Project: `psdm-framework`

## Functional Requirements

- Provide a `psdm` CLI with `adr`, `init`, `audit`, `check`, `validate`, `classify`, `enforce`, `pr-checklist`, and `report` commands.
- Provide a non-destructive `audit` command that previews repository state and `init` impact.
- Keep the CLI dependency-free and runnable on Node.js 20 or newer.
- Support human-readable command output by default.
- Support JSON output for automation where applicable.
- Read optional `psdm.config.json` policy from the target repository.
- Support validation profiles for common repository types.
- Fail validation when `psdm.config.json` declares an unsupported profile.
- Fail validation when `psdm.config.json` declares malformed `riskPaths`.
- Document the stable config schema contract in `docs/CONFIG_SCHEMA.md`.
- Support feature-scoped artifacts under `docs/features/<feature>/`.
- Classify changes using textual signals and configured risk paths.
- Enforce maximum allowed change level for CI policy gates.
- Generate ADR scaffolds under `ADRs/` for durable architecture and governance decisions.
- Validate required artifacts, required sections, non-empty files, draft-marker wording, and simple secret-like values.
- Provide templates for newly initialized projects.
- Provide a GitHub Action entrypoint for repository validation.

## Acceptance Criteria

- `npm pack --dry-run` includes the CLI, source, templates, docs, and root governance files.
- `node bin/psdm.mjs help` documents supported commands and options.
- `node bin/psdm.mjs audit <target> --json` emits current artifact state, planned init actions, pros, cons, and recommendations.
- `node bin/psdm.mjs adr "<title>" --target <target> --json` creates a non-overwriting ADR file under `ADRs/`.
- `node bin/psdm.mjs init <target>` creates baseline artifacts without overwriting existing files.
- `node bin/psdm.mjs init <target> --dry-run` previews the same planned actions without writing files.
- `node bin/psdm.mjs validate <target> --json` emits parseable JSON with decision, results, config, git, and target metadata.
- Validation JSON includes the active profile and whether it was recognized.
- Unsupported profiles produce a validation failure on `psdm.config.json`.
- Invalid risk path rules produce validation failures on `psdm.config.json`.
- `node bin/psdm.mjs classify "<description>" --file <path> --json` includes matched keywords, matched risk paths, required artifacts, and estimated level.
- `node bin/psdm.mjs enforce "<description>" --file <path> --max-level "Level 2" --json` exits non-zero when the estimated level exceeds the allowed level.
- `node bin/psdm.mjs pr-checklist "<description>" --file <path>` emits a Markdown checklist derived from change level and risk paths.
- `npm test` runs dependency-free CLI fixtures for audit, ADR generation, init dry-run, classify, enforce, PR checklist, validate, custom config, validation profiles, invalid risk paths, and feature artifact behavior.
- A clean repository with filled PSDM artifacts can reach `METHOD_BASELINE_APPROVED`.

## Out of Scope

- Runtime enforcement inside deployed applications.
- Secret scanning beyond simple local pattern detection.
- Full policy-as-code semantics.
- Remote service dependencies.
- Automatic production deployment.
- Replacement for security review, architecture review, or owner approval on high-risk changes.
