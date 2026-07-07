# PSDM Overview

PSDM is a spec-driven governance framework for real software delivery with AI assistance.

Although the CLI can run in any repository, PSDM's strongest controls are aimed at backend and platform boundaries: auth, data, payments, AI agents, deployment, infrastructure, and operations.

It exists to prevent two common failures:

- AI agents shipping changes without enough context.
- Teams adding so much process that delivery slows down unnecessarily.

## Core Flow

```text
Project Brief
  -> Specification
  -> Architecture
  -> Change Governance
  -> Tasks
  -> Testing
  -> Deployment
  -> Security / Operations
  -> ADRs
```

## Operating Model

Every change is classified by impact:

- Low-risk changes move fast.
- Product behavior changes require product artifacts.
- Security, data, payment, AI, deployment, and operations changes require stronger gates.

## AI-Agent Role

Agents can help inspect, design, implement, and validate work, but must stay inside explicit scope and stop when required context is missing.
