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
- second beta publication: completed manually before trusted publishing was configured;
- post-publish npm trusted publisher creation: completed successfully;
- trusted publisher id: `a2992f4e-9060-4100-8d42-e0abcafaf0f3`;
- next release publication: use the protected GitHub Actions trusted publishing workflow unless an explicit owner exception is recorded.

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
- required input `expected_version`, which must match `package.json`;
- required input `dry_run`, defaulting to `true`;
- GitHub-hosted runner;
- `permissions.contents: read`;
- `permissions.id-token: write`;
- Node.js `24`, or at least Node.js `22.14.0`;
- npm CLI `11.5.1` or later;
- no unconditional `npm@latest` upgrade in the workflow; the runner-provided npm is used when it satisfies the minimum trusted publishing version;
- `npm run release:check` before publication;
- `npm publish --dry-run --access public --tag beta` when `dry_run` is `true`;
- npm registry version-exists check when `dry_run` is `false`;
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
    inputs:
      expected_version:
        required: true
        type: string
      dry_run:
        required: true
        default: true
        type: boolean

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
      - run: npm --version
      - run: |
          npm_version="$(npm --version)"
          node - "$npm_version" <<'NODE'
          const [major, minor, patch] = process.argv[2].split('.').map(Number)
          if (!(major > 11 || (major === 11 && (minor > 5 || (minor === 5 && patch >= 1))))) {
            process.exit(1)
          }
          NODE
      - run: npm run release:check
      - run: npm publish --dry-run --access public --tag beta
        if: ${{ inputs.dry_run }}
      - run: npm publish --provenance --access public --tag beta
        if: ${{ !inputs.dry_run }}
```

Use `dry_run: true` to test the protected workflow without publishing.

Do not run this workflow with `dry_run: false` until owner approval is confirmed and the package version has not been published.

Do not install `npm@latest` unconditionally in the workflow. On `2026-07-09`, `npm@12.0.0` failed the dry-run publish step in GitHub Actions with a missing internal `sigstore` module while `actions/setup-node@v6` provided npm `11.16.0`, which satisfies the trusted publishing minimum.

## Verification

Before publishing:

- `gh run list` shows the latest PSDM workflow succeeded for the release commit;
- CodeQL succeeded for the release commit;
- `npm run release:check` succeeds locally on a clean tree;
- `npm publish --dry-run --access public --tag beta` succeeds locally;
- `npm trust list @ptechsolution/psdm-framework` shows a GitHub Actions trusted publisher matching the exact GitHub owner, repository, workflow filename, and environment.
- for real publication, the requested version is not already present on npm.

If `npm trust list @ptechsolution/psdm-framework` stops showing the GitHub Actions trusted publisher, do not publish through the workflow until the trusted publisher is restored. The manual bootstrap exception was used only for early beta publication before trusted publishing was available.

After publishing:

- npm package page shows provenance for the version;
- installing `@ptechsolution/psdm-framework@beta` works in a clean temp project;
- `psdm help`, `psdm audit`, `psdm init`, and `psdm validate` work from the installed package;
- GitHub tag and npm version point to the same commit.

## Dry-Run Verification - 2026-07-08

The protected workflow was executed with:

- `expected_version`: `1.0.0-beta.2`
- `dry_run`: `true`

Result:

- workflow run: `https://github.com/pablotech80/psdm-framework/actions/runs/28949864639`
- conclusion: `success`
- `Validate release candidate`: passed
- `Confirm requested version`: passed
- `Dry-run beta publish`: passed
- `Publish beta with provenance`: skipped

npm remained unchanged after the dry-run:

- `beta`: `1.0.0-beta.2`
- `latest`: `1.0.0-beta.1`
