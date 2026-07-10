# OPERATIONS.md

Status: `Active`
Project: `psdm-framework`

## Monitoring Strategy

PSDM is currently a local CLI and GitHub Action package, so operations focus on repository health and release quality rather than runtime service monitoring.

During the Riscala transition, operations must monitor executable parity: `riscala` is the primary product presentation, while `psdm` remains a compatibility path to the same entrypoint.

Operational signals:

- GitHub Actions validation status;
- package dry-run contents;
- command exit codes;
- enforcement decisions from CI change-level checks;
- JSON output compatibility;
- reported validator decisions;
- issue reports from downstream users;
- installed availability of both `riscala` and `psdm`;
- divergent output or behavior between executable aliases;
- pre-commit hook status and managed/unmanaged ownership;
- approval consumption ledger parse failures, lock conflicts, and replay denials;
- roadmap and task drift.

Maintenance expectations:

- keep `ROADMAP.md` and `TODO.md` current with every meaningful advance;
- keep docs synchronized with CLI behavior;
- validate package contents before release;
- keep dependency count minimal;
- treat config schema changes as compatibility-sensitive.
- treat `.git/riscala/` as local enforcement state that must never contain private keys or signatures.

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
- Riscala/PSDM executable parity or compatibility removal.
- approval hook installation, replay state, or remote enforcement behavior.

Rollback for the initial brand migration is a Git revert of the alias and presentation increment. No registry rollback is required until a Riscala-branded package is explicitly published.
