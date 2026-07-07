# TESTING.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Testing Strategy`
Mode: `Standard Mode`

## 1. Purpose

Define how the approved scope will be validated.

## 2. Testing Scope

TBD

## 3. Source Requirements

- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/TASKS.md`

## 4. Validation Principles

- Validate the changed behavior.
- Include negative tests for security-sensitive work.
- Do not claim validation that was not performed.

## 5. Test Levels

- Static checks:
- Unit tests:
- Integration tests:
- Manual validation:
- Security validation:

## 6. Validation Commands

```bash
psdm check
psdm validate
```

Project-specific commands:

```bash
TBD
```

## 7. Evidence Requirements

- Commands run.
- Results.
- Known gaps.
- Reviewer notes if manual validation is used.

## 8. Known Testing Gaps

- TBD

## 9. Testing Gate

The testing plan is ready only when validation is specific to the change level and risk.
