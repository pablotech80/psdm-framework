# DOWNSTREAM_ACTION_VALIDATION.md

Status: `Completed`
Project: `psdm-framework`

## Purpose

Define the protocol for validating the PSDM GitHub Action from a downstream repository.

This validation proves that `action.yml` works as a consumed Action, not only inside the framework repository.

## Scope

Validate:

- `uses: pablotech80/psdm-framework@main` resolves from another repository;
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
psdm-action-smoke
```

The repository may be private. It should be intentionally small and contain only enough files to validate Action behavior.

## Baseline Setup

From the downstream repo root:

```bash
node /Users/ptech/repo/psdm-framework/bin/psdm.mjs init .
node /Users/ptech/repo/psdm-framework/bin/psdm.mjs validate . --json
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

      - uses: pablotech80/psdm-framework@main
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

After execution, record:

| Field | Value |
|---|---|
| Downstream repository | `https://github.com/pablotech80/psdm-action-smoke` |
| PSDM commit tested | `7dc09ddefe4172f39d73ddfb46a4e9111ecff5c7` |
| Pass workflow run URL | `https://github.com/pablotech80/psdm-action-smoke/actions/runs/28907945061` |
| Fail workflow run URL | `https://github.com/pablotech80/psdm-action-smoke/actions/runs/28907914706` |
| Pass result | `success`; validation returned `METHOD_BASELINE_REVIEW_REQUIRED` with `failures: 0`; enforcement returned `CHANGE_LEVEL_APPROVED`. |
| Fail result | `failure`; validation ran first with `failures: 0`; enforcement returned `CHANGE_LEVEL_BLOCKED`, estimated `Level 4`, max `Level 2`. |
| Notes | Source repository is private; GitHub Actions private access was set to same-user access. Initial smoke exposed two fixes: use the real owner `pablotech80`, track `ADRs/README.md` during init, and write report JSON outside the target before validation. GitHub emitted an external `actions/checkout@v4` Node runtime deprecation warning; it did not block PSDM. |

## Acceptance Criteria

Downstream Action validation is complete when:

- one pass run succeeds with expected JSON output;
- one fail run blocks with expected JSON output;
- both run URLs are recorded;
- any gaps are documented before beta/release decisions.

## Known Gaps

- None for the current downstream Action smoke protocol.
