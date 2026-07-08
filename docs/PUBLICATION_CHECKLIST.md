# PUBLICATION_CHECKLIST.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Track final repository presentation metadata before making PSDM Framework public and publishing the beta package.

This checklist is for repository presentation. It does not approve npm publication.

## GitHub Metadata

Repository Description:

```text
Specification-first governance framework for AI-assisted software projects.
```

Website:

```text
https://ptechsolution.net
```

Topics:

```text
ai-engineering
ai-governance
software-engineering
developer-tools
github-actions
cli
architecture
specification
devops
ai-agents
risk-management
```

## Public Presentation

- [x] README first screen explains what PSDM is.
- [x] README first screen identifies who PSDM is for.
- [x] README explains why PSDM exists.
- [x] README includes a short try-it-locally path.
- [x] README keeps beta status visible.
- [x] README avoids unsupported production, observability, security scanner, or hosted platform claims.
- [x] README links to deeper documentation instead of embedding the full config schema.

## Remaining Owner Actions

- [x] Set GitHub repository description.
- [x] Set GitHub website.
- [x] Set GitHub topics.
- [ ] Set GitHub social preview image.
- [x] Confirm public security reporting policy.
- [x] Verify GitHub private vulnerability reporting after public visibility.
- [x] Enable GitHub secret scanning and push protection.
- [x] Enable Dependabot security updates.
- [x] Add CodeQL workflow.
- [x] Add dependency review workflow.
- [x] Add Dependabot update configuration.
- [x] Add npm trusted publishing/provenance plan.
- [x] Confirm npm scope ownership for `@ptechsolution`.
- [ ] Record explicit publication approval before `npm publish`.

## Applied Metadata

2026-07-08:

- Repository: `pablotech80/psdm-framework`
- Visibility: `PRIVATE`
- Description: `Specification-first governance framework for AI-assisted software projects.`
- Website: `https://ptechsolution.net`
- Topics: `ai-agents`, `ai-engineering`, `ai-governance`, `architecture`, `cli`, `developer-tools`, `devops`, `github-actions`, `risk-management`, `software-engineering`, `specification`

## Security Reporting

Primary channel:

- GitHub private vulnerability reporting from the repository Security tab when the repository is public.

Fallback channel:

- `https://ptechsolution.net`

Validation notes:

- A GitHub API PATCH was attempted on 2026-07-08 while the repository was private, but the repository API response did not expose a `private_vulnerability_reporting` status.
- After the repository became public on 2026-07-08, `GET /repos/pablotech80/psdm-framework/private-vulnerability-reporting` returned `{"enabled":true}`.

## Automated Security Checks

2026-07-08:

- GitHub repository visibility: `PUBLIC`
- Secret scanning: `enabled`
- Secret scanning push protection: `enabled`
- Dependabot security updates: `enabled`
- Private vulnerability reporting: `enabled`
- CodeQL workflow: `.github/workflows/codeql.yml`
- Dependency review workflow: `.github/workflows/dependency-review.yml`
- Dependabot config: `.github/dependabot.yml`
