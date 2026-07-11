# Getting Started With Riscala

Status: `Beta.6 Published`

## The Mental Model

Riscala amplifies developer judgment around AI-assisted coding:

```text
intent -> impact -> developer decision -> AI implementation -> staged evidence -> review -> developer decision
```

Riscala advises. You own product direction, architecture, scope, trade-offs, validation, and release decisions.

No initialization is required for the judgment loop.

## Install

Requirements: Node.js 20 or newer and Git for staged review.

Install the published beta:

```bash
npm install -g @ptechsolution/psdm-framework@beta
riscala help
```

For local framework development, `npm install -g .` installs the current checkout instead.

The package name remains for compatibility. `riscala` is the primary executable; `psdm` remains an identical alias.

## Greenfield First Use

Run `impact` from an empty or new project directory:

```bash
riscala impact "build a SaaS that helps small businesses qualify leads with AI" --guidance learn
```

Because there is no implementation evidence, Riscala starts with the user, problem, observable outcome, first-version scope, and expensive-to-get-wrong concerns. It should not pretend that architecture is already known.

Choose the direction and constraints yourself before asking an AI agent to implement.

## Existing Project

Name the intent and the files you expect to be affected:

```bash
riscala impact "add AI recommendations to the contact lead flow" \
  --files src/app/contact/ContactForm.tsx,src/app/api/lead/route.ts
```

Riscala uses bounded repository metadata. For selected JavaScript and TypeScript files it may report module references and exported HTTP handler names; it does not print source bodies or claim full semantic understanding.

After implementation, stage the expected files and review them:

```bash
git add src/app/contact/ContactForm.tsx src/app/api/lead/route.ts
riscala review "add AI recommendations to the contact lead flow" --staged \
  --files src/app/contact/ContactForm.tsx,src/app/api/lead/route.ts
```

Read `scope_aligned_evidence_unverified` narrowly: staged file scope aligns and no modeled deviation was found. Tests, behavior, correctness, and owner authority remain unverified.

## Working With An AI Coding Agent

Use the Judgment Brief as input to your agent, but do not delegate the developer-only decisions back to it.

```text
1. Run riscala impact.
2. Answer the owner decisions yourself.
3. Give the agent the chosen direction, constraints, and allowed scope.
4. Inspect and stage the result.
5. Run riscala review.
6. Validate behavior and decide whether to revise, accept, or reject.
```

`AGENTS.md`, Cursor rules, Claude instructions, Copilot instructions, and Codex instructions remain execution adapters. Riscala does not replace them; it strengthens the developer's decision loop around them.

## Read-Only Shell

```bash
riscala shell
```

Use:

```text
/impact <change intent>
/review <change intent>
```

The shell versions provide a compact view. Use the normal CLI with `--files` when you need an exact expected file envelope or `--json` for automation.

## When To Adopt PSDM Governance

The broader PSDM baseline is optional for first value. Consider it when the project needs durable shared policy, architecture decisions, security or data controls, CI enforcement, deployment evidence, or team onboarding.

```bash
riscala audit
riscala init
riscala validate
```

Low-risk work should stay lightweight. Higher-risk auth, data, payment, AI-authority, infrastructure, and production changes justify stronger evidence and approval boundaries.

## Current Limits

- Riscala infers impact; it does not prove code semantics.
- Decision Review observes staged Git evidence; it does not execute tests.
- CLI input is not verified human approval.
- Riscala does not implement, commit, push, merge, deploy, or publish from the read-only judgment loop.
- Beta.6 is published but remains beta software; interfaces may still change before a stable release.
