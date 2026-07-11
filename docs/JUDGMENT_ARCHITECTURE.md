# Riscala Judgment Architecture

Status: `Beta.6 Design Contract`
Date: `2026-07-11`
Product: `Riscala`
Method: `PTECH SPEC-DRIVEN METHOD (PSDM)`

## Purpose

Define the first complete Riscala product loop for amplifying developer judgment during AI-assisted software development.

This contract separates repository facts, semantic interpretation, recommendations, developer authority, implementation evidence, and learning. It applies to greenfield and legacy repositories without requiring a complete PSDM artifact baseline before first value.

## Product Loop

```text
Change Intent
  -> Repository Evidence
  -> Judgment Brief
  -> Owner Decision
  -> Change Envelope
  -> AI-Assisted Implementation
  -> Staged Decision Review
  -> Learning Or Durable Knowledge
```

PSDM provides the reasoning questions. Riscala applies only the depth relevant to the current decision. `AGENTS.md` adapts accepted project and change boundaries to an AI agent. The developer retains final authority.

## Trust Model

Every result must distinguish these epistemic categories:

| Category | Meaning | Authority |
|---|---|---|
| `observed` | Deterministic evidence read from the repository, Git, config, or validation output. | Riscala may assert with evidence reference. |
| `inferred` | A semantic interpretation derived from observed context. | Riscala must expose rationale and confidence. |
| `option` | A viable direction with consequences. | Riscala may propose multiple options. |
| `recommendation` | Riscala's argued preference among options. | Advisory only. |
| `owner_decision` | Scope, constraint, option, or risk explicitly accepted by the developer. | Only the developer may issue it. |
| `verification` | Evidence comparing implementation with the accepted decision. | Riscala reports; the developer decides readiness. |

Riscala must never present inference as observed fact or recommendation as owner authority.

## Domain Model

### ProjectContext

The minimum context required to reason about a repository.

```text
project identity
greenfield or legacy mode
observed stack and repository structure
known purpose and constraints
observed architecture boundaries
sensitive or expensive-to-reverse surfaces
relevant durable decisions
available validation commands
context gaps and confidence
```

`ProjectContext` may be partially observed. Missing information is not silently invented.

### ObservedEvidence

A fact with provenance.

```json
{
  "kind": "manifest-dependency | staged-file | migration | route | workflow | test | decision | other",
  "source": "repository-relative reference",
  "summary": "non-sensitive factual statement",
  "confidence": "deterministic"
}
```

Evidence must not contain secrets, private customer data, or unrestricted file content.

For selected JavaScript or TypeScript paths, beta.6 may report bounded module references and exported HTTP handler names as deterministic metadata. It must not emit source bodies or unrestricted file excerpts.

### ChangeIntent

The developer's proposed outcome before implementation.

```text
statement
known motivation
explicit in-scope behavior
explicit out-of-scope behavior
known constraints
open questions
```

Only `statement` is required for the first brief. Riscala discovers which missing decisions matter.

### ImpactHypothesis

Riscala's reasoned projection of the change.

```text
decision underneath the request
likely affected surfaces
assumptions
risks and second-order effects
reversibility
unknowns
confidence per inference
evidence references
```

An impact hypothesis is advisory and may be corrected by the developer.

### DecisionOption

A possible technical or product direction.

```text
option
benefits
costs
risks
operational consequences
reversibility
conditions where it is appropriate
```

Options must be materially distinct. Riscala must not manufacture false alternatives for trivial changes.

### OwnerDecision

An explicit developer choice.

```text
selected or rejected option
accepted scope
forbidden scope
accepted risk
constraints
decision rationale, when provided
decision timestamp and content binding when persistence is enabled
```

Riscala and AI agents may request or record an owner decision but must not create, infer, approve, or simulate one.

### ChangeEnvelope

The minimal execution boundary derived from intent and owner decisions.

```text
intent
accepted scope
forbidden scope
expected affected surfaces
relevant project decisions
required evidence
stop conditions
unresolved uncertainty
```

The envelope is human-readable, tool-neutral, and suitable for an AI execution adapter. It is not a complete project specification.

Beta.6 first implements an advisory envelope draft from CLI-supplied expected files. Because the same input channel may be controlled by an AI agent, this draft must expose:

```text
authority.source = cli_input
authority.authorityVerified = false
ownerDecision.status = unverified
ownerDecision.value = null
```

It supports comparison and developer reasoning, but it is not proof of owner identity or approval. Strong authority binding remains a separate security boundary.

### VerificationEvidence

Facts from the implementation and validation stage.

```text
staged files and status
unexpected surfaces
dependency, schema, config, CI, deployment, or public-contract changes
validation commands and outcomes
missing required evidence
decision or scope deviations
```

### Learning

A comparison between expected and actual impact.

```text
prediction that held
missed assumption
unexpected consequence
reusable question or pattern
candidate durable knowledge
```

Learning is proposed, not automatically persisted. Only knowledge needed to understand, operate, validate, or evolve the system should become a durable artifact.

## Judgment Brief Contract

The pre-implementation result contains:

```text
intent
observed context
decision underneath the request
likely impact
assumptions
options and trade-offs, when material
recommendation
owner decisions required
uncertainty and confidence
next evidence needed
```

Rules:

- It must provide value without `riscala init`.
- It must cite repository-relative evidence for observed claims.
- It must omit obvious ceremony for a trivial, reversible change.
- It must explain why a consequence matters, not only assign a level.
- It must expose when repository evidence is insufficient.
- It must never mark the owner-decision section complete without developer authority.

## Decision Review Contract

The post-implementation result compares a Change Envelope with the staged Git state.

```text
accepted intent
expected impact
actual impact
matched scope
unexpected or forbidden changes
architecture and decision contradictions
validation evidence
missing evidence
implementation deviations
readiness recommendation
learning
```

Rules:

- Git staged state is the deterministic implementation boundary for beta.6.
- Unstaged and untracked changes are reported separately and never silently included.
- A readiness recommendation is advisory; it is not an owner approval.
- CLI-declared scope is useful comparison input but does not establish human authority.
- A changed intent or owner decision invalidates the previous comparison.
- High-risk findings may reuse existing content-bound enforcement, but enforcement is not required for first insight.

## Explanation Density

All modes render the same underlying result.

### Learn

- explains technical vocabulary;
- connects evidence to architectural reasoning;
- explains why trade-offs and reversibility matter;
- teaches reusable questions without replacing the developer's decision.

### Balanced

- presents impact, options, trade-offs, recommendation, uncertainty, and decisions;
- omits introductory teaching unless needed for clarity.

### Concise

- surfaces only non-obvious impact, contradictions, expensive-to-reverse decisions, uncertainty, and evidence gaps;
- avoids repeating repository facts that do not change the decision.

### JSON

- preserves epistemic categories as machine-readable fields;
- uses stable decision and evidence identifiers;
- avoids translated or presentation-only labels as contract keys.

## Greenfield Flow

Greenfield first use starts with intent rather than artifact initialization.

Riscala asks only the questions required for the next sound decision:

```text
problem
target user
expected outcome
scope boundary
expensive-to-get-wrong concerns
```

Project artifacts are proposed progressively when they preserve a real decision or reduce future ambiguity. A low-risk prototype may remain lightweight. A production, data, auth, payment, AI, or operational boundary receives deeper reasoning.

## Legacy Flow

Legacy first use is read-only.

Riscala produces:

```text
observed stack and structure
likely architecture boundaries
critical surfaces
existing tests and validation capability
existing agent instructions and durable decisions
contradictions
unknowns and confidence
```

The developer may correct important interpretations before they become accepted Project Context. Absence of documentation is a context gap, not automatic non-compliance.

## Reuse Of Existing Components

Beta.6 should reuse:

- `src/lib/git.mjs` for repository and staged evidence;
- `src/lib/inspect.mjs` for staged change composition;
- `src/lib/risk-paths.mjs` for configured sensitive surfaces;
- `src/lib/audit.mjs` for non-destructive repository signals;
- `src/lib/config.mjs` for local policy and compatibility;
- existing JSON rendering, CI, action-record, approval, and hook primitives where relevant.

Keyword classification, artifact validation, and risk levels may contribute signals. They must not be presented as the complete technical judgment.

## Compatibility

Beta.6 preserves:

- `riscala` and `psdm` executable parity;
- `psdm.config.json` compatibility;
- existing command behavior unless separately versioned;
- existing JSON contracts for existing commands;
- dependency-free local operation;
- model and tool independence;
- current security and approval boundaries.

New contracts must be additive until stable-version compatibility is explicitly decided.

## Architecture Invariants

1. The developer is the only owner-decision authority.
2. Facts, inference, recommendation, and decision remain distinct.
3. First value does not require initialization or document generation.
4. Risk increases reasoning depth, not automatic bureaucracy.
5. The same reasoning result supports learn, balanced, concise, and JSON views.
6. Git-backed evidence and durable decisions remain portable and tool-neutral.
7. Riscala reports uncertainty rather than fabricating project understanding.
8. Existing enforcement is preserved but remains secondary to developer judgment.
9. Knowledge is persisted only when it must survive to understand, operate, validate, or evolve the system.
10. Compatibility changes require separate explicit decisions.

## Beta.6 Acceptance Scenarios

### Learning Developer

A developer proposes an authentication change and can explain afterward why identity linking, not OAuth configuration, is the central decision.

### Experienced Developer

A developer receives a concise report of only non-obvious impact, missing evidence, and expensive-to-reverse consequences within the normal Git workflow.

### Staff Or Principal Engineer

A developer sees that a proposed implementation contradicts an existing architecture decision or introduces a second cross-cutting mechanism, with evidence and uncertainty visible.

### Scope Drift

A staged implementation modifies a deployment workflow outside the accepted change envelope and Decision Review reports the deviation.

### Semantic Governance Impact

A product-direction and governance-architecture change is recognized as decision-significant even when legacy keyword and path classification would label the touched Markdown files as Level 0.

### Low-Risk Change

A small documentation or local presentation change produces a short result with no mandatory artifacts or artificial alternatives.
