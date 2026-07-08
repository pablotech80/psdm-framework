# DATA_CLASSIFICATION.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Data Classification Governance`
Mode: `AI / Data Mode`

## 1. Purpose

Define how project data is classified before it is used in prompts, retrieval, logs, evals, generated docs, or tool calls.

## 2. Data Classes

| Class | Examples | Prompt Use | Logging | Retention | Required Control |
|---|---|---|---|---|---|
| Public | TBD | TBD | TBD | TBD | TBD |
| Internal | TBD | TBD | TBD | TBD | TBD |
| Confidential | TBD | TBD | TBD | TBD | TBD |
| Regulated | TBD | TBD | TBD | TBD | TBD |
| Secret | TBD | Prohibited | Prohibited | Prohibited | Never expose values |

## 3. PII Policy

Define whether PII or private customer data may enter prompts, context windows, logs, traces, screenshots, eval datasets, or generated documentation.

## 4. Redaction Policy

Define required redaction before data enters:

- prompts;
- RAG context;
- tool arguments;
- logs;
- eval datasets;
- support tickets;
- generated docs.

## 5. Access Boundaries

Define which roles, services, and AI agents may access each data class.

## 6. Retention

Define retention expectations for prompts, outputs, logs, eval datasets, embeddings, and vector indexes.

## 7. Evidence Contract

Accepted evidence may include:

- data inventory;
- redaction test output;
- access review;
- RAG source review;
- DPA or compliance review notes.

PSDM validates that evidence exists when required; PSDM does not inspect production data stores.

## 8. Known Gaps

Document accepted data risks, owner, follow-up date, and mitigation.

## 9. Data Gate

AI behavior is not ready when data classes, PII policy, redaction, access boundaries, or evidence are unclear.
