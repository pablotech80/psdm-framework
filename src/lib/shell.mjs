import { existsSync, readFileSync } from 'node:fs'
import { basename, relative } from 'node:path'
import { loadConfig } from './config.mjs'
import { inspectGit } from './git.mjs'
import { inspectStagedChange } from './inspect.mjs'

const CARD_WIDTH = 68

function projectName(target) {
  const manifestPath = `${target}/package.json`

  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      if (typeof manifest.name === 'string' && manifest.name.trim()) {
        return manifest.name.trim()
      }
    } catch {
      // A malformed project manifest must not prevent read-only repository inspection.
    }
  }

  return basename(target)
}

function countChanges(changes) {
  const counts = {
    staged: 0,
    unstaged: 0,
    untracked: 0,
  }

  for (const change of changes) {
    const indexStatus = change[0] || ' '
    const worktreeStatus = change[1] || ' '

    if (indexStatus === '?' && worktreeStatus === '?') {
      counts.untracked += 1
      continue
    }

    if (indexStatus !== ' ') {
      counts.staged += 1
    }

    if (worktreeStatus !== ' ') {
      counts.unstaged += 1
    }
  }

  return counts
}

function changesLabel(context) {
  if (!context.git.isRepository) {
    return 'not a Git repository'
  }

  const parts = [
    context.changes.staged > 0 ? `${context.changes.staged} staged` : null,
    context.changes.unstaged > 0 ? `${context.changes.unstaged} unstaged` : null,
    context.changes.untracked > 0 ? `${context.changes.untracked} untracked` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : 'clean'
}

function policyLabel(context) {
  const source = context.config.exists
    ? relative(context.target, context.config.path) || basename(context.config.path)
    : 'defaults'

  return `${context.config.profile.name} · ${source}`
}

function cardRow(label, value) {
  const prefix = `  ${label.padEnd(10)} `
  const available = CARD_WIDTH - prefix.length
  const rendered = value.length > available
    ? `${value.slice(0, Math.max(0, available - 1))}…`
    : value

  return `│${prefix}${rendered.padEnd(available)}│`
}

export function buildShellContext({ target, configPath = null }) {
  const git = inspectGit(target)
  const configState = loadConfig(target, configPath)

  return {
    target,
    project: projectName(target),
    git,
    changes: countChanges(git.changes),
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
  }
}

export function renderShellStatus(context) {
  return [
    cardRow('Project', context.project),
    cardRow('Branch', context.git.branch || (context.git.isRepository ? 'detached HEAD' : 'n/a')),
    cardRow('Changes', changesLabel(context)),
    cardRow('Policy', policyLabel(context)),
  ].join('\n')
}

export function renderShellBanner(context) {
  const title = '─ RISCALA '
  const top = `╭${title}${'─'.repeat(CARD_WIDTH - title.length)}╮`

  return [
    top,
    cardRow('Mode', 'Read-only governance shell'),
    '├────────────────────────────────────────────────────────────────────┤',
    renderShellStatus(context),
    '╰────────────────────────────────────────────────────────────────────╯',
    'Powered by PSDM · Type /help to see available commands.',
  ].join('\n')
}

export function renderShellHelp() {
  return `Read-only commands:
  /help      Show this command reference.
  /status    Refresh repository, branch, changes, and policy context.
  /inspect   Inspect staged changes and their governance level.
  /exit      Close the Riscala shell.

Mutating commands such as /commit, /push, /pr, /publish, and /deploy are blocked
until content-bound approval receipt verification is implemented.`
}

function renderInspection(report) {
  if (report.decision === 'NOT_A_GIT_REPOSITORY') {
    return `Cannot inspect staged changes: ${report.target} is not a Git repository.`
  }

  if (report.decision === 'NO_STAGED_CHANGES') {
    return 'No staged changes found.'
  }

  const lines = [
    `Staged inspection · ${report.files.length} file(s) · ${report.classification.estimatedLevel}`,
  ]

  for (const change of report.git.changes) {
    const path = change.previousPath
      ? `${change.previousPath} -> ${change.path}`
      : change.path
    lines.push(`  ${change.status.padEnd(3)} ${path}`)
  }

  lines.push(`Reason: ${report.classification.classificationReason}`)

  for (const match of report.classification.pathMatches) {
    lines.push(`Risk: ${match.file} matches ${match.pattern} -> ${match.minimumLevel}`)
  }

  return lines.join('\n')
}

const MUTATING_COMMANDS = new Set([
  '/commit',
  '/deploy',
  '/merge',
  '/pr',
  '/publish',
  '/push',
  '/release',
])

export function executeShellCommand(input, { target, configPath = null }) {
  const trimmed = input.trim()

  if (!trimmed) {
    return { output: '', exit: false }
  }

  const [command, ...parameters] = trimmed.split(/\s+/)

  if (MUTATING_COMMANDS.has(command)) {
    return {
      output: `Blocked: ${command} is not available in the read-only shell. A mutating command requires content-bound approval enforcement.`,
      exit: false,
    }
  }

  if (parameters.length > 0) {
    return {
      output: `Usage error: ${command} does not accept arguments in this shell.`,
      exit: false,
    }
  }

  if (command === '/help') {
    return { output: renderShellHelp(), exit: false }
  }

  if (command === '/status') {
    return {
      output: renderShellStatus(buildShellContext({ target, configPath })),
      exit: false,
    }
  }

  if (command === '/inspect') {
    return {
      output: renderInspection(inspectStagedChange({ target, configPath })),
      exit: false,
    }
  }

  if (command === '/exit' || command === '/quit') {
    return { output: 'Riscala shell closed.', exit: true }
  }

  if (!command.startsWith('/')) {
    return {
      output: 'Commands must start with /. Type /help to see available commands.',
      exit: false,
    }
  }

  return {
    output: `Unknown command: ${command}. Type /help to see available commands.`,
    exit: false,
  }
}
