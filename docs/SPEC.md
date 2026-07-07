# SPEC.md

Status: `Active`
Project: `psdm-framework`

## Functional Requirements

- Provide a `psdm` CLI with `init`, `check`, `validate`, `classify`, and `report` commands.
- Keep the CLI dependency-free and runnable on Node.js 20 or newer.
- Support human-readable command output by default.
- Support JSON output for automation where applicable.
- Read optional `psdm.config.json` policy from the target repository.
- Support feature-scoped artifacts under `docs/features/<feature>/`.
- Classify changes using textual signals and configured risk paths.
- Validate required artifacts, required sections, non-empty files, draft-marker wording, and simple secret-like values.
- Provide templates for newly initialized projects.
- Provide a GitHub Action entrypoint for repository validation.

## Acceptance Criteria

- `npm pack --dry-run` includes the CLI, source, templates, docs, and root governance files.
- `node bin/psdm.mjs help` documents supported commands and options.
- `node bin/psdm.mjs init <target>` creates baseline artifacts without overwriting existing files.
- `node bin/psdm.mjs validate <target> --json` emits parseable JSON with decision, results, config, git, and target metadata.
- `node bin/psdm.mjs classify "<description>" --file <path> --json` includes matched keywords, matched risk paths, required artifacts, and estimated level.
- A clean repository with filled PSDM artifacts can reach `METHOD_BASELINE_APPROVED`.

## Out of Scope

- Runtime enforcement inside deployed applications.
- Secret scanning beyond simple local pattern detection.
- Full policy-as-code semantics.
- Remote service dependencies.
- Automatic production deployment.
- Replacement for security review, architecture review, or owner approval on high-risk changes.
