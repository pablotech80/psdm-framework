# Riscala Interactive Shell

Status: `Operational Active Work governance console`
Product: `Riscala`
Method: `PSDM`

## Purpose

Provide a dependency-free terminal interface that creates, restores, transitions, continues, and closes the current Active Work boundary before showing repository governance context. Riscala governs the work; the developer's preferred coding agent changes source code.

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
│   /language  Change the shell language between es and en.          │
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

- the main command list and each submenu are ordered alphabetically;
- typing filters commands by prefix;
- `↑` and `↓` cycle through filtered commands;
- `Enter` or `→` opens a highlighted command submenu;
- `↑` and `↓` also navigate submenu options;
- `←` or `Esc` returns from a submenu to the main menu;
- `Enter` selects a submenu option; incomplete commands are placed in the prompt for the required text;
- `Tab` completes the highlighted command without executing it;
- `Esc` closes the main palette and clears the current input;
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
| `/work transition <mode> <objective>` | Record a proposed boundary without applying it. |
| `/work continue` | Explicitly accept a pending transition and activate its boundary. |
| `/work close` | Close the current work and require a new boundary before continuing. |
| `/language es|en` | Persist Spanish or English presentation in the existing Active Work file. |
| `/lenguaje es|en` | Spanish alias for `/language`; both expose an arrow-navigable `en`/`es` submenu. |
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

## Language

The initial shell language is Spanish when `LC_ALL`, `LC_MESSAGES`, or `LANG` begins with `es`; all other locales fall back to English. Active Work persists the selected `es` or `en` value so later shell sessions restore it. `/language` and `/lenguaje` open a navigable language submenu and change presentation only: Markdown field names and JSON keys remain in English, and the repository boundary keeps the same meaning. Spanish status copy applies grammatical number and translates default-policy and hidden-file summaries.

Human-facing audit copy describes current state rather than internal init operations: artifacts are `present`, `missing`, or `empty`; adoption modes are expanded into actions; AI surfaces and readiness are reported separately; and recommendations use the `riscala` executable name. When gaps exist, `Focus` names the first two and summarizes the remainder. Product-name normalization applies only to executable commands; stable artifacts such as `psdm.config.json` keep their compatibility names. The underlying JSON audit contract remains unchanged.

## Security Boundary

The shell is an allowlist router, not a general terminal or agent runtime.

The shell explicitly blocks `/commit`, `/push`, `/pr`, `/merge`, `/publish`, `/release`, `/deploy`, `/init`, `/hook-install`, and `/hook-remove`. The `/work` lifecycle may update only `.riscala/ACTIVE_WORK.md`, preserves transition history, and never silently replaces a boundary. `/audit` and `/init-preview` remain non-destructive and never delegate to `riscala init`; `/validate`, `/check`, `/report`, `/inspect`, `/classify`, `/pr-checklist`, `/hook-status`, `/action`, and `/approval` only read local state or calculate bounded governance evidence. Git delivery stays separate until its own enforced boundary is implemented.

A confirmation phrase entered through an agent-controlled terminal is not sufficient human-presence evidence. The approval architecture remains defined in `docs/AGENT_DECISION_PROTOCOL.md`.

The shell reads local project metadata and invokes Git only through existing fixed-argument inspection helpers. Apart from the explicit Active Work lifecycle, it does not execute user-provided shell commands, modify source files, change the Git index, or emit a new JSON automation contract.
