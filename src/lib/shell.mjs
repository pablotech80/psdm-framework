import { existsSync, readFileSync } from 'node:fs'
import { basename, relative } from 'node:path'
import { buildAudit } from './audit.mjs'
import { loadConfig } from './config.mjs'
import { inspectGit } from './git.mjs'
import { inspectStagedChange } from './inspect.mjs'
import { terminalTheme } from './terminal-style.mjs'
import { validateMethod } from '../validator/validate-method.mjs'

const CARD_WIDTH = 68
const ROW_LABEL_WIDTH = 10

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

function cardRow(label, value, options = {}) {
  const theme = terminalTheme(options.color)
  const prefix = `  ${label.padEnd(ROW_LABEL_WIDTH)} `
  const available = CARD_WIDTH - prefix.length
  const contentWidth = available - 1
  const rendered = value.length > contentWidth
    ? `${value.slice(0, Math.max(0, contentWidth - 1))}…`
    : value
  const paddedValue = rendered.padEnd(available)
  const valueStyle = options.valueStyle || ((item) => item)

  return `${theme.cyan('│')}${theme.dim(prefix)}${valueStyle(paddedValue)}${theme.cyan('│')}`
}

function wrapText(value, width) {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (let word of words) {
    if (current && current.length + word.length + 1 <= width) {
      current = `${current} ${word}`
      continue
    }

    if (current) {
      lines.push(current)
      current = ''
    }

    while (word.length > width) {
      lines.push(word.slice(0, width))
      word = word.slice(width)
    }

    current = word
  }

  if (current || lines.length === 0) {
    lines.push(current)
  }

  return lines
}

function cardRows(label, value, options = {}) {
  const available = CARD_WIDTH - `  ${''.padEnd(ROW_LABEL_WIDTH)} `.length - 1

  return wrapText(value, available).map((line, index) => cardRow(
    index === 0 ? label : '',
    line,
    options,
  ))
}

function panelRule(kind, title, options = {}) {
  const theme = terminalTheme(options.color)

  if (kind === 'top') {
    const segment = `─ ${title} `
    return theme.cyan(`╭${segment}${'─'.repeat(CARD_WIDTH - segment.length)}╮`)
  }

  if (kind === 'middle') {
    return theme.cyan(`├${'─'.repeat(CARD_WIDTH)}┤`)
  }

  return theme.cyan(`╰${'─'.repeat(CARD_WIDTH)}╯`)
}

function renderPanel(title, rows, options = {}) {
  return [
    panelRule('top', title, options),
    ...rows,
    panelRule('bottom', title, options),
  ].join('\n')
}

function renderStatusRows(context, options = {}) {
  const theme = terminalTheme(options.color)
  const changesStyle = !context.git.isRepository
    ? theme.red
    : context.git.isDirty
      ? theme.yellow
      : theme.green

  return [
    cardRow('Project', context.project, { ...options, valueStyle: theme.bold }),
    cardRow('Branch', context.git.branch || (context.git.isRepository ? 'detached HEAD' : 'n/a'), options),
    cardRow('Changes', changesLabel(context), { ...options, valueStyle: changesStyle }),
    cardRow('Policy', policyLabel(context), options),
  ]
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

export function renderShellStatus(context, options = {}) {
  return renderPanel('STATUS', renderStatusRows(context, options), options)
}

export function renderShellBanner(context, options = {}) {
  const theme = terminalTheme(options.color)
  const title = '─ RISCALA '
  const top = `╭${title}${'─'.repeat(CARD_WIDTH - title.length)}╮`

  return [
    theme.cyan(top),
    cardRow('Mode', 'READ ONLY · governance shell', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
    panelRule('middle', '', options),
    ...renderStatusRows(context, options),
    panelRule('bottom', '', options),
    `${theme.dim('Powered by PSDM')} · ${theme.dim('Type')} ${theme.cyan('/')} ${theme.dim('for commands')} · ${theme.cyan('/inspect')} ${theme.dim('staged')} · ${theme.cyan('/exit')} ${theme.dim('close')}`,
  ].join('\n')
}

export function renderShellPrompt(options = {}) {
  const theme = terminalTheme(options.color)
  return `${theme.cyan('riscala')} ${theme.cyanLight('❯')} `
}

export function renderShellHelp(options = {}) {
  const theme = terminalTheme(options.color)
  const rows = [
    cardRow('/help', 'Show this command reference.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/status', 'Refresh repository and policy context.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/audit', 'Assess governance adoption and readiness.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/validate', 'Validate the governance baseline.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/inspect', 'Inspect staged changes and governance level.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/exit', 'Close the Riscala shell.', { ...options, valueStyle: theme.cyanLight }),
    panelRule('middle', '', options),
    ...cardRows('Safety', 'Read only. Mutating commands remain blocked until independent approval enforcement is configured.', {
      ...options,
      valueStyle: theme.yellow,
    }),
  ]

  return renderPanel('COMMANDS', rows, options)
}

function renderAudit(report, options = {}) {
  const theme = terminalTheme(options.color)
  const presentArtifacts = Math.max(0, report.summary.wouldSkip - report.summary.existingEmpty)
  const artifactStyle = report.summary.wouldCreate > 0 ? theme.yellow : theme.green
  const changeCounts = countChanges(report.git.changes)
  const totalChanges = changeCounts.staged + changeCounts.unstaged + changeCounts.untracked
  const gitState = !report.git.isRepository
    ? 'not a Git repository'
    : totalChanges === 0
      ? 'clean'
      : totalChanges === 1 && changeCounts.untracked === 1
        ? '1 untracked change'
        : totalChanges === 1 && changeCounts.staged === 1
          ? '1 staged change'
          : totalChanges === 1
            ? '1 unstaged change'
            : changesLabel({ git: report.git, changes: changeCounts })
  const gitStyle = !report.git.isRepository
    ? theme.red
    : report.git.isDirty
      ? theme.yellow
      : theme.green
  const readiness = {
    gaps_detected: 'Gaps detected',
    not_detected: 'Not detected',
    ready_for_review: 'Ready for review',
  }[report.aiReadiness.status] || report.aiReadiness.status.replaceAll('_', ' ')
  const adoption = report.aiGovernance.adoptionMode === 'integrate'
    ? 'Integrate existing governance'
    : 'Initialize governance baseline'
  const readinessStyle = report.aiReadiness.status === 'gaps_detected'
    ? theme.yellow
    : report.aiReadiness.status === 'ready_for_review'
      ? theme.green
      : theme.dim
  const surfaceCount = report.aiReadiness.detectedSurfaceCount
  const gapCount = report.aiReadiness.gaps.length
  const gapFocus = report.aiReadiness.gaps
    .slice(0, 2)
    .map((gap) => gap.key.replaceAll('-', ' '))
    .join(' · ')
  const remainingGaps = Math.max(0, gapCount - 2)
  const recommendation = report.summary.wouldCreate === 0
    ? 'Run riscala validate to verify the governance baseline.'
    : (report.recommendations[0] || 'Review the audit evidence.')
      .replace(/\bpsdm (?=(?:init|validate)\b)/g, 'riscala ')
  const rows = [
    cardRow('Policy', report.config.profile.name, { ...options, valueStyle: theme.cyanLight }),
    cardRow('Artifacts', `${presentArtifacts} present · ${report.summary.wouldCreate} missing · ${report.summary.existingEmpty} empty`, {
      ...options,
      valueStyle: artifactStyle,
    }),
    cardRow('Adoption', adoption, options),
    cardRow('AI', `${surfaceCount} ${surfaceCount === 1 ? 'surface' : 'surfaces'} · ${readiness}`, {
      ...options,
      valueStyle: readinessStyle,
    }),
    cardRow('Gaps', `${gapCount} governance ${gapCount === 1 ? 'gap' : 'gaps'}`, {
      ...options,
      valueStyle: gapCount > 0 ? theme.yellow : theme.green,
    }),
    ...(gapCount > 0 ? cardRows('Focus', `${gapFocus}${remainingGaps > 0 ? ` · +${remainingGaps} more` : ''}`, {
      ...options,
      valueStyle: theme.yellow,
    }) : []),
    cardRow('Git', gitState, { ...options, valueStyle: gitStyle }),
    panelRule('middle', '', options),
    ...cardRows('Next', recommendation, {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('AUDIT', rows, options)
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}

function renderValidation(report, options = {}) {
  const theme = terminalTheme(options.color)
  const passed = report.results.filter((item) => item.status === 'PASS').length
  const failed = report.failures
  const warned = report.warnings
  const findings = report.results.filter((item) => item.status !== 'PASS')
  const focusArtifacts = Array.from(new Set(findings.map((item) => item.artifact)))
  const focus = focusArtifacts.slice(0, 2).join(' · ')
  const remainingFocus = Math.max(0, focusArtifacts.length - 2)
  const decision = {
    METHOD_BASELINE_APPROVED: 'Baseline approved',
    METHOD_BASELINE_REVIEW_REQUIRED: 'Review required',
    NEEDS_CORRECTION: 'Needs correction',
  }[report.decision] || report.decision.replaceAll('_', ' ')
  const decisionStyle = failed > 0
    ? theme.red
    : warned > 0
      ? theme.yellow
      : theme.green
  const next = failed > 0
    ? 'Fix the failing governance checks, then run /validate again.'
    : warned > 0
      ? 'Review warnings before accepting the governance baseline.'
      : 'Governance baseline validated. Run /inspect before delivery.'
  const rows = [
    cardRow('Policy', report.config.profile.name, { ...options, valueStyle: theme.cyanLight }),
    cardRow('Decision', decision, { ...options, valueStyle: decisionStyle }),
    cardRow('Checks', `${countLabel(passed, 'passed', 'passed')} · ${countLabel(failed, 'failed', 'failed')} · ${countLabel(warned, 'warning', 'warnings')}`, {
      ...options,
      valueStyle: decisionStyle,
    }),
    ...(focusArtifacts.length > 0 ? cardRows('Focus', `${focus}${remainingFocus > 0 ? ` · +${remainingFocus} more` : ''}`, {
      ...options,
      valueStyle: decisionStyle,
    }) : []),
    panelRule('middle', '', options),
    ...cardRows('Next', next, { ...options, valueStyle: theme.cyanLight }),
  ]

  return renderPanel('VALIDATE', rows, options)
}

function renderInspection(report, options = {}) {
  const theme = terminalTheme(options.color)

  if (report.decision === 'NOT_A_GIT_REPOSITORY') {
    return renderPanel('INSPECT', [
      ...cardRows('State', 'Cannot inspect staged changes.', { ...options, valueStyle: theme.red }),
      ...cardRows('Target', `${report.target} is not a Git repository.`, options),
      ...cardRows('Next', 'Run Riscala from a Git repository or select another target.', { ...options, valueStyle: theme.cyanLight }),
    ], options)
  }

  if (report.decision === 'NO_STAGED_CHANGES') {
    return renderPanel('INSPECT', [
      ...cardRows('State', 'No staged changes found.', { ...options, valueStyle: theme.green }),
      ...cardRows('Next', 'Stage the intended files, then run /inspect again.', { ...options, valueStyle: theme.cyanLight }),
    ], options)
  }

  const levelStyle = ['Level 3', 'Level 4'].includes(report.classification.estimatedLevel)
    ? theme.yellow
    : theme.cyanLight
  const rows = cardRows(
    'Summary',
    `Staged inspection · ${report.files.length} file(s) · ${report.classification.estimatedLevel}`,
    { ...options, valueStyle: levelStyle },
  )

  report.git.changes.forEach((change, index) => {
    const path = change.previousPath
      ? `${change.previousPath} -> ${change.path}`
      : change.path
    rows.push(...cardRows(index === 0 ? 'Files' : '', `${change.status.padEnd(3)} ${path}`, options))
  })

  rows.push(...cardRows('Reason', report.classification.classificationReason, options))

  for (const match of report.classification.pathMatches) {
    rows.push(...cardRows('Risk', `${match.file} matches ${match.pattern} -> ${match.minimumLevel}`, {
      ...options,
      valueStyle: theme.yellow,
    }))
  }

  rows.push(...cardRows('Next', 'Review this evidence before choosing the next governed action.', {
    ...options,
    valueStyle: theme.cyanLight,
  }))

  return renderPanel('INSPECT', rows, options)
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

export function executeShellCommand(input, { target, configPath = null, color = false }) {
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
    return { output: renderShellHelp({ color }), exit: false }
  }

  if (command === '/status') {
    return {
      output: renderShellStatus(buildShellContext({ target, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/audit') {
    return {
      output: renderAudit(buildAudit(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/validate') {
    return {
      output: renderValidation(validateMethod(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/inspect') {
    return {
      output: renderInspection(inspectStagedChange({ target, configPath }), { color }),
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
