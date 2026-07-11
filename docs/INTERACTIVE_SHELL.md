# Riscala Interactive Shell

Status: `Active Work and read-only governance console`
Product: `Riscala`
Method: `PSDM`

## Purpose

Provide a dependency-free terminal interface that restores the current Active Work boundary before showing repository governance context. The only setup mutation is creation of `.riscala/ACTIVE_WORK.md`; source-code and delivery mutations remain blocked.

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
│  Work       ACTIVE · design                                      │
│  Objective  Harden payment session handling                      │
│  Allowed    Work inside this repository when it directly serves  │
│             the objective.                                       │
│  Forbidden  Change another repository.                           │
│  Next       Work inside the active boundary or propose an        │
│             explicit transition.                                 │
├────────────────────────────────────────────────────────────────────┤
│  Project    payments-api                                          │
│  Branch     feature/session-hardening                              │
│  Changes    2 staged · 1 unstaged                                  │
│  Policy     backend-api · psdm.config.json                         │
╰────────────────────────────────────────────────────────────────────╯
Powered by PSDM · /work sets the boundary · / commands

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
│   /work      Create the active objective and working mode.         │
│   /impact    Think through a change before implementation.         │
│   /review    Compare intent with staged Git evidence.               │
│   /status    Refresh repository and policy context.                │
│   /audit     Assess governance adoption and readiness.             │
│   /validate  Validate the governance baseline.                     │
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

The palette exists only for a real interactive TTY. Pipes and automation continue to use line-oriented input and receive no cursor-control or ANSI sequences. The palette includes diagnostics, report summaries, classification, PR checklist preparation, init preview, hook status, action record preparation, approval-boundary visibility, and session exit.

`/impact <change intent>` builds a compact Judgment Brief before implementation. `/review <change intent>` compares the same intent model with staged Git evidence after implementation. These commands advise; the developer owns direction, scope, trade-offs, validation, and acceptance.

The normal CLI remains the precise path for `--files`, explanation density, and JSON output.

## Command Results

Read-only commands share one result-panel grammar instead of emitting unrelated text shapes:

```text
╭─ INSPECT ──────────────────────────────────────────────────────────╮
│  State      No staged changes found.                               │
│  Next       Stage the intended files, then run /inspect again.     │
╰────────────────────────────────────────────────────────────────────╯
```

- the title identifies the command result;
- labels stay aligned across the read-only governance commands;
- long evidence wraps inside the panel instead of being silently truncated;
- semantic color highlights state but does not change the monochrome text contract;
- `Next` explains the useful follow-up without executing or authorizing it.

## Commands

| Command | Behavior |
|---|---|
| `/help` | Show the available shell commands and safety boundary. |
| `/work [mode] <objective>` | Create `.riscala/ACTIVE_WORK.md` once; default mode is `implement`, and an existing boundary is preserved. |
| `/status` | Refresh repository, branch, working-tree, and policy context. |
| `/audit` | Reuse the non-destructive audit engine and summarize governance adoption, artifacts, AI readiness, gaps, Git state, and the next recommendation. |
| `/check` | Check whether required artifacts exist without validating their internal structure. |
| `/validate` | Reuse the read-only validator and summarize its decision, passed/failed/warning counts, priority artifacts, and next action. |
| `/report` | Summarize compliance report readiness and point to the full markdown report command. |
| `/inspect` | Inspect staged Git changes and calculate their governance level. |
| `/classify <change description>` | Classify a described change and show required governance. |
| `/pr-checklist <change description>` | Build a PR checklist summary for a described change. |
| `/init-preview` | Preview what `riscala init` would create or keep without writing files. |
| `/hook-status` | Inspect whether the managed pre-commit hook is installed. |
| `/action` | Prepare a content-bound `git.commit` action record from staged changes. |
| `/approval` | Explain the external approval receipt boundary. |
| `/exit` | Close the session. `/quit` is also accepted. |

Commands do not accept arbitrary shell fragments. `/work`, `/impact`, `/review`, `/classify`, and `/pr-checklist` accept bounded free-text descriptions.

Human-facing audit copy describes current state rather than internal init operations: artifacts are `present`, `missing`, or `empty`; adoption modes are expanded into actions; AI surfaces and readiness are reported separately; and recommendations use the `riscala` executable name. When gaps exist, `Focus` names the first two and summarizes the remainder. Product-name normalization applies only to executable commands; stable artifacts such as `psdm.config.json` keep their compatibility names. The underlying JSON audit contract remains unchanged.

## Security Boundary

The shell is an allowlist router, not a general terminal or agent runtime.

The shell explicitly blocks `/commit`, `/push`, `/pr`, `/merge`, `/publish`, `/release`, `/deploy`, `/init`, `/hook-install`, and `/hook-remove`. `/work` may create only `.riscala/ACTIVE_WORK.md` and refuses to overwrite it. `/audit` and `/init-preview` remain read-only and never delegate to `riscala init`; `/validate`, `/check`, `/report`, `/inspect`, `/classify`, `/pr-checklist`, `/hook-status`, `/action`, and `/approval` only read local state or calculate bounded governance evidence. The action-record and receipt-verification core now exists for `git.commit`, but mutating commands remain blocked until a trusted owner key is enrolled and independent hooks enforce the receipt.

A confirmation phrase entered through an agent-controlled terminal is not sufficient human-presence evidence. The approval architecture remains defined in `docs/AGENT_DECISION_PROTOCOL.md`.

The shell reads local project metadata and invokes Git only through existing fixed-argument inspection helpers. Apart from the explicit one-time Active Work context file, it does not execute user-provided shell commands, modify files, change the Git index, or emit a new JSON automation contract.
