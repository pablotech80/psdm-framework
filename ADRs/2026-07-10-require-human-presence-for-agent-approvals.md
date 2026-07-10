# ADR-2026-07-10-require-human-presence-for-agent-approvals

Status: `Accepted`
Date: `2026-07-10`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Architecture Decision Record`

## 1. Decision

Require AI agents to justify every meaningful mutating decision before execution and report evidence plus the next action afterward. An agent may never authorize its own high-risk action; human approval must be out-of-band or hardware-backed and bound to the exact content being approved.

## 2. Context

Riscala is evolving toward an interactive shell that may eventually offer mutating actions such as commit, push, pull-request creation, publication, and deployment. A confirmation phrase typed into the same terminal is useful against accidental human execution, but it cannot prove human presence when an AI agent controls that terminal.

Agent instructions are also insufficient as an enforcement boundary. An agent may ignore instructions or bypass Riscala by invoking Git, GitHub, npm, cloud, or another tool directly. The governance model therefore needs both an explicit agent decision contract and independent enforcement points.

## 3. Options Considered

1. Require exact confirmation phrases in the local terminal.
2. Trust `AGENTS.md` instructions without independent enforcement.
3. Require structured agent justification plus signed, content-bound human approval and independent enforcement.

## 4. Chosen Option

Choose option 3.

The governance chain is:

```text
Intent
  -> classification
  -> agent justification
  -> exact action hash
  -> human approval outside the agent channel
  -> receipt verification
  -> execution
  -> validation evidence
  -> next action with rationale
```

Confirmation phrases may remain as low-assurance intent signals, but never as proof of human identity or sufficient approval for an agent-controlled Level 3 or Level 4 action.

## 5. Rationale

- A local phrase is readable and reproducible by an agent with terminal control.
- Binding approval to an action hash prevents an approved diff, commit, artifact, or target from being changed after approval.
- Hardware-backed or remote approval creates a human-presence boundary outside the agent's control channel.
- Structured justification makes intent, expected improvement, scope, risk, validation, and next action reviewable.
- Independent hooks, required checks, protected branches, protected environments, and release gates prevent instructions from being the only control.

## 6. Consequences

### Positive

- Human decision authority remains separate from agent execution authority.
- Approval becomes specific, expiring, attributable, and invalidated by content changes.
- Project iteration retains an explicit chain from reason to evidence to next action.
- The protocol remains model- and tool-independent.

### Negative

- Strong approval requires hardware, a remote approval channel, or another trusted identity boundary.
- Commit, PR, release, and deployment workflows become more complex at higher change levels.
- Cross-platform signing and key management require design and validation before runtime implementation.

### Trade-offs

- The decision optimizes for trustworthy high-risk approvals, not frictionless autonomous execution.
- Level 0 and Level 1 work must remain lightweight; full approval receipts are reserved for configured higher-risk mutations.

## 7. Validation

- Threat-modeled an agent with read/write access to the same terminal and repository.
- Confirmed that a repository-stored phrase cannot distinguish a human from that agent.
- Defined content bindings for staged diffs, commits, PRs, releases, and deployments.
- Received explicit owner approval for this governance direction on `2026-07-10`.

## 8. Related Artifacts

- `docs/AGENT_DECISION_PROTOCOL.md`
- `AGENTS.md`
- `templates/AGENTS.md`
- `docs/AI_AGENT_SECURITY.md`
- `docs/TOOL_REGISTRY.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`

## 9. Review Notes

This ADR authorizes the governance contract and agent rules. It does not claim runtime enforcement exists and does not authorize mutating slash commands. `/commit`, `/push`, `/pr`, `/publish`, and `/deploy` remain blocked from implementation until their enforcement and approval boundaries are explicitly designed and validated.
