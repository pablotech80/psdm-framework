# PUBLIC_REPOSITORY_READINESS.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Prepare the repository for public visibility before npm beta publication.

The public repository should make a clear first impression, avoid private operational evidence, and explain PSDM's scope honestly.

## Public Presentation Gate

- [ ] Repository visibility is intentionally changed to public by the owner.
- [ ] Repository description clearly says PSDM is a governance CLI and GitHub Action for AI-assisted software delivery.
- [ ] Repository topics include relevant terms such as `ai`, `governance`, `cli`, `github-action`, `spec-driven`, and `software-architecture`.
- [x] `README.md` explains purpose, install, quick start, CLI commands, examples, and beta status.
- [x] `LICENSE` is present.
- [x] `CODE_OF_CONDUCT.md` is present.
- [x] `CONTRIBUTING.md` is present.
- [x] `SECURITY.md` is present.
- [x] Pull request and issue templates are present.
- [ ] Public issue settings and vulnerability reporting expectations are configured.

## Public Content Gate

- [x] No private repository URLs are published in docs, examples, package metadata, or release notes.
- [x] No private GitHub Actions run URLs are published.
- [x] No local filesystem paths are published as required commands.
- [x] No account IDs, browser profile IDs, emails, tokens, OTPs, or npm auth details are published.
- [x] No examples contain real customer data, production URLs, credentials, or API keys.
- [x] Downstream validation evidence is summarized publicly and detailed privately when necessary.

## Package Metadata Gate

- [ ] npm package scope is confirmed and controlled by the publisher.
- [x] `package.json` includes public-safe `name`, `description`, `license`, `keywords`, `bin`, `files`, and `publishConfig`.
- [ ] Add `repository`, `homepage`, and `bugs` only after the repository is public.
- [x] `npm publish --dry-run --access public --tag beta` passes without npm metadata warnings.
- [x] First beta uses npm dist-tag `beta`, not `latest`.

## Social Readiness

- [x] README states what PSDM is not: not a hosted observability platform, not a security scanner, not a replacement for owner approval.
- [x] README avoids overclaiming production readiness before beta feedback.
- [x] Public docs make adoption flow obvious: `audit`, `init`, `check`, `validate`, then CI enforcement.
- [x] Known limitations are visible in beta release notes.
- [x] The package can be evaluated without private access to any other repository.

## Validation Record

2026-07-08:

- Sensitive-publication scan found no private repository URLs, GitHub Actions run URLs, local account paths, emails, browser profile IDs, npm auth details, or known private account identifiers in public package paths.
- `npm run release:check -- --allow-dirty` passed before commit.
- `npm publish --dry-run --access public --tag beta` passed and produced an 82-file tarball.
- `npm team ls ptech --json` returned `403 Forbidden`; npm scope ownership is not confirmed by this workstation.

## Current Blockers

- npm scope ownership for `@ptech` must be confirmed before publish.
- Repository is still private at the time of this checklist.
- Public security contact is not yet defined.
- Explicit owner approval is still required before `npm publish`.
