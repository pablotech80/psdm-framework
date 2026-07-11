import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { buildGitCommitActionRecord } from './action-record.mjs'
import {
  closeActiveWork,
  continueActiveWork,
  createActiveWork,
  detectLanguage,
  parseActiveWork,
  proposeActiveWorkTransition,
  readActiveWork,
  readLanguagePreference,
  setActiveWorkLanguage,
  setLanguagePreference,
  SUPPORTED_LANGUAGES,
  WORK_MODES,
} from './active-work.mjs'
import { buildAudit } from './audit.mjs'
import { classifyChange } from './classifier.mjs'
import { loadConfig } from './config.mjs'
import { inspectGit } from './git.mjs'
import { inspectPreCommitHook } from './git-hook.mjs'
import { inspectStagedChange } from './inspect.mjs'
import { buildJudgmentBrief } from './judgment.mjs'
import { buildDecisionReview } from './decision-review.mjs'
import { buildPrChecklist } from './pr-checklist.mjs'
import { terminalTheme } from './terminal-style.mjs'
import { validateMethod } from '../validator/validate-method.mjs'

const CARD_WIDTH = 68
const ROW_LABEL_WIDTH = 10

const SHELL_COPY = {
  en: {
    work: 'Work', next: 'Next', objective: 'Objective', allowed: 'Allowed', forbidden: 'Forbidden', proposed: 'Proposed',
    project: 'Project', branch: 'Branch', changes: 'Changes', files: 'Files', policy: 'Policy', refreshed: 'Refreshed',
    notSet: 'NOT SET', unknownMode: 'unknown mode', notRecorded: 'Not recorded',
    setup: '/work <objective>', clean: 'clean', untracked: 'untracked', staged: 'staged', unstaged: 'unstaged',
    moreChanged: (count) => `+${count} more changed file(s)`, defaultPolicy: 'defaults', powered: 'Powered by PSDM',
    workExists: 'Active Work already exists. The current boundary was preserved.',
    continued: 'The proposed transition was accepted and work is active.', closed: 'Active Work was closed.',
    transition: 'Transition proposed. Run /work continue to accept it.', noWork: 'No Active Work exists. Create one with /work <objective>.',
    languageUpdated: 'Language changed to English.', languageNeedsWork: 'Create Active Work with /work before persisting a language.',
    footer: 'sets the boundary', commands: 'commands',
  },
  es: {
    work: 'Trabajo', next: 'Siguiente', objective: 'Objetivo', allowed: 'Permitido', forbidden: 'Prohibido', proposed: 'Propuesto',
    project: 'Proyecto', branch: 'Rama', changes: 'Cambios', files: 'Archivos', policy: 'Política', refreshed: 'Actualizado',
    notSet: 'SIN DEFINIR', unknownMode: 'modo desconocido', notRecorded: 'No registrado',
    setup: '/work <objetivo>', clean: 'limpio', untracked: 'sin seguimiento', staged: 'preparado', unstaged: 'sin preparar',
    moreChanged: (count) => `+${count} archivo${count === 1 ? '' : 's'} modificado${count === 1 ? '' : 's'} más`, defaultPolicy: 'valores predeterminados', powered: 'Con tecnología PSDM',
    workExists: 'Ya existe un trabajo activo. Se ha conservado el límite actual.',
    continued: 'La transición propuesta fue aceptada y el trabajo está activo.', closed: 'El trabajo activo fue cerrado.',
    transition: 'Transición propuesta. Ejecuta /work continue para aceptarla.', noWork: 'No existe trabajo activo. Créalo con /work <objetivo>.',
    languageUpdated: 'Idioma cambiado a español.', languageNeedsWork: 'Crea el trabajo activo con /work antes de guardar un idioma.',
    footer: 'define el límite', commands: 'comandos',
  },
}

function shellCopy(language) {
  return SHELL_COPY[language] || SHELL_COPY.en
}

const BOUNDARY_TRANSLATIONS = [
  ['Work inside this repository when it directly serves the objective.', 'Trabajar dentro de este repositorio cuando sirva directamente al objetivo.'],
  ['Change another repository.', 'Cambiar otro repositorio.'],
  ['Work inside the active boundary or propose an explicit transition.', 'Trabajar dentro del límite activo o proponer una transición explícita.'],
  ['Create a new Active Work boundary before continuing.', 'Crear un nuevo límite de trabajo activo antes de continuar.'],
]

function localizeBoundary(value, language) {
  const pair = BOUNDARY_TRANSLATIONS.find((items) => items.includes(value))
  if (!pair) return value
  return language === 'es' ? pair[1] : pair[0]
}

function localizeWorkState(value, language) {
  if (language !== 'es') return value.toUpperCase()
  return {
    active: 'ACTIVO',
    closed: 'CERRADO',
    transition_proposed: 'TRANSICIÓN PROPUESTA',
  }[value] || value.toUpperCase()
}

function localizeWorkMode(value, language) {
  if (language !== 'es') return value
  return {
    inspect: 'inspección',
    experiment: 'experimento',
    design: 'diseño',
    implement: 'implementación',
    release: 'publicación',
  }[value] || value
}

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

  const copy = shellCopy(context.language)
  const countLabel = (count, label) => {
    if (context.language !== 'es' || label !== copy.staged) return `${count} ${label}`
    return `${count} ${count === 1 ? 'preparado' : 'preparados'}`
  }
  const parts = [
    context.changes.staged > 0 ? countLabel(context.changes.staged, copy.staged) : null,
    context.changes.unstaged > 0 ? countLabel(context.changes.unstaged, copy.unstaged) : null,
    context.changes.untracked > 0 ? countLabel(context.changes.untracked, copy.untracked) : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : copy.clean
}

function policyLabel(context) {
  const copy = shellCopy(context.language)
  const source = context.config.exists
    ? relative(context.target, context.config.path) || basename(context.config.path)
    : copy.defaultPolicy

  const profile = context.language === 'es' && context.config.profile.name === 'standard'
    ? 'estándar'
    : context.config.profile.name
  return `${profile} · ${source}`
}

function changedFileRows(context, options = {}) {
  if (!context.git.isRepository || context.git.changes.length === 0) return []

  const rows = context.git.changes.slice(0, 5).flatMap((line, index) => {
    const status = line.slice(0, 2).trim() || '??'
    const path = line.slice(3).trim()
    return cardRows(index === 0 ? shellCopy(context.language).files : '', `${status.padEnd(3)} ${path}`, options)
  })
  const hidden = context.git.changes.length - 5
  if (hidden > 0) rows.push(...cardRows('', shellCopy(context.language).moreChanged(hidden), options))
  return rows
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
  const copy = shellCopy(context.language)
  const changesStyle = !context.git.isRepository
    ? theme.red
    : context.git.isDirty
      ? theme.yellow
      : theme.green

  return [
    cardRow(copy.project, context.project, { ...options, valueStyle: theme.bold }),
    cardRow(copy.branch, context.git.branch || (context.git.isRepository ? 'detached HEAD' : 'n/a'), options),
    cardRow(copy.changes, changesLabel(context), { ...options, valueStyle: changesStyle }),
    ...changedFileRows(context, options),
    cardRow(copy.policy, policyLabel(context), options),
  ]
}

function featureArtifacts(target, config) {
  const featureRoot = join(target, config.features.root)
  if (!existsSync(featureRoot)) {
    return []
  }

  return readdirSync(featureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      config.features.requiredArtifacts.map((artifact) =>
        join(config.features.root, entry.name, artifact),
      ),
    )
}

function inspectArtifact(target, artifact) {
  const fullPath = join(target, artifact)

  if (!existsSync(fullPath)) {
    return { artifact, status: 'MISSING', message: 'Missing required artifact.' }
  }

  const stat = statSync(fullPath)
  if (stat.isFile() && stat.size === 0) {
    return { artifact, status: 'EMPTY', message: 'Artifact is empty.' }
  }

  return { artifact, status: 'OK', message: stat.isDirectory() ? 'Directory exists.' : 'Artifact exists.' }
}

function buildCheckReport({ target, configPath = null }) {
  const configState = loadConfig(target, configPath)
  const artifacts = [
    ...configState.config.requiredArtifacts,
    ...featureArtifacts(target, configState.config),
  ]
  const results = artifacts.map((artifact) => inspectArtifact(target, artifact))
  const failures = results.filter((item) => item.status !== 'OK').length

  return {
    target,
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
    status: failures === 0 ? 'complete' : 'incomplete',
    failures,
    git: inspectGit(target),
    results,
  }
}

export function buildShellContext({ target, configPath = null, language = detectLanguage(), env = process.env }) {
  const git = inspectGit(target)
  const configState = loadConfig(target, configPath)
  const activeWorkState = readActiveWork(target)

  return {
    target,
    language: readLanguagePreference(env)
      || (activeWorkState.exists ? parseActiveWork(activeWorkState.content)?.language : null)
      || language,
    project: projectName(target),
    git,
    changes: countChanges(git.changes),
    activeWork: {
      ...activeWorkState,
      work: parseActiveWork(activeWorkState.content),
    },
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
  }
}

function renderActiveWorkRows(context, options = {}) {
  const theme = terminalTheme(options.color)
  const work = context.activeWork.work
  const copy = shellCopy(context.language)

  if (!context.activeWork.exists || !work) {
    return [
      cardRow(copy.work, copy.notSet, { ...options, valueStyle: theme.yellow }),
      ...cardRows(copy.next, copy.setup, { ...options, valueStyle: theme.cyanLight }),
    ]
  }

  return [
    cardRow(copy.work, `${localizeWorkState(work.status || 'active', context.language)} · ${localizeWorkMode(work.mode, context.language) || copy.unknownMode}`, {
      ...options,
      valueStyle: theme.green,
    }),
    ...cardRows(copy.objective, work.objective || copy.notRecorded, options),
    ...(work.proposedObjective ? cardRows(copy.proposed, `${work.proposedMode} · ${work.proposedObjective}`, { ...options, valueStyle: theme.yellow }) : []),
    ...(work.allowed ? cardRows(copy.allowed, localizeBoundary(work.allowed, context.language), options) : []),
    ...(work.forbidden ? cardRows(copy.forbidden, localizeBoundary(work.forbidden, context.language), { ...options, valueStyle: theme.yellow }) : []),
    ...(work.nextAction ? cardRows(copy.next, localizeBoundary(work.nextAction, context.language), { ...options, valueStyle: theme.cyanLight }) : []),
  ]
}

export function renderShellStatus(context, options = {}) {
  const copy = shellCopy(context.language)
  return renderPanel(context.language === 'es' ? 'ESTADO' : 'STATUS', [
    ...renderActiveWorkRows(context, options),
    panelRule('middle', '', options),
    ...renderStatusRows(context, options),
    cardRow(copy.refreshed, `${new Date().toISOString().slice(11, 19)} UTC`, options),
  ], options)
}

export function renderShellBanner(context, options = {}) {
  const theme = terminalTheme(options.color)
  const copy = shellCopy(context.language)
  const title = '─ RISCALA '
  const top = `╭${title}${'─'.repeat(CARD_WIDTH - title.length)}╮`

  return [
    theme.cyan(top),
    ...renderActiveWorkRows(context, options),
    panelRule('middle', '', options),
    ...renderStatusRows(context, options),
    panelRule('bottom', '', options),
    `${theme.dim(copy.powered)} · ${theme.cyan('/work')} ${theme.dim(copy.footer)} · ${theme.cyan('/')} ${theme.dim(copy.commands)}`,
  ].join('\n')
}

export function renderShellPrompt(options = {}) {
  const theme = terminalTheme(options.color)
  return `${theme.cyan('riscala')} ${theme.cyanLight('❯')} `
}

export function renderShellHelp(options = {}) {
  const theme = terminalTheme(options.color)
  const spanish = options.language === 'es'
  const description = (english, spanishText) => spanish ? spanishText : english
  const rows = [
    cardRow('/action', description('Prepare a git.commit action record.', 'Preparar un registro para git.commit.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/approval', description('Show approval receipt boundary.', 'Mostrar el límite de aprobación.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/audit', description('Assess governance adoption and readiness.', 'Evaluar adopción y preparación.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/check', description('Check required artifacts exist.', 'Comprobar artefactos requeridos.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/classify', description('Classify a described change.', 'Clasificar un cambio descrito.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/exit', description('Close the Riscala shell.', 'Cerrar la consola de Riscala.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/help', spanish ? 'Mostrar esta referencia de comandos.' : 'Show this command reference.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/hook-status', description('Inspect managed pre-commit hook status.', 'Comprobar el hook pre-commit.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/impact', description('Think through a change before coding.', 'Evaluar un cambio antes de programar.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/init-preview', description('Preview governance files without writing.', 'Previsualizar archivos de gobierno.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/inspect', description('Inspect staged changes and governance level.', 'Inspeccionar cambios preparados.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/language', spanish ? 'Cambiar idioma: es o en.' : 'Change language: es or en.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/lenguaje', spanish ? 'Alias en español para cambiar el idioma.' : 'Spanish alias for changing language.', { ...options, valueStyle: theme.cyanLight }),
    cardRow('/pr-checklist', description('Build a PR checklist for a described change.', 'Preparar la lista de una PR.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/report', description('Summarize compliance report readiness.', 'Resumir el estado del informe.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/review', description('Compare intent with staged evidence.', 'Comparar objetivo y evidencia preparada.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/status', description('Refresh repository and policy context.', 'Actualizar repositorio y política.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/validate', description('Validate the governance baseline.', 'Validar la base de gobierno.'), { ...options, valueStyle: theme.cyanLight }),
    cardRow('/work', spanish ? 'Crear, cambiar, continuar o cerrar trabajo.' : 'Create, transition, continue, or close work.', { ...options, valueStyle: theme.cyanLight }),
    panelRule('middle', '', options),
    ...cardRows(spanish ? 'Autoridad' : 'Authority', spanish
      ? 'Riscala asesora. Tú decides la dirección, el alcance, las concesiones y si la evidencia es suficiente.'
      : 'Riscala advises. You decide direction, scope, trade-offs, and whether the evidence is sufficient.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
    ...cardRows(spanish ? 'Seguridad' : 'Safety', spanish
      ? 'El ciclo /work actualiza solo .riscala/ACTIVE_WORK.md. Riscala gobierna el trabajo; tu agente cambia el código.'
      : 'The /work lifecycle updates only .riscala/ACTIVE_WORK.md. Riscala governs work; your coding agent changes code.', {
      ...options,
      valueStyle: theme.yellow,
    }),
  ]

  return renderPanel(spanish ? 'COMANDOS' : 'COMMANDS', rows, options)
}

function renderJudgmentBrief(report, options = {}) {
  const theme = terminalTheme(options.color)
  const topImpacts = report.judgment.affectedSurfaces.slice(0, 3)
  const decisions = report.judgment.ownerDecisionsRequired.slice(0, 2)
  const rows = [
    ...cardRows('Intent', report.intent.statement, options),
    cardRow('Context', `${report.projectContext.mode} · ${report.projectContext.repository ? 'Git repository' : 'no Git repository'}`, options),
    panelRule('middle', '', options),
    ...cardRows('Decision', report.judgment.decision, { ...options, valueStyle: theme.cyanLight }),
    ...topImpacts.flatMap((item, index) => cardRows(index === 0 ? 'Impact' : '', `${item.surface}: ${item.statement}`, options)),
    ...decisions.flatMap((item, index) => cardRows(index === 0 ? 'You decide' : '', item, { ...options, valueStyle: theme.yellow })),
    panelRule('middle', '', options),
    ...cardRows('Next', 'Choose the direction and constraints, then implement with your preferred AI coding tool.', options),
  ]
  return renderPanel('IMPACT', rows, options)
}

function renderDecisionReview(report, options = {}) {
  const theme = terminalTheme(options.color)
  if (!report.verification) {
    const state = report.staged.decision === 'NO_STAGED_CHANGES'
      ? 'No staged changes found. Stage the intended files, then run /review again.'
      : 'The target is not a Git repository.'
    return renderPanel('REVIEW', cardRows('State', state, { ...options, valueStyle: theme.yellow }), options)
  }

  const deviations = report.verification.deviations.slice(0, 3)
  const rows = [
    ...cardRows('Intent', report.envelope.intent, options),
    cardRow('Staged', `${report.verification.stagedFiles.length} file(s)`, options),
    cardRow('Readiness', report.verification.readiness, {
      ...options,
      valueStyle: deviations.length > 0 ? theme.yellow : theme.cyanLight,
    }),
    ...deviations.flatMap((item, index) => cardRows(index === 0 ? 'Deviation' : '', item.statement, { ...options, valueStyle: theme.yellow })),
    panelRule('middle', '', options),
    ...cardRows('Evidence', 'Staged scope was observed; tests and owner authority remain unverified.', options),
    ...cardRows('Next', deviations.length > 0 ? 'Review the deviations and decide whether to revise scope or implementation.' : 'Run focused validation and decide whether the change is ready.', options),
  ]
  return renderPanel('REVIEW', rows, options)
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

function renderInitPreview(report, options = {}) {
  const theme = terminalTheme(options.color)
  const presentArtifacts = Math.max(0, report.summary.wouldSkip - report.summary.existingEmpty)
  const next = report.summary.wouldCreate === 0
    ? 'Nothing to create. Run /validate to verify the baseline.'
    : 'Run riscala init outside the shell when you are ready to write files.'
  const rows = [
    cardRow('Policy', report.config.profile.name, { ...options, valueStyle: theme.cyanLight }),
    cardRow('Create', `${report.summary.wouldCreate} artifact(s)`, {
      ...options,
      valueStyle: report.summary.wouldCreate > 0 ? theme.yellow : theme.green,
    }),
    cardRow('Keep', `${presentArtifacts} artifact(s)`, { ...options, valueStyle: theme.green }),
    cardRow('Empty', `${report.summary.existingEmpty} artifact(s)`, {
      ...options,
      valueStyle: report.summary.existingEmpty > 0 ? theme.yellow : theme.green,
    }),
    panelRule('middle', '', options),
    ...cardRows('Next', next, { ...options, valueStyle: theme.cyanLight }),
  ]

  return renderPanel('INIT PREVIEW', rows, options)
}

function renderCheck(report, options = {}) {
  const theme = terminalTheme(options.color)
  const ok = report.results.filter((item) => item.status === 'OK').length
  const missing = report.results.filter((item) => item.status === 'MISSING').length
  const empty = report.results.filter((item) => item.status === 'EMPTY').length
  const problemArtifacts = report.results.filter((item) => item.status !== 'OK')
  const focus = problemArtifacts.slice(0, 2).map((item) => item.artifact).join(' · ')
  const remainingFocus = Math.max(0, problemArtifacts.length - 2)
  const statusStyle = report.failures > 0 ? theme.yellow : theme.green
  const rows = [
    cardRow('Policy', report.config.profile.name, { ...options, valueStyle: theme.cyanLight }),
    cardRow('Status', report.status, { ...options, valueStyle: statusStyle }),
    cardRow('Artifacts', `${ok} ok · ${missing} missing · ${empty} empty`, {
      ...options,
      valueStyle: statusStyle,
    }),
    ...(problemArtifacts.length > 0 ? cardRows('Focus', `${focus}${remainingFocus > 0 ? ` · +${remainingFocus} more` : ''}`, {
      ...options,
      valueStyle: theme.yellow,
    }) : []),
    panelRule('middle', '', options),
    ...cardRows('Next', report.failures > 0
      ? 'Run /init-preview to see what Riscala would add.'
      : 'Artifacts exist. Run /validate for section-level checks.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('CHECK', rows, options)
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
    ...findings.slice(0, 2).flatMap((item, index) => cardRows(
      index === 0 ? (item.status === 'FAIL' ? 'Failure' : 'Warning') : '',
      `${item.artifact}: ${item.message}`,
      { ...options, valueStyle: item.status === 'FAIL' ? theme.red : theme.yellow },
    )),
    panelRule('middle', '', options),
    ...cardRows('Next', next, { ...options, valueStyle: theme.cyanLight }),
  ]

  return renderPanel('VALIDATE', rows, options)
}

function renderComplianceReport(report, options = {}) {
  const theme = terminalTheme(options.color)
  const failed = report.failures
  const warned = report.warnings
  const findings = report.results.filter((item) => item.status !== 'PASS')
  const topFindings = findings.slice(0, 2).map((item) => item.artifact).join(' · ')
  const remainingFindings = Math.max(0, findings.length - 2)
  const decisionStyle = failed > 0
    ? theme.red
    : warned > 0
      ? theme.yellow
      : theme.green
  const rows = [
    cardRow('Decision', report.decision.replaceAll('_', ' '), {
      ...options,
      valueStyle: decisionStyle,
    }),
    cardRow('Findings', `${failed} failure(s) · ${warned} warning(s)`, {
      ...options,
      valueStyle: decisionStyle,
    }),
    ...(findings.length > 0 ? cardRows('Focus', `${topFindings}${remainingFindings > 0 ? ` · +${remainingFindings} more` : ''}`, {
      ...options,
      valueStyle: decisionStyle,
    }) : []),
    panelRule('middle', '', options),
    ...cardRows('Next', 'Run riscala report outside the shell when you need the full markdown report.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('REPORT', rows, options)
}

function renderClassification(report, options = {}) {
  const theme = terminalTheme(options.color)
  const levelStyle = ['Level 3', 'Level 4'].includes(report.estimatedLevel)
    ? theme.yellow
    : theme.cyanLight
  const rows = [
    cardRow('Level', report.estimatedLevel, { ...options, valueStyle: levelStyle }),
    ...cardRows('Govern', report.minimumRequiredGovernance, options),
    ...(report.matchedKeywords.length > 0 ? cardRows('Signals', report.matchedKeywords.join(' · '), options) : []),
    ...(report.pathMatches.length > 0 ? cardRows('Risk', report.pathMatches.map((item) => `${item.file} -> ${item.minimumLevel}`).join(' · '), {
      ...options,
      valueStyle: theme.yellow,
    }) : []),
    panelRule('middle', '', options),
    ...cardRows('Reason', report.classificationReason, options),
  ]

  return renderPanel('CLASSIFY', rows, options)
}

function renderPrChecklistSummary(report, options = {}) {
  const theme = terminalTheme(options.color)
  const levelStyle = ['Level 3', 'Level 4'].includes(report.classification.estimatedLevel)
    ? theme.yellow
    : theme.cyanLight
  const artifacts = report.requiredArtifacts.length > 0
    ? report.requiredArtifacts.slice(0, 2).join(' · ')
    : 'none'
  const remainingArtifacts = Math.max(0, report.requiredArtifacts.length - 2)
  const rows = [
    cardRow('Level', report.classification.estimatedLevel, { ...options, valueStyle: levelStyle }),
    cardRow('Checks', `${report.checks.length} checklist item(s)`, options),
    ...cardRows('Artifacts', `${artifacts}${remainingArtifacts > 0 ? ` · +${remainingArtifacts} more` : ''}`, {
      ...options,
      valueStyle: report.requiredArtifacts.length > 0 ? theme.yellow : theme.green,
    }),
    panelRule('middle', '', options),
    ...cardRows('Next', 'Run riscala pr-checklist outside the shell to copy the full markdown checklist.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('PR CHECKLIST', rows, options)
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

function renderHookStatus(report, target, options = {}) {
  const theme = terminalTheme(options.color)
  const state = report.decision === 'NOT_A_GIT_REPOSITORY'
    ? 'not a Git repository'
    : report.installed
      ? (report.managed ? 'managed hook installed' : 'unmanaged hook present')
      : 'not installed'
  const stateStyle = report.decision === 'NOT_A_GIT_REPOSITORY'
    ? theme.red
    : report.installed && report.managed
      ? theme.green
      : theme.yellow
  const hookPath = report.path ? relative(target, report.path) || basename(report.path) : 'n/a'
  const rows = [
    cardRow('State', state, { ...options, valueStyle: stateStyle }),
    ...cardRows('Path', hookPath, options),
    panelRule('middle', '', options),
    ...cardRows('Next', report.installed && report.managed
      ? 'Pre-commit enforcement is locally active for managed commits.'
      : 'Use riscala hook install pre-commit outside the shell when approval enforcement is ready.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('HOOK STATUS', rows, options)
}

function renderActionRecord(record, options = {}) {
  const theme = terminalTheme(options.color)

  if (!record.binding) {
    return renderPanel('ACTION', [
      cardRow('Action', record.action, { ...options, valueStyle: theme.cyanLight }),
      cardRow('Decision', record.decision.replaceAll('_', ' '), { ...options, valueStyle: theme.yellow }),
      panelRule('middle', '', options),
      ...cardRows('Next', 'Stage the intended files, then run /action again.', {
        ...options,
        valueStyle: theme.cyanLight,
      }),
    ], options)
  }

  const decisionStyle = record.ready ? theme.green : theme.yellow
  const rows = [
    cardRow('Action', record.action, { ...options, valueStyle: theme.cyanLight }),
    cardRow('Decision', record.decision.replaceAll('_', ' '), {
      ...options,
      valueStyle: decisionStyle,
    }),
    cardRow('Level', record.classification.estimatedLevel, options),
    cardRow('Approval', record.approval.required ? 'required' : 'not required', {
      ...options,
      valueStyle: record.approval.required ? theme.yellow : theme.green,
    }),
    ...cardRows('ActionId', record.actionId, options),
    ...cardRows('Content', record.binding.contentHash, options),
    panelRule('middle', '', options),
    ...cardRows('Next', record.approval.required
      ? 'Send this content-bound action record to an independent approver.'
      : record.ready
        ? 'Review this content-bound action record before committing.'
        : 'Complete approval policy before committing high-risk changes.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ]

  return renderPanel('ACTION', rows, options)
}

function renderApprovalBoundary(policy, options = {}) {
  const theme = terminalTheme(options.color)
  const enabled = policy.requiredLevels.length > 0 || policy.requiredActions.length > 0
  if (!enabled) {
    return renderPanel('APPROVAL', [
      cardRow('Mode', 'signed approval disabled', { ...options, valueStyle: theme.green }),
      ...cardRows('Authority', 'Important actions still require an explicit developer instruction.', options),
      panelRule('middle', '', options),
      ...cardRows('Boundary', 'The shell manages Active Work but cannot invent approval or execute Git delivery actions.', {
        ...options,
        valueStyle: theme.cyanLight,
      }),
    ], options)
  }
  return renderPanel('APPROVAL', [
    cardRow('Mode', 'external receipt required', { ...options, valueStyle: theme.yellow }),
    ...cardRows('Verify', 'Use riscala approval verify git.commit --receipt <path> outside the shell.', options),
    ...cardRows('Enforce', 'The managed pre-commit hook enforces receipts before git commit.', options),
    panelRule('middle', '', options),
    ...cardRows('Boundary', 'The shell cannot create, type, or simulate human approval.', {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ], options)
}

function looksLikeFilePath(value, target) {
  return !value.includes(' ') && (
    existsSync(join(target, value)) || value.includes('/') || /\.[a-z0-9_-]+$/i.test(value)
  )
}

function renderReviewPathGuidance(path, options = {}) {
  const theme = terminalTheme(options.color)
  return renderPanel('REVIEW', [
    ...cardRows('Input', `${path} looks like a file path, not a change intention.`, {
      ...options,
      valueStyle: theme.yellow,
    }),
    panelRule('middle', '', options),
    ...cardRows('Try', '/review "describe what you intended to change"', options),
    ...cardRows('With file', `riscala review "describe the change" --staged --file ${path}`, {
      ...options,
      valueStyle: theme.cyanLight,
    }),
  ], options)
}

function renderUsage(command, usage, options = {}) {
  const theme = terminalTheme(options.color)
  return renderPanel('USAGE', [
    cardRow('Command', command, { ...options, valueStyle: theme.cyanLight }),
    ...cardRows('Usage', usage, options),
  ], options)
}

const MUTATING_COMMANDS = new Set([
  '/commit',
  '/deploy',
  '/hook-install',
  '/hook-remove',
  '/init',
  '/merge',
  '/pr',
  '/publish',
  '/push',
  '/release',
])

export function executeShellCommand(input, { target, configPath = null, color = false, language = detectLanguage(), env = process.env }) {
  const trimmed = input.trim()

  if (!trimmed) {
    return { output: '', exit: false }
  }

  const [rawCommand, ...parameters] = trimmed.split(/\s+/)
  const command = rawCommand === '/lenguaje' ? '/language' : rawCommand
  const description = parameters.join(' ').trim()
  const initialContext = buildShellContext({ target, configPath, language, env })
  const activeLanguage = initialContext.language
  const copy = shellCopy(activeLanguage)

  if (MUTATING_COMMANDS.has(command)) {
    return {
      output: `Blocked: ${command} is not available in the governance shell. Git delivery actions require their own enforced boundary.`,
      exit: false,
    }
  }

  if (!['/work', '/language', '/impact', '/review', '/classify', '/pr-checklist'].includes(command) && parameters.length > 0) {
    return {
      output: `Usage error: ${command} does not accept arguments in this shell.`,
      exit: false,
    }
  }

  if (command === '/help') {
    return { output: renderShellHelp({ color, language: activeLanguage }), exit: false }
  }

  if (command === '/language') {
    const requested = parameters[0]
    if (parameters.length !== 1 || !SUPPORTED_LANGUAGES.includes(requested)) {
      return { output: renderUsage('/language', '/language es|en', { color }), exit: false }
    }
    setActiveWorkLanguage(target, requested)
    setLanguagePreference(requested, env)
    const requestedCopy = shellCopy(requested)
    return {
      output: renderPanel(requested === 'es' ? 'IDIOMA' : 'LANGUAGE', cardRows(
        requested === 'es' ? 'Idioma' : 'Language',
        requestedCopy.languageUpdated,
        { color, valueStyle: terminalTheme(color).green },
      ), { color }),
      language: requested,
      exit: false,
    }
  }

  if (command === '/work') {
    const workTitle = activeLanguage === 'es' ? 'TRABAJO' : 'WORK'
    const operation = parameters[0]
    if (operation === 'close' && parameters.length === 1) {
      const result = closeActiveWork(target)
      const message = result.updated ? copy.closed : result.reason === 'ACTIVE_WORK_NOT_FOUND' ? copy.noWork : copy.closed
      return { output: renderPanel(workTitle, cardRows(activeLanguage === 'es' ? 'Estado' : 'State', message, { color }), { color }), exit: false }
    }
    if (operation === 'continue' && parameters.length === 1) {
      const result = continueActiveWork(target)
      const message = result.updated
        ? copy.continued
        : result.reason === 'ACTIVE_WORK_NOT_FOUND'
          ? copy.noWork
          : result.reason === 'ACTIVE_WORK_CLOSED'
            ? copy.closed
            : activeLanguage === 'es' ? 'El trabajo ya está activo.' : 'Work is already active.'
      return { output: renderPanel(workTitle, cardRows(activeLanguage === 'es' ? 'Estado' : 'State', message, { color }), { color }), exit: false }
    }
    if (operation === 'transition') {
      const requestedMode = parameters[1]
      const objective = parameters.slice(2).join(' ').trim()
      if (!WORK_MODES.includes(requestedMode) || !objective) {
        return { output: renderUsage('/work', '/work transition <mode> <objective>', { color }), exit: false }
      }
      const result = proposeActiveWorkTransition({ target, objective, mode: requestedMode })
      const message = result.updated ? copy.transition : result.reason === 'ACTIVE_WORK_NOT_FOUND' ? copy.noWork : copy.closed
      return { output: renderPanel(workTitle, cardRows(activeLanguage === 'es' ? 'Estado' : 'State', message, { color }), { color }), exit: false }
    }
    const requestedMode = WORK_MODES.includes(parameters[0]) ? parameters.shift() : 'implement'
    const objective = parameters.join(' ').trim()
    if (!objective) {
      return {
        output: renderUsage('/work', '/work [inspect|experiment|design|implement|release] <objective>', { color }),
        exit: false,
      }
    }

    const result = createActiveWork({ target, objective, mode: requestedMode, language: activeLanguage })
    const context = buildShellContext({ target, configPath, language: activeLanguage, env })
    const rows = result.created
      ? renderActiveWorkRows(context, { color })
      : [
          ...cardRows(activeLanguage === 'es' ? 'Estado' : 'State', copy.workExists, {
            color,
            valueStyle: terminalTheme(color).yellow,
          }),
          panelRule('middle', '', { color }),
          ...renderActiveWorkRows(context, { color }),
        ]
    return { output: renderPanel(workTitle, rows, { color }), exit: false }
  }

  if (command === '/impact') {
    if (!description) {
      return { output: renderUsage('/impact', '/impact <change intent>', { color }), exit: false }
    }
    return {
      output: renderJudgmentBrief(buildJudgmentBrief({ target, intent: description, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/review') {
    if (!description) {
      return { output: renderUsage('/review', '/review <change intent>', { color }), exit: false }
    }
    if (looksLikeFilePath(description, target)) {
      return { output: renderReviewPathGuidance(description, { color }), exit: false }
    }
    return {
      output: renderDecisionReview(buildDecisionReview({ target, intent: description, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/status') {
    return {
      output: renderShellStatus(initialContext, { color }),
      exit: false,
    }
  }

  if (command === '/audit') {
    return {
      output: renderAudit(buildAudit(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/check') {
    return {
      output: renderCheck(buildCheckReport({ target, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/validate') {
    return {
      output: renderValidation(validateMethod(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/report') {
    return {
      output: renderComplianceReport(validateMethod(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/inspect') {
    return {
      output: renderInspection(inspectStagedChange({ target, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/classify') {
    if (!description) {
      return {
        output: renderUsage('/classify', '/classify <change description>', { color }),
        exit: false,
      }
    }

    return {
      output: renderClassification(classifyChange({ description, target, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/pr-checklist') {
    if (!description) {
      return {
        output: renderUsage('/pr-checklist', '/pr-checklist <change description>', { color }),
        exit: false,
      }
    }

    return {
      output: renderPrChecklistSummary(buildPrChecklist({
        description,
        target,
        configPath,
      }), { color }),
      exit: false,
    }
  }

  if (command === '/init-preview') {
    return {
      output: renderInitPreview(buildAudit(target, { configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/hook-status') {
    return {
      output: renderHookStatus(inspectPreCommitHook(target), target, { color }),
      exit: false,
    }
  }

  if (command === '/action') {
    return {
      output: renderActionRecord(buildGitCommitActionRecord({ target, configPath }), { color }),
      exit: false,
    }
  }

  if (command === '/approval') {
    const policy = loadConfig(target, configPath).config.approval
    return {
      output: renderApprovalBoundary(policy, { color }),
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
