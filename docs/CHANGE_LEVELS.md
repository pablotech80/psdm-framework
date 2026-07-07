# Change Levels

## Level 0 - Safe Trivial Change

Examples:

- Typo.
- Formatting.
- Non-behavioral documentation edit.

Minimum governance:

- Clear scope.
- Diff review.

## Level 1 - Local Low-Risk Code Change

Examples:

- Small UI fix.
- Isolated component change.
- Minor styling adjustment.

Minimum governance:

- Scope note.
- Relevant docs.
- Explicit allowed files.
- Narrow validation.

## Level 2 - Product Behavior Change

Examples:

- User flow change.
- Dashboard behavior.
- Documents, notifications, messages.

Minimum governance:

- Product-specific specification.
- Tasks.
- Testing.
- Architecture review if structure changes.

## Level 3 - Security / Data / Payment / AI Change

Examples:

- Auth.
- Authorization.
- RLS.
- Service-role access.
- Payments.
- Webhooks.
- Private data.
- AI data handling.

Minimum governance:

- Specification.
- Architecture.
- Security.
- Tasks.
- Testing.
- Owner approval.
- ADR if decision-level.

## Level 4 - Deployment / Operations / Infrastructure Change

Examples:

- Docker.
- CI/CD.
- VPS.
- Environment variables.
- Migrations.
- Monitoring.
- Backups.

Minimum governance:

- Deployment.
- Operations.
- Security if data/secrets are involved.
- Rollback plan.
- Owner approval.
- Exact production confirmation before execution.
