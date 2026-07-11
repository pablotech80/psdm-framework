# PROJECT_BRIEF.md

Status: `Active`
Project: `psdm-framework`
Method: `PTECH SPEC-DRIVEN METHOD`

## Problem Statement

AI makes code production faster and increasingly commoditized. The limiting capability shifts toward developer judgment: understanding the real problem, seeing non-obvious impact, comparing alternatives, choosing acceptable trade-offs, preserving architectural direction, and verifying that generated code matches the intended decision.

An AI assistant and a strong `AGENTS.md` can guide cooperative execution, but they do not independently preserve decision continuity, separate observed repository facts from inference, or compare an accepted decision with the resulting Git diff.

Riscala exists to amplify the developer's technical judgment during AI-assisted development. It uses repository evidence and the PSDM reasoning method to expose impact, assumptions, alternatives, trade-offs, uncertainty, reversibility, and implementation drift while keeping the developer as the final authority.

PSDM remains the construction and reasoning method. Riscala is the product-facing judgment and evidence layer. `AGENTS.md` is an execution adapter for AI coding agents, not the complete source of project governance.

## Target Users

- Developers learning to reason about architecture, risk, verification, and trade-offs while using AI.
- Experienced developers who need concise detection of non-obvious impact, contradictions, and missing evidence.
- Staff and principal engineers who need to scale technical judgment and decision continuity without creating daily bureaucracy.
- Solo developers who simultaneously own product, architecture, implementation, security, and delivery decisions.

## Product Outcome

A developer can state an intended change, understand the decision underneath it, inspect repository-grounded impact and alternatives, make an explicit decision, delegate implementation to an AI agent, and verify the staged result against the accepted intent and scope.

## Success Criteria

- The framework remains installable as a dependency-free CLI.
- A developer receives a useful first insight without mandatory repository initialization.
- Small safe changes stay fast and do not require governance documents.
- Higher-impact changes receive deeper reasoning rather than only more process.
- Observed facts, inferences, recommendations, uncertainty, and developer decisions are visibly distinct.
- Riscala never creates, simulates, or silently infers an owner decision.
- The implementation can be compared with accepted intent, scope, and required evidence.
- Explanation density supports learning, balanced daily use, and concise expert review.
- Greenfield and legacy repositories can both complete the intent-to-verification loop.
- Human-readable output improves developer judgment while JSON remains useful for automation.
- Configuration is explicit, versioned, and understandable without external services.
- Riscala can evolve as a recognizable product without breaking PSDM governance contracts.

## Out Of Scope For Beta.6

- SaaS or hosted project state.
- Remote approval services.
- Autonomous product, architecture, security, data, or deployment decisions.
- A new npm package or GitHub repository rename.
- GraphRAG, vector databases, or runtime knowledge infrastructure.
- Deep semantic support for every language and framework.
- More templates, risk levels, or opaque scoring.

## Open Questions

- What config schema guarantees are required before `1.0.0`.
- What minimum repository evidence produces a useful Judgment Brief across stacks.
- How decision state remains small, human-readable, versionable, and tool-neutral.
- Which impact findings can be deterministic and which require explicitly uncertain semantic inference.
- How learning is preserved without turning every interaction into documentation.
- Which stable command and JSON contracts should represent the first complete judgment loop.
