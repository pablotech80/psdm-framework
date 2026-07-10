# Riscala Brand Migration

Status: `Accepted Plan`
Date: `2026-07-10`
Product: `Riscala`
Method: `PTECH SPEC-DRIVEN METHOD (PSDM)`

## Purpose

Define the staged transition from `PSDM Framework` as both method and product name to this explicit architecture:

```text
Riscala
AI Code Governance for Software Delivery
Powered by PSDM
```

This plan prevents a branding decision from breaking existing CLI users, repository configuration, CI automation, or JSON consumers.

## Naming Boundaries

| Surface | Decision |
|---|---|
| Product | `Riscala` |
| Category | `AI Code Governance for Software Delivery` |
| Method | `PSDM` / `PTECH SPEC-DRIVEN METHOD` |
| Future primary executable | `riscala` |
| Compatibility executable | `psdm` |
| Current package | `@ptechsolution/psdm-framework` |
| Candidate future package | `@ptechsolution/riscala` |
| Initial config source of truth | `psdm.config.json` |
| JSON contracts | Stable, untranslated, and unchanged by branding |

## Non-Negotiable Compatibility Rules

- Do not remove or silently change the `psdm` executable during the initial migration.
- Do not change JSON field names, decision codes, exit codes, or level identifiers for branding reasons.
- Keep `psdm.config.json` readable as the existing source of project governance.
- Do not overwrite tool-specific instructions or generated project artifacts during migration.
- Do not publish a new npm package, change npm dist-tags, rename the GitHub repository, or remove compatibility paths without explicit owner approval.
- Treat package publication, repository rename, and GitHub Action changes as separate Level 4 increments.

## Phase 0 - Decision And Planning

Status: `Complete`

- Accept the Riscala product identity through an ADR.
- Record product, category, method, and compatibility boundaries.
- Add the migration plan to the public documentation index.
- Keep runtime behavior and published package metadata unchanged.

## Phase 1 - Dual Executable And Human Presentation

Status: `Planned`

- Add `riscala` as a second executable pointing to the same dependency-free entrypoint.
- Retain `psdm` with identical command behavior and exit codes.
- Add fixture coverage proving parity between both executables.
- Change only human-facing product headers to `Riscala`, with `Powered by PSDM` context.
- Keep JSON payload fields and command identifiers stable.
- Add `riscala shell` only after executable parity is validated.

Exit criteria:

- `riscala help` and `psdm help` expose the same supported commands.
- Existing CLI fixtures pass through the compatibility executable.
- Package dry-run includes both executable mappings.
- No config or JSON migration is required for existing projects.

## Phase 2 - Package Transition

Status: `Planned`

- Recheck npm, GitHub, domain, and trademark risk immediately before publication.
- Prepare `@ptechsolution/riscala` as the primary package candidate.
- Define whether `@ptechsolution/psdm-framework` remains a full compatibility package or becomes a thin migration package.
- Validate trusted publishing, provenance, tarball contents, clean installation, and rollback.
- Publish only after explicit owner approval through the protected release process.

Exit criteria:

- Both fresh installation and upgrade paths are documented and tested.
- The old package produces no broken executable or config paths.
- npm dist-tags and release evidence are explicit.
- Rollback to the last PSDM beta remains possible.

## Phase 3 - Repository And Documentation Transition

Status: `Planned`

- Decide whether the GitHub repository becomes `riscala` or `riscala-cli`.
- Update repository metadata, badges, package links, security reporting, release docs, and social assets.
- Preserve GitHub redirects and historical PSDM documentation.
- Document that PSDM remains the governance method behind Riscala.

## Phase 4 - Compatibility Review

Status: `Planned`

- Measure usage of the `psdm` compatibility executable where evidence is available.
- Define a deprecation policy only after stable Riscala adoption.
- Do not remove `psdm` in a minor or patch release.
- Require a new ADR before removing the compatibility executable or renaming the config source of truth.

## Explicitly Deferred

- Translating slash commands.
- Translating JSON or automation contracts.
- Renaming `psdm.config.json`.
- Publishing `@ptechsolution/riscala`.
- Purchasing a domain or filing a trademark.
- Renaming the GitHub repository.
- Designing or implementing the interactive terminal shell.

These items are deferred so the product identity and compatibility contract are reviewed before implementation expands the public surface.

## Next Gate

Implement Phase 1 as a focused, separately reviewed increment: add the `riscala` executable alias, prove parity, and update human-facing headers without changing JSON, config, package publication, or repository identity.
