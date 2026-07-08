# DOWNSTREAM_ACTION_VALIDATION.md

Status: `Completed`
Project: `psdm-framework`

## Purpose

Define the protocol for validating the PSDM GitHub Action from a downstream repository.

This validation proves that `action.yml` works as a consumed Action, not only inside the framework repository.

## Scope

Validate:

- `uses: <owner>/psdm-framework@main` resolves from another repository;
- `psdm validate` runs against a downstream checkout;
- `psdm-report.json` is created and printed;
- `psdm enforce` runs when `enforce-change-level: 'true'`;
- `psdm-enforcement.json` is created and printed;
- pass and fail behavior match expected exit codes.

Out of scope:

- package registry publishing;
- public npm release;
- native AI observability;
- production deployment.

## Downstream Repository

Recommended temporary repo:

```text
<downstream-smoke-repo>
```

The repository may be private. It should be intentionally small and contain only enough files to validate Action behavior.

## Baseline Setup

From the downstream repo root:

```bash
node ../psdm-framework/bin/psdm.mjs init .
node ../psdm-framework/bin/psdm.mjs validate . --json
```

Commit the generated baseline before testing the Action.

## Workflow Under Test

Create `.github/workflows/psdm.yml` in the downstream repo:

```yaml
name: PSDM Smoke

on:
  push:
  pull_request:

jobs:
  psdm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: <owner>/psdm-framework@main
        with:
          target: .
          enforce-change-level: 'true'
          change-description: small docs update
          files: docs/SPEC.md
          max-level: Level 2
```

## Pass Scenario

Inputs:

```yaml
change-description: small docs update
files: docs/SPEC.md
max-level: Level 2
```

Expected:

- workflow succeeds;
- `psdm-report.json` exists;
- validation decision is not `NEEDS_CORRECTION`;
- `psdm-enforcement.json` exists;
- enforcement decision is `CHANGE_LEVEL_APPROVED`.

## Fail Scenario

Change workflow inputs:

```yaml
change-description: deployment pipeline change
files: .github/workflows/deploy.yml
max-level: Level 2
```

Expected:

- validation still runs;
- enforcement fails the workflow;
- `psdm-enforcement.json` exists;
- enforcement decision is `CHANGE_LEVEL_BLOCKED`;
- violation mentions that the estimated level exceeds `Level 2`.

## Evidence Record

After execution, record evidence in release notes, a private release checklist, or an issue visible to maintainers.

| Field | Value |
|---|---|
| Downstream repository | Maintainer-recorded smoke repository. |
| PSDM commit tested | Maintainer-recorded commit SHA. |
| Pass workflow run URL | Maintainer-recorded run URL. |
| Fail workflow run URL | Maintainer-recorded run URL. |
| Pass result | `success`; validation has `failures: 0`; enforcement returns `CHANGE_LEVEL_APPROVED`. |
| Fail result | `failure`; validation runs first with `failures: 0`; enforcement returns `CHANGE_LEVEL_BLOCKED`, estimated `Level 4`, max `Level 2`. |
| Notes | Do not publish private repository URLs, internal runner URLs, account identifiers, or local filesystem paths in public release artifacts. |

## Acceptance Criteria

Downstream Action validation is complete when:

- one pass run succeeds with expected JSON output;
- one fail run blocks with expected JSON output;
- both run URLs are recorded;
- any gaps are documented before beta/release decisions.

## Known Gaps

- None for the current downstream Action smoke protocol.
