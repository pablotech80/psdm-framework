# PROJECT_BRIEF.md

Status: `Active`
Project: `psdm-framework`
Method: `PTECH SPEC-DRIVEN METHOD`

## Problem Statement

AI-assisted software delivery can move quickly while losing architectural context, security boundaries, and deployment discipline. Teams also risk the opposite failure: adding heavyweight process to changes that are safe and local.

PSDM exists to provide risk-scaled governance for software repositories. It helps teams initialize governance artifacts, classify changes, validate repository readiness, and keep AI agents operating inside explicit boundaries.

## Success Criteria

- The framework remains installable as a dependency-free CLI.
- Small safe changes stay fast and require minimal process.
- Security, data, payment, AI, deployment, operations, and CI/CD changes receive stronger controls.
- Validation output is useful for both humans and automation.
- Configuration is explicit, versioned, and understandable without external services.
- This repository maintains its own PSDM artifacts and can validate its baseline.

## Open Questions

- What config schema guarantees are required before `1.0.0`.
- Whether a Python CLI should exist alongside the Node CLI after behavior stabilizes.
- Which CI enforcement behavior should fail pull requests versus only report advisory findings.
- How much semantic validation belongs in PSDM without turning it into a heavyweight policy engine.
