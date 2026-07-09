# KNOWLEDGE_AS_CODE.md

Status: `Active`
Project: `psdm-framework`

## Purpose

Define PSDM's Knowledge as Code Layer without making the method depend on Obsidian, vector databases, graph databases, GraphRAG, or any specific agent runtime.

PSDM treats knowledge as a first-class artifact. A project should not preserve only source code, but also intent, specifications, architectural decisions, business rules, agent instructions, workflows, prompts, verification criteria, and evolution notes as versioned knowledge assets.

Spanish formulation:

```text
PSDM trata el conocimiento como un artefacto de primera clase. Un proyecto no debe conservar solo codigo, sino tambien intencion, especificaciones, decisiones arquitectonicas, reglas de negocio, instrucciones para agentes, workflows, prompts, criterios de verificacion y aprendizajes de evolucion como conocimiento versionado.
```

## Position In PSDM

Knowledge as Code is a transversal layer, not a new mandatory phase.

It supports the existing PSDM flow:

```text
Intent -> Spec -> Architecture -> Tasks -> Implementation -> Verification -> Deployment -> Evolution
```

The layer keeps the context behind that flow durable, reviewable, and reusable by humans and agents.

## Source Of Truth

The source of truth should be repository-owned, portable, and versioned:

- Markdown and YAML hold the primary knowledge assets.
- Git versions the knowledge, review history, and ownership changes.
- Runtime stores such as vector databases and graph databases are derived indexes.
- Agent runtimes consume the knowledge, but do not replace the repository as source of truth.

This keeps PSDM independent from any specific editor, database, model provider, or agent framework.

## Tool Roles

| Layer | Role |
|---|---|
| Obsidian | Optional authoring layer for writing, linking, and reviewing knowledge. It is not required by PSDM. |
| Markdown/YAML | Portable base format for notes, policies, metadata, relationships, and reviewable changes. |
| Git | Versioned source of truth for knowledge assets. |
| Indexer | Transforms Markdown/YAML into searchable indexes, metadata, embeddings, or relationship records. |
| Vector DB | Derived runtime index for semantic retrieval. |
| Graph DB | Derived runtime index for explicit entities and relationships. |
| Agent Runtime | Consumer of governed knowledge for planning, implementation, verification, and operations. |

## RAG, Knowledge Graph, And GraphRAG

RAG retrieves semantically similar text fragments. It is useful when an agent needs relevant context from documents, prompts, tickets, notes, or policies.

A Knowledge Graph organizes explicit entities and relationships: concepts, business rules, workflows, agents, tools, decisions, systems, owners, and dependencies.

GraphRAG combines graph structure with retrieval. It can be valuable for advanced projects, but it is not required to adopt PSDM or the Knowledge as Code Layer.

Obsidian can help authors write and connect notes, but its visual graph is not automatically an operational Knowledge Graph. Operational graph behavior requires stable IDs, typed relationships, indexing, and validation.

## Recommended Project Structure

This structure is optional. Teams should adopt it only when the knowledge surface is large enough to justify it.

```text
project/
|-- README.md
|-- AGENTS.md
|-- SKILL.md
|-- design-system.md
|-- docs/
|   |-- intent.md
|   |-- spec.md
|   |-- architecture.md
|   |-- verification.md
|   `-- deployment.md
|-- knowledge/
|   |-- glossary.md
|   |-- business-rules.md
|   |-- architecture-decisions.md
|   |-- workflows.md
|   |-- agents.md
|   |-- prompts.md
|   `-- evolution-log.md
`-- src/
```

PSDM's generated baseline remains intentionally smaller. The `knowledge/` folder is a recommended extension, not a required artifact.

## Example Knowledge Note

```md
---
id: process.lead_qualification
type: process
domain: real_estate
status: active
owner: ptech
related:
  - agent.real_estate_lead_agent
  - workflow.telegram_intake
  - rule.qualification_rules
depends_on:
  - workflow.telegram_intake
  - workflow.email_summary
---

# Lead Qualification

Define the intent, decision rules, workflow boundaries, verification criteria, and operational notes for lead qualification.
```

## Maturity Levels

### Level 1 - Knowledge As Documentation

Markdown, Git, and a clear repository structure are enough. The goal is durable context that humans and agents can read.

### Level 2 - Knowledge As Code

Markdown plus YAML frontmatter, stable IDs, typed relationships, ownership, and validation rules. The goal is reviewable and machine-parseable knowledge.

### Level 3 - Knowledge As Runtime

Vector databases, graph databases, GraphRAG, and agents consume versioned knowledge through derived indexes. The goal is runtime use while keeping Git as the source of truth.

## Adoption Guidance

Start with Level 1 unless the project already has enough complexity to justify more structure.

Move to Level 2 when teams need stable IDs, ownership, relationships, or automated validation.

Move to Level 3 only when runtime agents need indexed access to governed knowledge and the team can operate the additional infrastructure.

Do not add vector databases, graph databases, or GraphRAG because they are fashionable. Add them only when they solve a specific retrieval, relationship, or runtime decision problem.
