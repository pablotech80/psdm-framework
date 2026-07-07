# SPEC.md

Status: `Active`
Project: `psdm-framework`

## Functional Requirements

- Provide a `psdm` CLI with `init`, `audit`, `check`, `validate`, `classify`, `pr-checklist`, and `report` commands.
- Provide a non-destructive `audit` command that previews repository state and `init` impact.
- Keep the CLI dependency-free and runnable on Node.js 20 or newer.
- Support human-readable command output by default.
- Support JSON output for automation where applicable.
- Read optional `psdm.config.json` policy from the target repository.
- Support validation profiles for common repository types.
- Support feature-scoped artifacts under `docs/features/<feature>/`.
- Classify changes using textual signals and configured risk paths.
- Validate required artifacts, required sections, non-empty files, draft-marker wording, and simple secret-like values.
- Provide templates for newly initialized projects.
- Provide a GitHub Action entrypoint for repository validation.

## Acceptance Criteria

- `npm pack --dry-run` includes the CLI, source, templates, docs, and root governance files.
- `node bin/psdm.mjs help` documents supported commands and options.
- `node bin/psdm.mjs audit <target> --json` emits current artifact state, planned init actions, pros, cons, and recommendations.
- `node bin/psdm.mjs init <target>` creates baseline artifacts without overwriting existing files.
- `node bin/psdm.mjs init <target> --dry-run` previews the same planned actions without writing files.
- `node bin/psdm.mjs validate <target> --json` emits parseable JSON with decision, results, config, git, and target metadata.
- Validation JSON includes the active profile and whether it was recognized.
- `node bin/psdm.mjs classify "<description>" --file <path> --json` includes matched keywords, matched risk paths, required artifacts, and estimated level.
- `node bin/psdm.mjs pr-checklist "<description>" --file <path>` emits a Markdown checklist derived from change level and risk paths.
- `npm test` runs dependency-free CLI fixtures for audit, init dry-run, classify, PR checklist, validate, custom config, and feature artifact behavior.
- A clean repository with filled PSDM artifacts can reach `METHOD_BASELINE_APPROVED`.

## Out of Scope

- Runtime enforcement inside deployed applications.
- Secret scanning beyond simple local pattern detection.
- Full policy-as-code semantics.
- Remote service dependencies.
- Automatic production deployment.
- Replacement for security review, architecture review, or owner approval on high-risk changes.
