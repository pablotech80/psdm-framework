# AGENTS.md

Status: `Active`
Method: `PTECH SPEC-DRIVEN METHOD`
Repository: `psdm-framework`
Mode: `Framework Development`

## Purpose

Define how AI coding agents must operate in this repository while building the PSDM Framework.

PSDM is a governance framework for AI-assisted software projects. The implementation is currently a dependency-free Node.js CLI, but the product domain is backend, platform, architecture, security, AI-agent, and delivery governance.

## Required Reading

Before changing behavior, read:

- `README.md`
- `ROADMAP.md`
- `TODO.md`
- `docs/PSDM_OVERVIEW.md`
- `docs/CHANGE_LEVELS.md`
- `docs/ROADMAP.md`
- relevant files under `src/`

For security, AI-agent, tool, backend/platform, or CI behavior, also read:

- `docs/AI_AGENT_SECURITY.md`
- `docs/TOOL_REGISTRY.md`
- `docs/RISK_PATHS.md`
- `templates/psdm.config.json`

## Boundaries

Agents must preserve these constraints:

- Keep the CLI dependency-free unless there is a strong architectural reason.
- Preserve existing human-readable CLI output unless the change explicitly revises it.
- Keep JSON output stable and automation-friendly.
- Scale governance with risk; do not add bureaucracy to Level 0 or Level 1 changes.
- Treat auth, data, payment, AI, deployment, operations, and CI/CD behavior as high-risk surfaces.
- Never include secrets, credentials, private customer data, or production values in docs, tests, prompts, or examples.

## Change Flow

1. Classify the change by behavior, touched files, and risk paths.
2. Read the relevant docs and source files.
3. Make the smallest coherent change.
4. Run focused validation.
5. Update `ROADMAP.md` and `TODO.md` for every meaningful advance.
6. Update docs when the public CLI, config, templates, or governance model changes.
7. Commit and push when the user asks to proceed with implementation.

## Validation

Use relevant commands for the touched surface:

```bash
for file in bin/psdm.mjs src/**/*.mjs; do node --check "$file"; done
node bin/psdm.mjs help
node bin/psdm.mjs classify "small cleanup" --file backend/auth/session.py --json
npm pack --dry-run
```

For config or template changes, also validate an initialized temporary project:

```bash
tmpdir=$(mktemp -d)
node bin/psdm.mjs init "$tmpdir"
node bin/psdm.mjs check "$tmpdir" --json
node bin/psdm.mjs validate "$tmpdir" --json
```

## Escalation

Stop and surface the issue when:

- the requested change conflicts with PSDM's risk-scaled governance principle;
- the change would require new dependencies without clear payoff;
- validation output contradicts the intended behavior;
- production, secrets, payment, or private-data behavior is unclear;
- the repository state has unrelated user changes that block safe edits.

## Communication

Every final response after implementation must include:

- what changed;
- what validation ran;
- whether `ROADMAP.md` and `TODO.md` were updated;
- commit or push status when applicable;
- `Siguiente accion`, with the next concrete recommended step and the reason that step should come next.

## Final Rule

Prefer small, explicit, testable increments. Always name the next action and explain why it is the right next step.
