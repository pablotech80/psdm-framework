# AI Agent Security

This document defines the security direction for PSDM-managed AI-assisted projects.

## Required Controls

Production-grade AI systems should define:

- Prompt injection protection.
- Indirect prompt injection protection.
- Tool authorization.
- Tool parameter validation.
- Sensitive data redaction.
- Output validation.
- Risk scoring.
- Human approval for high-risk actions.
- Context isolation.
- Memory boundaries.
- Audit logging.

## Tool Security Matrix

Each AI-accessible tool should document:

| Field | Required |
|---|---|
| Purpose | Yes |
| Allowed callers | Yes |
| Allowed parameters | Yes |
| Forbidden operations | Yes |
| Timeout | Yes |
| Retry policy | Yes |
| Sandbox model | Yes |
| Audit logging | Yes |
| Human approval required | When high-risk |

See `docs/TOOL_REGISTRY.md` for the draft registry contract covering permissions, allowed parameters, forbidden operations, human approval, and audit logging.

## Default Policy

AI tools should be deny-by-default. A tool is available only when the project explicitly grants it for the current change level and scope.

## Stop Conditions

An AI agent must stop when:

- Tool authorization is missing.
- Security context is missing.
- The action may expose private data.
- The action may mutate production.
- The user request conflicts with governance.
