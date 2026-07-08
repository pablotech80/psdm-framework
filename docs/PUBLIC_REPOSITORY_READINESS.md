# PUBLIC_REPOSITORY_READINESS.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Prepare the repository for public visibility before npm beta publication.

The public repository should make a clear first impression, avoid private operational evidence, and explain PSDM's scope honestly.

## GitHub Metadata Guidance

Recommended public repository metadata:

- Owner-facing brand: `Ptech AI Applied Lab`.
- Repository name: `psdm-framework`.
- Display name: `PSDM Framework`.
- Description: `Specification-first governance framework for AI-assisted software projects.`
- Website: `https://ptechsolution.net`.
- Short tagline: `AI writes code. PSDM governs it.`
- Topics: `ai-engineering`, `ai-governance`, `software-engineering`, `developer-tools`, `github-actions`, `cli`, `architecture`, `specification`, `devops`, `ai-agents`, `risk-management`.
- Social preview image: `assets/psdm-logo.png` or a wider derived image using the same mark.

## Public Presentation Gate

- [ ] Repository visibility is intentionally changed to public by the owner.
- [x] Repository description is set to a specification-first governance framework for AI-assisted software projects.
- [x] Repository website is set to `https://ptechsolution.net`.
- [x] Repository topics are set to the final public topic set from `docs/PUBLICATION_CHECKLIST.md`.
- [x] `README.md` explains purpose, install, quick start, CLI commands, examples, and beta status.
- [x] `README.md` displays the PSDM logo from `assets/psdm-logo.png`.
- [x] `LICENSE` is present.
- [x] `CODE_OF_CONDUCT.md` is present.
- [x] `CONTRIBUTING.md` is present.
- [x] `SECURITY.md` is present.
- [x] Public security reporting policy is documented.
- [x] Pull request and issue templates are present.
- [x] Public issue settings and vulnerability reporting expectations are configured.

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
- [x] `package.json` includes `assets` in the package allowlist for README logo rendering on npm.
- [ ] Add `repository`, `homepage`, and `bugs` only after the repository is public.
- [x] `npm publish --dry-run --access public --tag beta` passes without npm metadata warnings.
- [x] First beta uses npm dist-tag `beta`, not `latest`.

## Social Readiness

- [x] README states what PSDM is not: not a hosted observability platform, not a security scanner, not a replacement for owner approval.
- [x] README avoids overclaiming production readiness before beta feedback.
- [x] Public docs make adoption flow obvious: `audit`, `init`, `check`, `validate`, then CI enforcement.
- [x] README includes a visual governance flow diagram.
- [x] README explains PSDM's model and tool independence.
- [x] Known limitations are visible in beta release notes.
- [x] The package can be evaluated without private access to any other repository.

## Validation Record

2026-07-08:

- Sensitive-publication scan found no private repository URLs, GitHub Actions run URLs, local account paths, emails, browser profile IDs, npm auth details, or known private account identifiers in public package paths.
- `npm run release:check -- --allow-dirty` passed before commit.
- `npm publish --dry-run --access public --tag beta` passed and produced an 85-file tarball.
- `npm team ls ptech --json` returned `403 Forbidden`; npm scope ownership is not confirmed by this workstation.
- README branding polish added: centered logo, Ptech AI Applied Lab brand, tagline, badges, clearer opening, and governance flow diagram.
- Final README polish added: reduced density, grouped CLI reference, minimal config example, footer, and publication metadata checklist.
- GitHub repository metadata applied: description, website, and topics.
- Public security reporting policy documented with GitHub private vulnerability reporting as primary channel and `https://ptechsolution.net` as fallback.
- Automated security checks added: CodeQL, dependency review, Dependabot config, secret scanning, push protection, Dependabot security updates, and private vulnerability reporting.

## Current Blockers

- npm scope ownership for `@ptech` must be confirmed before publish.
- GitHub social preview image still requires manual configuration.
- Explicit owner approval is still required before `npm publish`.
