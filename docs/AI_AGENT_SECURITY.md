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
- Agent self-approval prohibition.
- Approval binding to the exact content, target, and action.
- Approval invalidation when bound content changes.
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

## Human Approval Boundary

A confirmation phrase typed through the same terminal controlled by an agent is not proof of human presence. For configured high-risk agent actions, approval must be hardware-backed or issued through a separate authenticated channel.

The approval must be bound to the exact staged diff, commit, pull-request head, package tarball, deployment artifact, target, and environment that it authorizes. Any bound value change invalidates the approval.

Agents may request approval and report its status. They must not enter, derive, retrieve, expose, simulate, or reuse human confirmation material.

See `docs/AGENT_DECISION_PROTOCOL.md` for the justification contract, receipt shape, content bindings, and enforcement layers.

## Stop Conditions

An AI agent must stop when:

- Tool authorization is missing.
- Security context is missing.
- The action may expose private data.
- The action may mutate production.
- The user request conflicts with governance.
- The agent would need to approve its own action.
- A required approval is missing, expired, invalid, or bound to different content.
