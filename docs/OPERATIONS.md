# OPERATIONS.md

Status: `Active`
Project: `psdm-framework`

## Monitoring Strategy

PSDM is currently a local CLI and GitHub Action package, so operations focus on repository health and release quality rather than runtime service monitoring.

Operational signals:

- GitHub Actions validation status;
- package dry-run contents;
- command exit codes;
- enforcement decisions from CI change-level checks;
- JSON output compatibility;
- reported validator decisions;
- issue reports from downstream users;
- roadmap and task drift.

Maintenance expectations:

- keep `ROADMAP.md` and `TODO.md` current with every meaningful advance;
- keep docs synchronized with CLI behavior;
- validate package contents before release;
- keep dependency count minimal;
- treat config schema changes as compatibility-sensitive.

## Operations Gate

Operational review is required when changes affect:

- CI workflows;
- GitHub Action behavior;
- change-level enforcement behavior;
- package publishing;
- command exit codes;
- report or JSON output consumed by automation;
- repository governance baseline;
- release or rollback assumptions.
