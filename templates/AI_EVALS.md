# AI_EVALS.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `AI Evaluation Governance`
Mode: `AI / Quality Mode`

## 1. Purpose

Define evaluation expectations for AI behavior.

This artifact governs eval scope and evidence. PSDM does not replace eval platforms, provider tools, or project-owned test runners.

## 2. Eval Scope

Document AI features, prompts, agents, RAG flows, tools, and outputs covered by evals.

## 3. Evaluation Criteria

Define criteria such as:

- correctness;
- groundedness;
- refusal quality;
- safety;
- privacy;
- tool-use correctness;
- regression stability;
- latency or cost acceptance where applicable.

## 4. Dataset Policy

Define dataset ownership, source, review cadence, data classification, and redaction requirements.

## 5. Execution Method

Document how evals are run:

- project-owned script;
- CI job;
- external eval platform;
- manual review.

## 6. Acceptance Thresholds

| Criterion | Threshold | Owner | Evidence |
|---|---|---|---|
| Correctness | TBD | TBD | TBD |
| Safety | TBD | TBD | TBD |
| Groundedness | TBD | TBD | TBD |
| Tool correctness | TBD | TBD | TBD |

## 7. Evidence Contract

Accepted evidence may include:

- eval report;
- CI output;
- reviewed dataset version;
- reviewer approval;
- known failure register.

PSDM validates that evidence exists when required; PSDM does not host eval execution.

## 8. Known Gaps

Document accepted gaps, owner, follow-up date, and mitigation.

## 9. Eval Gate

AI behavior is not ready when eval scope, criteria, thresholds, dataset policy, execution method, or evidence are missing.
