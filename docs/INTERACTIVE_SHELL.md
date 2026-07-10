# Riscala Interactive Shell

Status: `Read-only MVP`
Product: `Riscala`
Method: `PSDM`

## Purpose

Provide a dependency-free terminal interface for inspecting the current project's governance context without granting new mutation capabilities.

Start it inside any repository:

```bash
riscala shell
```

Or inspect another local project:

```bash
riscala shell /path/to/project
```

The project name, branch, working-tree counts, profile, and config source are calculated from that target. They are not fixed to the Riscala repository.

## Interface

```text
╭─ RISCALA ──────────────────────────────────────────────────────────╮
│  Mode       Read-only governance shell                             │
├────────────────────────────────────────────────────────────────────┤
│  Project    payments-api                                          │
│  Branch     feature/session-hardening                              │
│  Changes    2 staged · 1 unstaged                                  │
│  Policy     backend-api · psdm.config.json                         │
╰────────────────────────────────────────────────────────────────────╯
Powered by PSDM · Type /help to see available commands.

riscala ›
```

## Commands

| Command | Behavior |
|---|---|
| `/help` | Show the available shell commands and safety boundary. |
| `/status` | Refresh repository, branch, working-tree, and policy context. |
| `/inspect` | Inspect staged Git changes and calculate their governance level. |
| `/exit` | Close the session. `/quit` is also accepted. |

Commands do not accept arbitrary shell fragments or arguments in this MVP.

## Security Boundary

The shell is an allowlist router, not a general terminal or agent runtime.

The MVP explicitly blocks `/commit`, `/push`, `/pr`, `/merge`, `/publish`, `/release`, and `/deploy`. The action-record and receipt-verification core now exists for `git.commit`, but those commands remain blocked until a trusted owner key is enrolled and independent hooks enforce the receipt.

A confirmation phrase entered through an agent-controlled terminal is not sufficient human-presence evidence. The approval architecture remains defined in `docs/AGENT_DECISION_PROTOCOL.md`.

The shell reads local project metadata and invokes Git only through existing fixed-argument inspection helpers. It does not execute user-provided shell commands, modify files, change the Git index, or emit a new JSON automation contract.
