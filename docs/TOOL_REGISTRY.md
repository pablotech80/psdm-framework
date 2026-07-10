# Tool Registry

PSDM-managed AI systems should treat tool access as an explicit contract, not an ambient capability.

## Registry Entry

Each tool exposed to an AI agent should define:

| Field | Purpose |
|---|---|
| Tool name | Stable identifier used in prompts, logs, and policy. |
| Purpose | Business capability the tool supports. |
| Allowed callers | Agents, roles, or workflows that may call the tool. |
| Allowed parameters | Parameter schema, accepted ranges, and validation rules. |
| Forbidden operations | Explicitly blocked actions even when the tool is available. |
| Data classification | Public, internal, confidential, regulated, or secret. |
| Change levels | Maximum PSDM change level where the tool may run without extra approval. |
| Human approval | Conditions requiring owner confirmation before execution. |
| Approval mode | Phrase, hardware signature, remote approval, or none. |
| Content binding | Hashes, targets, branches, artifacts, or environments covered by approval. |
| Approval issuer | Identity or authority allowed to issue a valid receipt. |
| Sandbox model | Runtime boundary, network scope, and filesystem scope. |
| Audit logging | Required event fields and retention expectation. |

## Default Policy

Tools are deny-by-default. A tool is available only when the current change scope, user role, repository policy, and data classification all allow it.

## Approval Rules

Human approval is required when a tool can:

- mutate production state;
- access secrets;
- access private customer data;
- move money;
- change authorization rules;
- deploy infrastructure;
- send external communications;
- persist long-term memory.

An AI agent is never an allowed approval issuer for its own action. A phrase accessible through the agent's terminal is not a strong identity boundary. High-risk approvals must be validated against the exact action and invalidated when bound content changes.

The current Riscala verification core supports `git.commit` action records, detached public-key receipt validation, and optional managed pre-commit enforcement with local replay state. It does not expose signing authority, and local hooks do not replace protected remote controls.

## Audit Event Shape

Minimum audit fields:

```json
{
  "timestamp": "2026-01-01T00:00:00.000Z",
  "actionId": "action-reference",
  "tool": "tool.name",
  "caller": "agent-or-user",
  "changeLevel": "Level 3",
  "contentHash": "sha256:bounded-action-hash",
  "inputSummary": "bounded non-secret summary",
  "approvalId": "approval-reference-or-null",
  "approvalMode": "hardware-signature",
  "result": "allowed | denied | failed",
  "reason": "policy decision"
}
```

## Stop Conditions

The agent must stop before calling a tool when:

- the tool is missing from the registry;
- required parameters are outside the allowed schema;
- the action requires human approval and approval is absent;
- approval is expired, invalid, self-issued, or bound to different content;
- the action crosses production, payment, data, security, or deployment boundaries not covered by the current PSDM artifacts.
