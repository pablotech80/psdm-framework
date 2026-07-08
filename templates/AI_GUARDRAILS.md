# AI_GUARDRAILS.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `AI Guardrail Governance`
Mode: `AI / Security Mode`

## 1. Purpose

Define the guardrails required for AI behavior in this project.

This artifact is a governance contract. It does not replace runtime safety libraries, provider controls, eval platforms, or observability tools.

## 2. AI Scope

Document the AI features, agents, RAG flows, prompts, tools, and automation covered by this guardrail policy.

## 3. Guardrail Policy

Define required controls for:

- prompt injection;
- indirect prompt injection;
- tool injection;
- context poisoning;
- memory poisoning;
- unsafe output;
- private data exposure;
- unauthorized tool execution.

## 4. Tool Boundaries

For each AI-accessible tool, reference the tool registry entry and define:

- allowed callers;
- allowed parameters;
- forbidden operations;
- approval requirements;
- timeout and retry limits;
- audit logging expectations.

## 5. Input Controls

Document validation, sanitization, retrieval filtering, context isolation, and untrusted-content handling.

## 6. Output Controls

Document output validation, refusal policy, citation or grounding requirements, redaction, and escalation behavior.

## 7. Human Approval

Define when AI behavior must stop for owner approval before acting.

## 8. Evidence Contract

List evidence that proves this policy was reviewed or tested.

Accepted evidence may include:

- CI test output;
- project-owned adversarial test scripts;
- external eval reports;
- provider safety reports;
- manual security review notes.

PSDM validates that evidence exists when required; PSDM does not provide native runtime tracing or hosted eval execution.

## 9. Known Gaps

Document accepted gaps, owner, follow-up date, and risk.

## 10. Guardrail Gate

AI behavior is not ready when guardrails, tool boundaries, approval rules, or evidence are missing for the declared risk level.
