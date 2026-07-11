# Beta.6 External Validation

Status: `Completed With Follow-Up`
Date: `2026-07-11`
Product: `Riscala`
Scope: `Judgment Brief and staged Decision Review`

## Purpose

Validate the first beta.6 judgment loop outside framework fixtures before treating it as a release candidate.

The validation used:

- an empty temporary directory for greenfield first use;
- a temporary Git snapshot of a representative Ptech legacy web repository;
- controlled synthetic changes inside the temporary snapshot for aligned and drift review;
- no mutation of the source legacy repository;
- no secrets, customer data, private file contents, or production values in recorded evidence.

## Greenfield Scenario

Intent:

```text
Build a SaaS that helps small businesses qualify leads with AI.
```

Observed outcome:

- first result required no `riscala init`;
- execution completed in approximately 0.08-0.09 seconds locally;
- initial implementation jumped too quickly to AI data and authority risks;
- correction added a greenfield intake layer before technical commitment;
- corrected output asks for user, problem, observable outcome, first-version boundary, and expensive-to-get-wrong concerns;
- AI data, authority, evaluation, cost, latency, and fallback questions remain visible after product intake;
- uncertainty remains high because no implementation evidence exists;
- owner decision remains unset and developer-only.

Conclusion:

```text
Greenfield first value is proven without initialization, but Riscala must remain an intent-clarification aid rather than pretend to know architecture before a repository exists.
```

## Legacy Scenario

Intent:

```text
Add AI-generated service recommendations to an existing contact lead flow.
```

Expected paths were supplied from real repository structure. Riscala observed only bounded metadata:

- selected TypeScript/TSX paths exist;
- selected module references;
- an API route exports a `POST` handler;
- project identity and validation scripts;
- Git and repository structure.

Initial outcome:

- repository facts were correct;
- reasoning remained too generic and did not use contact, lead, API, or target-file evidence sufficiently;
- balanced mode included dependency and directory inventory that did not change the decision;
- concise mode hid relevant provenance together with noise.

Corrections:

- added bounded target import and exported HTTP-handler evidence;
- added path-aware contact, lead, form, and API reasoning;
- added recommendation authority, lead-data, routing, persistence, consent, fallback, and API-contract questions;
- filtered human evidence by guidance density while preserving full JSON evidence;
- kept code-level semantic understanding explicitly out of scope.

Corrected outcome:

- Judgment Brief connected AI behavior with the actual contact and lead flow;
- advisory-after-submit and recommendation-driven-routing became explicit alternatives;
- the brief asked whether output is user-facing or operator-facing, whether it may change routing, which lead fields may be processed, and how failure behaves;
- no source code or unrestricted content appeared in the output.

## Decision Review Scenarios

### Scope Aligned

A controlled recommendation module was staged inside the expected contact-flow path.

Result:

```text
scope_aligned_evidence_unverified
```

Meaning:

- expected and staged paths matched;
- the observed user-flow surface was reported;
- validation execution remained `not_supplied`;
- authority remained unverified;
- no approval or readiness claim was created.

The earlier wording `aligned_but_unapproved` was rejected during validation because it could imply broader readiness than the evidence proved.

### Scope And Delivery Drift

The same staged change included an undeclared GitHub Actions workflow.

Result:

- workflow reported outside expected scope;
- delivery surface reported as unexpected deterministic evidence;
- severity elevated to `high`;
- readiness recommendation changed to `developer_review_required`;
- validation and owner authority remained unverified.

## Persona Value Review

### Learning

The corrected greenfield and lead-intake briefs explain why product outcome, AI authority, data use, and routing matter. The learning mode has a defensible educational role.

### Balanced

The evidence filter removes dependency and directory inventory that does not affect the decision while retaining identity, validation capability, selected paths, imports, and HTTP handlers.

### Concise

Concise mode preserves decision-relevant target imports and handlers while omitting generic repository inventory and expected/staged lists where no drift needs explanation.

## Findings

### Proven

- first value without init;
- dependency-free sub-second local execution;
- deterministic evidence separated from inference;
- greenfield and legacy modes;
- path- and target-aware judgment improvement;
- advisory scope comparison against staged Git state;
- real drift detection for an undeclared delivery surface;
- no simulated owner authority;
- explanation density from one underlying result.

### Not Proven

- code-level semantic understanding;
- validated execution results supplied to Decision Review;
- cryptographically or independently bound owner decisions;
- usefulness across multiple language ecosystems;
- retention or repeated use by external developers;
- public onboarding clarity after the Product Reset.

## Release Readiness Decision

The judgment loop is technically validated but beta.6 is not yet a release candidate.

Before release-candidate preparation:

- realign public positioning, README quick start, help hierarchy, and shell guidance around `impact` and `review`;
- make the current capabilities and semantic limits obvious;
- run a final clean-install journey using only public documentation;
- preserve owner-authority binding as a separate design decision rather than weakening the current boundary.

## Evidence Commands

Representative commands:

```bash
riscala impact "<greenfield intent>" --guidance balanced
riscala impact "<legacy change intent>" --files <selected-paths> --guidance balanced
riscala review "<change intent>" --staged --files <expected-paths>
```

Raw source, secrets, private data, production values, and external credentials are intentionally excluded from this record.
