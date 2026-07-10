# Agent Decision Protocol

Status: `Active Architecture Contract`
Date: `2026-07-10`
Product: `Riscala`
Method: `PTECH SPEC-DRIVEN METHOD (PSDM)`

## Purpose

Define how an AI agent explains, executes, and reports meaningful mutating decisions while preserving human authority over high-risk approval.

This protocol distinguishes:

- **proposal:** what the agent recommends;
- **execution:** what the agent is allowed to perform;
- **approval:** a human decision the agent cannot issue for itself;
- **evidence:** what proves the action produced the intended result.

## Meaningful Mutating Action

The protocol applies to a coherent decision that changes project or external state, including:

- a batch of related file edits;
- configuration or governance changes;
- Git commit or push;
- pull-request creation, promotion, or merge;
- dependency, package, or release changes;
- external communication;
- access to sensitive data;
- infrastructure or production operations.

Routine reads and non-mutating diagnostics such as file inspection, search, `git status`, syntax checks, and focused tests may be summarized instead of justified individually.

## Before-Action Contract

Before a meaningful mutation, the agent must state:

| Field | Required meaning |
|---|---|
| Action | The exact state change being proposed. |
| Why | The problem or requirement that makes it necessary. |
| Expected improvement | The measurable or reviewable benefit. |
| Scope | Files, systems, data, branches, environments, or people affected. |
| Risk | PSDM level, risk paths, reversibility, and relevant security boundaries. |
| Validation | Evidence that will demonstrate success. |
| Approval requirement | Whether execution or the next boundary requires a human decision. |

The declaration must be specific enough for a reviewer to distinguish the proposed action from a broader or different mutation.

## After-Action Contract

After the mutation, the agent must state:

| Field | Required meaning |
|---|---|
| Result | What actually changed. |
| Evidence | Tests, checks, hashes, URLs, decisions, or other bounded proof. |
| Deviations | Differences from the pre-action proposal. |
| Next action | The concrete next recommended step. |
| Next-action rationale | Why that step should come next. |

If execution fails or produces contradictory evidence, the agent must report the failure rather than silently changing the intended action.

## Agent Prohibitions

An agent must never:

- approve its own action;
- enter, derive, retrieve, expose, or simulate a human confirmation;
- treat a phrase in configuration or instructions as human identity;
- reuse an approval for different or modified content;
- continue after the approved content, target, environment, or action changes;
- bypass an available Riscala enforcement boundary or required approval by invoking Git, GitHub, npm, cloud, messaging, or another tool directly;
- claim instruction compliance is equivalent to enforcement.

## Approval Receipt

A strong approval is a signed receipt bound to the exact action:

```json
{
  "version": 1,
  "approvalId": "approval_01J00000000000000000000000",
  "action": "git.commit",
  "repository": "payments-api",
  "branch": "feature/auth",
  "contentHash": "sha256:example-non-production-hash",
  "approver": "owner-identity-reference",
  "issuedAt": "2026-07-10T12:00:00.000Z",
  "expiresAt": "2026-07-10T12:10:00.000Z",
  "approvalMode": "hardware-signature",
  "signature": "detached-signature-reference"
}
```

Approval records and logs must not contain secrets, private keys, credentials, raw confirmation phrases, private customer data, or full sensitive payloads.

## Content Binding

| Action | Required binding |
|---|---|
| Git commit | Staged diff hash, repository identity, and branch. |
| Git push | Commit SHA, remote, and destination branch. |
| Pull request | Head SHA, base branch, repository, title, and draft/ready mode. |
| Pull-request merge | PR head SHA, base branch, merge strategy, and repository. |
| npm publication | Package name, version, tarball hash, registry, and dist-tag. |
| Production deployment | Artifact digest, environment, service, version, and deployment target. |

Any bound value change invalidates the approval. Riscala must calculate and verify bindings deterministically.

## Approval Modes

### Phrase

An exact phrase is an intent check only. It may reduce accidental execution by a person, but it is not sufficient human-presence evidence when an agent controls the terminal.

### Hardware Signature

A FIDO2, hardware-backed SSH, GPG, or equivalent signing operation requires presence outside the agent's software channel. The runtime implementation must verify signer identity, signature, content binding, and expiry.

### Remote Approval

A trusted service or protected environment returns a signed approval after the owner approves from a separate authenticated channel. The agent may request and poll for the result but may not access the approver credential.

## Enforcement Layers

`AGENTS.md` communicates the protocol but is not the enforcement boundary.

| Boundary | Expected enforcement |
|---|---|
| File mutation | Riscala action record and scoped tool policy. |
| Commit | pre-commit hook plus valid approval receipt when policy requires it. |
| Push | pre-push hook and protected branch policy. |
| Pull request | required governance check and repository permissions. |
| Merge | branch protection, required review, and current head binding. |
| Package publication | protected workflow/environment and artifact hash binding. |
| Production | protected environment, owner approval, and exact artifact binding. |

If an enforcement layer is unavailable, Riscala must fail closed for actions configured to require strong approval.

## Audit Event

The minimum non-secret event shape is:

```json
{
  "timestamp": "2026-07-10T12:00:00.000Z",
  "actionId": "action_01J00000000000000000000000",
  "action": "git.commit",
  "changeLevel": "Level 3",
  "contentHash": "sha256:example-non-production-hash",
  "approvalRequired": true,
  "approvalId": "approval_01J00000000000000000000000",
  "approvalMode": "hardware-signature",
  "result": "allowed",
  "reason": "Valid unexpired receipt matched the staged diff."
}
```

## Current Implementation Status

- Agent instruction contract: documented.
- Repository and generated `AGENTS.md` rules: required.
- Git commit action record and receipt schema: implemented.
- Detached public-key signature and fingerprint verification: implemented.
- Hardware signing ceremony: external and not implemented by Riscala.
- Remote approval: not implemented.
- Hook and CI enforcement: not implemented.
- Mutating Riscala slash commands: not authorized.

Until enforcement exists, Riscala may provide read-only shell commands and advisory intent confirmation, but must not describe them as agent-resistant approval.

Direct project tools remain available for explicitly authorized workflows that Riscala does not yet implement. They must not be used to evade a policy, hook, required check, approval boundary, or stop condition.
