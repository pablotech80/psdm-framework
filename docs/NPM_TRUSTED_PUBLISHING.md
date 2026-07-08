# NPM_TRUSTED_PUBLISHING.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Define how PSDM publishes through npm trusted publishing with provenance.

This document does not approve publication. Publication still requires the protected GitHub environment approval and explicit owner approval.

## Decision

Use npm trusted publishing through GitHub Actions from the first beta candidate.

For the first beta, publication remains blocked until:

- npm trusted publisher configuration is confirmed on npm;
- the release workflow receives manual GitHub environment approval;
- `npm run release:check` passes on the release commit;
- the owner gives explicit `CONFIRM NPM BETA PUBLISH` approval.

Configuration status:

- GitHub environment `npm-publish`: configured;
- GitHub workflow `.github/workflows/npm-publish.yml`: configured;
- npm trusted publisher dry-run: accepted with `createPackage` permission;
- npm trusted publisher record: blocked by npm registry `E404` while the package does not yet exist;
- first beta bootstrap: one-time manual publication exception accepted after npm `E404`, pending explicit `CONFIRM NPM BETA PUBLISH` approval;
- first beta publication: completed through the documented manual bootstrap exception;
- post-publish npm trusted publisher creation: blocked by npm registry `E403`;
- next release publication: blocked until trusted publisher configuration is confirmed or an explicit owner exception is recorded.

## Why

Trusted publishing reduces release risk by avoiding long-lived npm write tokens.

Provenance gives package consumers a verifiable link between the npm artifact, the GitHub repository, the release workflow, and the commit that produced the package.

This does not prove the package is bug-free or secure. It improves supply-chain traceability and makes tampering or unreviewed local publishing easier to detect.

## Required NPM Configuration

Trusted publisher configuration:

- Package: `@ptechsolution/psdm-framework`
- Publisher: GitHub Actions
- GitHub owner: `pablotech80`
- GitHub repository: `psdm-framework`
- Workflow filename: `npm-publish.yml`
- Environment name: `npm-publish`
- Allowed action: `npm publish`

Only one trusted publisher should be active for the package.

After the first package version exists, restrict legacy token publishing where npm package settings allow it.

## Required GitHub Configuration

Protected GitHub environment:

- name: `npm-publish`;
- required reviewer: repository owner or release maintainer;
- deployment branch: `main` only;
- secrets: none for npm publishing when OIDC trusted publishing is active.

Publishing workflow:

- file: `.github/workflows/npm-publish.yml`;
- trigger: manual `workflow_dispatch`;
- GitHub-hosted runner;
- `permissions.contents: read`;
- `permissions.id-token: write`;
- Node.js `24`, or at least Node.js `22.14.0`;
- npm CLI `11.5.1` or later;
- `npm run release:check` before publication;
- `npm publish --provenance --access public --tag beta` for the beta publish.

## Package Metadata Requirements

`package.json` must keep public metadata aligned with the public repository:

- `name`: `@ptechsolution/psdm-framework`
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

The publish workflow is manual and protected by the `npm-publish` environment.

Current workflow shape:

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

Do not run this workflow until npm trusted publisher settings and owner approval are confirmed.

## Verification

Before publishing:

- `gh run list` shows the latest PSDM workflow succeeded for the release commit;
- CodeQL succeeded for the release commit;
- `npm run release:check` succeeds locally on a clean tree;
- `npm publish --dry-run --access public --tag beta` succeeds locally;
- `npm trust list @ptechsolution/psdm-framework` shows a GitHub Actions trusted publisher matching the exact GitHub owner, repository, workflow filename, and environment.

If `npm trust list @ptechsolution/psdm-framework` returns `E404` because the package does not yet exist, the first beta may use the documented one-time manual bootstrap exception only after explicit owner approval. After the package exists, configure and verify npm trusted publishing before subsequent releases. If npm returns `E403`, resolve package or organization permissions in npm before any next release.

After publishing:

- npm package page shows provenance for the version;
- installing `@ptechsolution/psdm-framework@beta` works in a clean temp project;
- `psdm help`, `psdm audit`, `psdm init`, and `psdm validate` work from the installed package;
- GitHub tag and npm version point to the same commit.
