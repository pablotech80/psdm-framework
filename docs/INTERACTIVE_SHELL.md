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
│  Mode       READ ONLY · governance shell                           │
├────────────────────────────────────────────────────────────────────┤
│  Project    payments-api                                          │
│  Branch     feature/session-hardening                              │
│  Changes    2 staged · 1 unstaged                                  │
│  Policy     backend-api · psdm.config.json                         │
╰────────────────────────────────────────────────────────────────────╯
Powered by PSDM · Type / for commands · /inspect staged · /exit close

riscala ❯
```

## Visual Identity

Riscala uses the cyan already present in Ptech's repository assets:

| Token | Value | Use |
|---|---|---|
| Ptech cyan | `#00A8E8` | Frame, brand name, commands, and primary prompt. |
| Ptech cyan light | `#38BDF8` | Prompt chevron and read-only mode accent. |
| Green | terminal semantic color | Clean repository state. |
| Yellow | terminal semantic color | Staged, unstaged, or untracked changes. |
| Red | terminal semantic color | Missing repository or blocking state. |

ANSI color is presentation only. It is enabled exclusively for interactive TTY output and disabled when output is piped, `TERM=dumb`, or `NO_COLOR` is present. JSON and automation contracts remain free of ANSI escape sequences.

The prompt is:

```text
riscala ❯
```

Riscala does not add an npm `postinstall` animation or artificial startup delay. npm owns installation progress, lifecycle scripts increase the package trust surface, and the sub-second dependency-free installation is treated as a product advantage. Future spinners are reserved for operations that genuinely wait on external state.

## Slash Command Palette

Typing `/` as the first prompt character opens the command palette immediately:

```text
╭─ Commands ─────────────────────────────────────────────────────────╮
│ ❯ /help      Show available commands and safety boundaries.        │
│   /status    Refresh repository and policy context.                │
│   /inspect   Inspect staged changes and governance level.          │
│   /exit      Close the Riscala shell.                              │
╰─ ↑/↓ navigate · Enter run · Tab complete · Esc close ──────────────╯
```

Interaction contract:

- typing filters commands by prefix;
- `↑` and `↓` cycle through filtered commands;
- `Enter` selects and executes the highlighted command;
- `Tab` completes the highlighted command without executing it;
- `Esc` closes the palette and clears the current input;
- Backspace, Delete, Home, End, Left, and Right preserve normal line editing;
- `Ctrl+C` and `Ctrl+D` close the interactive session safely.

The palette exists only for a real interactive TTY. Pipes and automation continue to use line-oriented input and receive no cursor-control or ANSI sequences.

## Command Results

Read-only commands share one result-panel grammar instead of emitting unrelated text shapes:

```text
╭─ INSPECT ──────────────────────────────────────────────────────────╮
│  State      No staged changes found.                               │
│  Next       Stage the intended files, then run /inspect again.     │
╰────────────────────────────────────────────────────────────────────╯
```

- the title identifies the command result;
- labels stay aligned across `/status`, `/inspect`, and `/help`;
- long evidence wraps inside the panel instead of being silently truncated;
- semantic color highlights state but does not change the monochrome text contract;
- `Next` explains the useful follow-up without executing or authorizing it.

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
