# ADR-2026-07-11-govern-ai-work-with-active-work-boundaries

Status: `Accepted`
Date: `2026-07-11`
Method: `PTECH SPEC-DRIVEN METHOD`

## Decision

Make governable Active Work the primary beta.6 direction for Riscala.

Riscala will focus on two capabilities:

- **Continuity:** preserve compact project direction across chats and agents.
- **Control:** keep AI actions inside the repository, objective, mode, scope, and authority defined by the developer.

A new instruction does not automatically expand previous authority. A change of repository, objective, mode, allowed scope, prohibition, or authority requires an explicit transition before mutation.

`impact` and `review` remain compatible read-only supporting capabilities. They are not the primary product value.

## Context

The first beta.6 direction centered Riscala on developer judgment. External use showed that deterministic heuristics can produce plausible guidance but should not compete with capable coding agents for implementation reasoning.

The same experiment demonstrated stronger value from compact persistent context: a new chat recovered priority, decisions, boundaries, examples, and open questions. It also exposed the central failure. An agent moved from experiment to implementation in a laboratory repository without confirming that repository, objective, mode, and authorized actions had changed.

The result was technically correct but outside the developer's authority. Correctness and governability are different properties.

## Active Work Contract

The canonical contract is `docs/ACTIVE_WORK.md`. It records:

```text
repository
objective
mode
allowed
forbidden
must_preserve
stop_conditions
status
```

Persistent context distinguishes human decisions, observed facts, examples, suggestions, and open questions. Examples and suggestions do not become requirements automatically.

## Authority Boundary

Markdown is task context and evidence. It is not proof of human identity or strong approval.

Riscala and an agent may detect a boundary change, request a transition, and report compliance. They may not approve their own transition or infer authority from agent-controlled text.

Independent enforcement and strong transition approval remain future design decisions.

## Alternatives

- **Keep Judgment Brief primary:** rejected because it duplicates agent reasoning and can sound more certain than its evidence.
- **Use only `AGENTS.md`:** rejected because repository-wide rules do not preserve the boundary of a concrete task.
- **Use conversation history:** rejected because it is fragile across chats and mixes decisions with examples and suggestions.
- **Build SaaS or runtime memory now:** deferred until the local contract proves value.
- **Treat Markdown as enforcement:** rejected because an unrestricted agent can ignore or modify it.

## Consequences

Positive:

- addresses a demonstrated control problem;
- preserves direction across chats;
- makes boundary changes explicit;
- remains local, dependency-free, and tool-neutral.

Negative:

- beta.6 changes direction again before publication;
- the first contract remains advisory;
- transition authority and cross-tool behavior remain unresolved.

## Relationship To The Previous ADR

This decision partially supersedes `ADRs/2026-07-11-refocus-riscala-on-developer-judgment.md`.

The previous trust boundaries remain valid: the developer retains authority and facts, inference, recommendation, and decision remain distinct. The superseded claim is that judgment amplification is the primary product responsibility. Governable Active Work is now primary; judgment amplification is supporting.

## Beta.6 Boundary

Beta.6 remains local, dependency-free, Git-backed, model-independent, and compatible with the existing package and stable CLI contracts. This ADR does not authorize publication, hosted infrastructure, autonomous approval, or changes to any laboratory repository.
