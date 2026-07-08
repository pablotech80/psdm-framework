# NPM_TRUSTED_PUBLISHING.md

Status: `Planned`
Project: `psdm-framework`

## Purpose

Define how PSDM should move from local npm publication to trusted publishing with provenance.

This document does not approve publication and does not create a publishing workflow by itself.

## Decision

Use npm trusted publishing through GitHub Actions before promoting PSDM beyond the first beta candidate.

For the first beta, publication remains blocked until:

- npm scope ownership or publish permission for `@ptech` is confirmed;
- the npm package can be configured with a trusted publisher;
- the release workflow has manual GitHub environment approval;
- `npm run release:check` passes on the release commit;
- the owner gives explicit `CONFIRM NPM BETA PUBLISH` approval.

## Why

Trusted publishing reduces release risk by avoiding long-lived npm write tokens.

Provenance gives package consumers a verifiable link between the npm artifact, the GitHub repository, the release workflow, and the commit that produced the package.

This does not prove the package is bug-free or secure. It improves supply-chain traceability and makes tampering or unreviewed local publishing easier to detect.

## Required NPM Configuration

After the package exists or npm allows pre-publication trusted publisher configuration for the package, configure npm:

- Package: `@ptech/psdm-framework`
- Publisher: GitHub Actions
- GitHub owner: `pablotech80`
- GitHub repository: `psdm-framework`
- Workflow filename: `npm-publish.yml`
- Environment name: `npm-publish`
- Allowed action: `npm publish`

Only one trusted publisher should be active for the package.

After trusted publishing is confirmed, restrict legacy token publishing where npm package settings allow it.

## Required GitHub Configuration

Create a protected GitHub environment named `npm-publish` before enabling an executable publish workflow.

Recommended environment rules:

- required reviewer: repository owner or release maintainer;
- deployment branch: `main` only;
- secrets: none for npm publishing when OIDC trusted publishing is active.

The publishing job must use:

- GitHub-hosted runner;
- `permissions.contents: read`;
- `permissions.id-token: write`;
- Node.js `24`, or at least Node.js `22.14.0`;
- npm CLI `11.5.1` or later;
- `npm run release:check` before publication;
- `npm publish --provenance --access public --tag beta` for the beta publish.

## Package Metadata Requirements

`package.json` must keep public metadata aligned with the public repository:

- `name`: `@ptech/psdm-framework`
- `homepage`: `https://github.com/pablotech80/psdm-framework#readme`
- `repository.url`: `git+https://github.com/pablotech80/psdm-framework.git`
- `bugs.url`: `https://github.com/pablotech80/psdm-framework/issues`
- `publishConfig.access`: `public`

The repository value must continue to point to the public source repository used by the trusted publisher workflow.

## Non-Goals

This plan does not:

- publish the package;
- store an npm automation token;
- bypass npm scope ownership checks;
- replace `npm run release:check`;
- promote beta as `latest`;
- create a general release automation platform.

## Manual Release Shape

When all blockers are resolved, the intended publish workflow should be manual or release-triggered with protected environment approval.

Minimum workflow shape:

```yaml
name: Publish npm package

on:
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: npm-publish
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm run release:check
      - run: npm publish --provenance --access public --tag beta
```

Do not add this as an executable repository workflow until `@ptech` publish permission, npm trusted publisher settings, and owner approval are confirmed.

## Verification

Before publishing:

- `gh run list` shows the latest PSDM workflow succeeded for the release commit;
- CodeQL succeeded for the release commit;
- `npm run release:check` succeeds locally on a clean tree;
- `npm publish --dry-run --access public --tag beta` succeeds locally;
- npm trusted publisher settings match the exact GitHub owner, repository, workflow filename, and environment.

After publishing:

- npm package page shows provenance for the version;
- installing `@ptech/psdm-framework@beta` works in a clean temp project;
- `psdm help`, `psdm audit`, `psdm init`, and `psdm validate` work from the installed package;
- GitHub tag and npm version point to the same commit.
