# ADR-2026-07-11-refocus-riscala-on-developer-judgment

Status: `Accepted`
Date: `2026-07-11`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Architecture Decision Record`

## 1. Decision

Refocus Riscala from artifact-centric AI code governance to a developer-judgment system for AI-assisted software development.

Riscala will use repository evidence and PSDM reasoning to expose impact, assumptions, alternatives, trade-offs, uncertainty, reversibility, and implementation drift. The developer remains the authority for product direction and technical decisions.

The product boundary is:

```text
PSDM      = construction and reasoning method
Riscala   = judgment amplification and decision evidence
AGENTS.md = execution adapter for AI coding agents
AI agent  = analysis and execution support
Developer = final authority
```

## 2. Context

The original PSDM method was designed to help a developer transform intent into a production-ready system without surrendering scope, architecture, security, data, deployment, or technical-debt decisions to AI.

The current CLI implemented useful primitives for repository audit, validation, risk classification, staged Git inspection, CI enforcement, content-bound action records, approval receipts, and local hooks. However, the public experience increasingly exposed those mechanisms as the product itself.

This created three problems:

- project-lifecycle governance was applied as daily change friction;
- documents and levels became more visible than technical reasoning;
- enforcement advanced faster than the developer experience for understanding and deciding a change.

A capable developer can already combine an AI assistant, `AGENTS.md`, Git, and tests. Riscala has a reason to exist only when it adds repository-grounded judgment, continuity, and verification that a conversation alone does not reliably provide.

## 3. Product Thesis

```text
AI multiplies code production.
Riscala multiplies the developer's ability to judge what should be built,
how it should integrate, and which consequences are acceptable.
```

Riscala must help a developer answer:

- What decision am I actually making?
- What parts of the system can this change affect?
- Which assumptions and uncertainties exist?
- What alternatives and trade-offs should I consider?
- Which consequences are expensive to reverse?
- Did the implementation remain inside the decision and scope I accepted?
- What should I learn from the difference between expected and actual impact?

## 4. Chosen Product Flow

The first complete product loop is:

```text
Developer intent
  -> repository evidence
  -> judgment brief
  -> explicit developer decision
  -> AI-assisted implementation
  -> staged implementation review
  -> learning or durable decision capture when justified
```

The judgment brief separates:

```text
Observed facts
Inferences
Options
Trade-offs
Recommendation
Owner decisions
Uncertainty
```

The implementation review compares:

```text
Accepted intent and scope
Expected affected surfaces
Actual staged diff
Validation evidence
Unexpected consequences or decision drift
```

## 5. Developer Experience

Riscala will support one reasoning engine with adjustable explanation density:

- `learn`: teach concepts, vocabulary, and why consequences matter;
- `balanced`: present impact, decisions, alternatives, and evidence without tutorial depth;
- `concise`: surface only non-obvious consequences, contradictions, expensive decisions, and gaps.

These modes do not weaken safety or change facts. They adapt explanation for developers at different experience levels without labeling the developer as junior, senior, or staff.

## 6. Greenfield And Legacy

For greenfield projects, Riscala begins with intent and progressively establishes only the context required to make the next sound decision.

For legacy projects, Riscala begins read-only from repository evidence, reconstructs an observed baseline, exposes uncertainty, and asks the developer to correct or accept important interpretations before they become governed context.

Neither mode requires a full document set before producing its first useful insight.

## 7. Consequences

### Positive

- Restores the developer as the center of the product.
- Gives Riscala a clearer advantage over a prompt library or `AGENTS.md` alone.
- Reuses deterministic Git, risk-path, validation, JSON, and CI foundations.
- Lets PSDM remain a durable method without imposing every phase on every change.
- Creates value for learning, daily engineering, and architecture leadership through explanation density rather than separate products.

### Negative

- Existing documentation and command hierarchy require substantial realignment.
- Current keyword and path classification is insufficient as the final judgment output.
- Reliable semantic impact analysis must expose uncertainty and avoid false authority.
- The first beta.6 increment cannot cover every language or architectural pattern deeply.

### Trade-offs

- Beta.6 prioritizes one complete judgment loop over broader command coverage.
- Existing commands and JSON contracts remain compatible, but they move out of the primary product story.
- Approval, hook, and enforcement capabilities remain advanced controls rather than the daily experience.

## 8. Beta.6 Scope

Beta.6 will establish:

- a repository-grounded Judgment Brief before implementation;
- explicit separation of facts, inferences, recommendations, and developer decisions;
- a minimal decision state or change envelope;
- staged Decision Review against accepted intent and scope;
- `learn`, `balanced`, `concise`, and JSON renderings;
- first-use support without mandatory initialization;
- compatibility with the existing `riscala`, `psdm`, config, and JSON surfaces.

Beta.6 will not add:

- SaaS or hosted state;
- remote approval;
- a new npm package or repository rename;
- GraphRAG, vector storage, or runtime knowledge infrastructure;
- more templates, risk levels, or opaque scores;
- autonomous owner decisions;
- deep support for every language and framework.

## 9. Success Criteria

- A developer receives a useful repository-grounded insight in under two minutes without running `init`.
- Low-risk changes do not require governance documents.
- Facts, inferences, recommendations, and owner decisions are visibly distinct.
- Riscala cannot create or simulate an owner decision.
- The staged review detects real scope drift or missing evidence in representative fixtures.
- A learning-oriented output explains why a decision matters.
- A concise output remains useful to an experienced developer without repeating obvious advice.
- Greenfield and legacy examples both complete the judgment loop.
- Existing executable aliases and stable automation contracts remain compatible.

## 10. Related Artifacts

- `docs/PROJECT_BRIEF.md`
- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `ROADMAP.md`
- `TODO.md`
- `docs/ROADMAP.md`
- `docs/AGENT_DECISION_PROTOCOL.md`
- `docs/KNOWLEDGE_AS_CODE.md`

## 11. Review Notes

Accepted by the repository owner after reviewing the original PSDM method in the PTECH OS vault and identifying that the current product had shifted from amplifying developer judgment toward daily governance friction.

This ADR changes product direction. It does not authorize publication, breaking compatibility changes, autonomous AI decisions, or weakening existing security and approval boundaries.
