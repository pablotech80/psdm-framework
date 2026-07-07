# AI_READINESS_AUDIT.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Define the stable JSON contract for AI readiness data emitted by `psdm audit --json`.

AI readiness is separate from PSDM adoption. Adoption answers whether existing AI instructions should be preserved or integrated. Readiness answers whether detected AI surfaces have enough governance context for guardrails, data handling, cost, latency, evals, prompt injection, and tool security.

## JSON Contract

`psdm audit --json` includes:

```json
{
  "aiReadiness": {
    "version": 1,
    "status": "not_detected | gaps_detected | ready_for_review",
    "detectedSurfaceCount": 0,
    "surfaces": [],
    "governanceArtifacts": [],
    "gaps": [],
    "recommendations": [],
    "note": "contract note"
  }
}
```

## Status Values

`not_detected`

- No AI runtime or AI governance surface was detected by the current audit contract.
- This is not proof that the project has no AI behavior; it means PSDM did not find known signals.

`gaps_detected`

- One or more AI surfaces were detected.
- One or more expected governance artifact groups are missing.

`ready_for_review`

- One or more AI surfaces were detected.
- Every readiness governance group has at least one supporting artifact.
- This still requires owner review; it is not runtime safety certification.

## Surface Object

Each surface uses:

```json
{
  "kind": "agent-instructions",
  "detected": ["AGENTS.md"],
  "status": "detected"
}
```

Current surface kinds:

- `agent-instructions`
- `agent-skills-and-prompts`
- `rag-code`
- `embeddings`
- `ai-tools`
- `provider-sdks`
- `vector-stores`
- `automation-folders`
- `ai-security-docs`

Surface detection currently uses known paths and package manifests. Future increments may add deeper code-level analysis, eval suites, and observability signals.

## Governance Artifact Object

Each governance artifact group uses:

```json
{
  "key": "cost-latency",
  "purpose": "Token budget, provider cost budget, latency SLOs, fallback, and throttling expectations.",
  "existing": ["docs/OPERATIONS.md"],
  "missing": ["docs/COST_LATENCY_BUDGET.md"],
  "status": "present"
}
```

Current governance keys:

- `guardrails`
- `data-classification`
- `cost-latency`
- `prompt-injection-tests`
- `ai-evals`
- `tool-security`

## Gap Object

Each gap uses:

```json
{
  "key": "prompt-injection-tests",
  "message": "Missing AI readiness governance for prompt-injection-tests.",
  "expectedArtifacts": ["docs/PROMPT_INJECTION_TESTS.md", "docs/TESTING.md"]
}
```

Gaps are advisory in `0.15.0-alpha`. They do not fail `psdm validate`.

## Compatibility

Stable fields for version `1`:

- `aiReadiness.version`
- `aiReadiness.status`
- `aiReadiness.detectedSurfaceCount`
- `aiReadiness.surfaces`
- `aiReadiness.governanceArtifacts`
- `aiReadiness.gaps`
- `aiReadiness.recommendations`
- `aiReadiness.note`

New optional fields may be added without changing `version`.

## Current Detection Scope

Path-based detection covers common folders such as:

- `agents`
- `rag`
- `prompts`
- `embeddings`
- `tools`
- `vectorstore`
- `n8n`
- `automations`

Manifest-based detection covers known JavaScript and Python package signals in:

- `package.json`
- `requirements.txt`
- `pyproject.toml`
- `Pipfile`

Examples include OpenAI, Anthropic, LangChain, LlamaIndex, Chroma, Pinecone, Qdrant, Weaviate, tiktoken, and n8n packages.
