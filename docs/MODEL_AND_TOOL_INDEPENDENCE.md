# MODEL_AND_TOOL_INDEPENDENCE.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Define how PSDM stays independent from any specific AI model, coding assistant, agent runtime, or vendor-specific init command.

PSDM is the repository governance layer. Claude, Cursor, Copilot, Codex, local agents, hosted agents, skills, prompts, and tool runtimes can all exist inside a PSDM-managed project, but they should consume or reference PSDM governance instead of replacing it.

## Principle

PSDM governs the project. Tool-specific files adapt the governance to a specific assistant.

Examples:

- `psdm.config.json` defines executable PSDM policy.
- `AGENTS.md` defines model-neutral agent rules.
- `docs/CHANGE_GOVERNANCE.md` defines the human-readable change policy.
- `docs/TOOL_REGISTRY.md` defines AI-accessible tool boundaries.
- `docs/PSDM_ADOPTION.md` records how existing AI instructions are integrated.
- `CLAUDE.md`, `.cursor/rules`, `.github/copilot-instructions.md`, `.codex`, `.windsurfrules`, prompts, and skills may adapt those rules for a specific tool.
- `docs/KNOWLEDGE_AS_CODE.md` defines how repository knowledge can remain portable while tools such as Obsidian, RAG, Knowledge Graphs, GraphRAG, and agent runtimes consume it.

Tool-specific rules may add local instructions, but they should not weaken PSDM change-level, security, data, deployment, approval, or tool-use boundaries.

## How Developers Customize PSDM

Project teams should customize PSDM through repository-owned artifacts:

1. Edit `psdm.config.json` for validation profile, required artifacts, feature artifact layout, AI policy, and risk path rules.
2. Edit `AGENTS.md` for model-neutral agent behavior.
3. Edit `docs/CHANGE_GOVERNANCE.md` for team process, approvals, and change-level expectations.
4. Edit `docs/TOOL_REGISTRY.md` for AI-accessible tools, permissions, forbidden operations, and human approval rules.
5. Edit `docs/AI_AGENT_SECURITY.md` when AI agents, prompts, tools, RAG, memory, evals, or automation are part of the project.
6. Edit `docs/KNOWLEDGE_AS_CODE.md` guidance when the project needs a formal `knowledge/` structure, frontmatter, stable IDs, or derived runtime indexes.
7. Use tool-specific files only as adapters that point back to PSDM governance.

## Knowledge Tool Boundaries

PSDM does not require a specific knowledge toolchain.

- Obsidian can help teams author, link, and review notes, but it is optional.
- Markdown and YAML are the portable base format for governed knowledge.
- Git is the versioned source of truth.
- Indexers may transform repository knowledge into embeddings, metadata, or relationship records.
- Vector databases support semantic retrieval.
- Graph databases support explicit relationships.
- Agent runtimes consume governed knowledge, but do not replace the repository record.

RAG retrieves semantically similar text fragments. A Knowledge Graph connects explicit entities and relationships. GraphRAG is an advanced runtime pattern that can be added later, not a PSDM prerequisite.

## Example Risk Rules

Use `riskPaths` in `psdm.config.json` to raise governance for sensitive areas:

```json
{
  "riskPaths": [
    {
      "pattern": "backend/auth/**",
      "minimumLevel": "Level 3",
      "requiredArtifacts": ["docs/SECURITY.md", "docs/TESTING.md"],
      "reason": "Authentication changes can expose private data or bypass access control."
    },
    {
      "pattern": ".github/workflows/**",
      "minimumLevel": "Level 4",
      "requiredArtifacts": ["docs/DEPLOYMENT.md", "docs/OPERATIONS.md"],
      "reason": "CI/CD changes can affect release and deployment behavior."
    }
  ]
}
```

## Example Agent Rule

Add this kind of rule to `AGENTS.md`:

```md
## Model And Tool Independence

- Preserve existing Claude, Cursor, Copilot, Codex, skill, and prompt files.
- Treat PSDM governance as the source of truth for change level, approval, security, data, deployment, and release rules.
- Tool-specific files may adapt PSDM rules for their assistant, but must not weaken them.
- Stop when a tool-specific instruction conflicts with PSDM governance and ask the owner to resolve the conflict.
```

## Example Claude Adapter

If the project uses `claude init`, keep the generated files when useful and add a reference back to PSDM:

```md
Follow this repository's PSDM governance in `AGENTS.md`, `psdm.config.json`, and `docs/CHANGE_GOVERNANCE.md`.

Do not override PSDM change-level, security, data, deployment, approval, or release rules.
```

The same pattern applies to Cursor rules, Copilot instructions, Codex instructions, custom skills, and prompt libraries.

## Adoption Behavior

Run:

```bash
psdm audit
psdm init
```

When PSDM detects existing AI governance files, it recommends integration and preserves those files. During init, PSDM creates `docs/PSDM_ADOPTION.md` so the team can record how existing tool-specific instructions coexist with PSDM.

This keeps PSDM independent from any one model while still making AI-assisted delivery governable.
