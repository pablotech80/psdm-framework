import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'

export const WORK_MODES = ['inspect', 'experiment', 'design', 'implement', 'release']
export const SUPPORTED_LANGUAGES = ['en', 'es']

export function languagePreferencePath(env = process.env) {
  const root = env.RISCALA_CONFIG_HOME
    || join(env.XDG_CONFIG_HOME || join(env.HOME || homedir(), '.config'), 'riscala')
  return join(root, 'settings.json')
}

export function readLanguagePreference(env = process.env) {
  try {
    const value = JSON.parse(readFileSync(languagePreferencePath(env), 'utf8'))
    return SUPPORTED_LANGUAGES.includes(value.language) ? value.language : null
  } catch {
    return null
  }
}

export function setLanguagePreference(language, env = process.env) {
  const path = languagePreferencePath(env)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify({ language }, null, 2)}\n`)
  return { path, language }
}

export function detectLanguage(env = process.env) {
  const preference = readLanguagePreference(env)
  if (preference) return preference
  const locale = [env.LC_ALL, env.LC_MESSAGES, env.LANG]
    .find((value) => typeof value === 'string' && value.trim()) || ''
  return locale.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function activeWorkPath(target) {
  return join(resolve(target), '.riscala', 'ACTIVE_WORK.md')
}

function renderActiveWork({ target, objective, mode, language, allowedPaths = [] }) {
  const spanish = language === 'es'
  return `# Active Work

Status: \`active\`
Language: \`${language}\`

## Boundary

- Repository: \`${resolve(target)}\`
- Objective: ${objective}
- Mode: \`${mode}\`

## Allowed Paths

${allowedPaths.length ? allowedPaths.map((path) => `- \`${path}\``).join('\n') : `- ${spanish ? 'No declaradas; se permite todo el repositorio.' : 'Not declared; the whole repository is allowed.'}`}

## Allowed

- ${spanish ? 'Trabajar dentro de este repositorio cuando sirva directamente al objetivo.' : 'Work inside this repository when it directly serves the objective.'}

## Forbidden

- ${spanish ? 'Cambiar otro repositorio.' : 'Change another repository.'}
- ${spanish ? 'Ampliar el objetivo o el modo sin una transición explícita.' : 'Expand the objective or mode without an explicit transition.'}

## Must Preserve

- ${spanish ? 'Cambios existentes del usuario que no estén relacionados.' : 'Existing unrelated user changes.'}
- ${spanish ? 'Secretos, credenciales, datos privados y valores de producción.' : 'Secrets, credentials, private data, and production values.'}

## Stop Conditions

- ${spanish ? 'Cambia el repositorio, el objetivo o el modo.' : 'Repository, objective, or mode changes.'}
- ${spanish ? 'La acción solicitada entra en conflicto con Allowed, Forbidden o Must Preserve.' : 'The requested action conflicts with Allowed, Forbidden, or Must Preserve.'}
- ${spanish ? 'Falta una decisión material o la autoridad requerida.' : 'A material decision or required authority is missing.'}

## Context

### Human Decisions

- ${spanish ? 'El repositorio, el objetivo y el modo anteriores definen el límite activo.' : 'The repository, objective, and mode above define the active boundary.'}

### Observed Facts

- Project: \`${basename(resolve(target))}\`.

### Examples

- None recorded.

### Suggestions

- None recorded.

### Open Questions

- None recorded.

## Next Permitted Action

${spanish ? 'Trabajar dentro del límite activo o proponer una transición explícita.' : 'Work inside the active boundary or propose an explicit transition.'}
`
}

export function createActiveWork({ target, objective, mode, language = 'en', allowedPaths = [] }) {
  const path = activeWorkPath(target)
  if (existsSync(path)) {
    const current = parseActiveWork(readFileSync(path, 'utf8'))
    if (current?.status !== 'closed') return { created: false, path, reason: 'ACTIVE_WORK_EXISTS' }
    const history = join(resolve(target), '.riscala', 'history')
    const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
    const archivedPath = join(history, `ACTIVE_WORK-${stamp}.md`)
    mkdirSync(history, { recursive: true })
    renameSync(path, archivedPath)
    writeFileSync(path, renderActiveWork({ target, objective, mode, language, allowedPaths }))
    return { created: true, path, archivedPath, reason: 'ACTIVE_WORK_RESTARTED' }
  }
  mkdirSync(join(resolve(target), '.riscala'), { recursive: true })
  writeFileSync(path, renderActiveWork({ target, objective, mode, language, allowedPaths }))
  return { created: true, path, reason: 'ACTIVE_WORK_CREATED' }
}

export function setActiveWorkLanguage(target, language) {
  const state = readActiveWork(target)
  if (!state.exists) return { updated: false, ...state }

  const next = /^Language: `(?:en|es)`$/m.test(state.content)
    ? state.content.replace(/^Language: `(?:en|es)`$/m, `Language: \`${language}\``)
    : state.content.replace(/^Status: `[^`]+`$/m, (status) => `${status}\nLanguage: \`${language}\``)
  writeFileSync(state.path, next)
  return { updated: true, path: state.path, language }
}

function writeActiveWork(path, content) {
  writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`)
}

function historyEntry(action, details = []) {
  return `\n## Lifecycle History\n\n- ${new Date().toISOString()} · ${action}${details.length ? ` · ${details.join(' · ')}` : ''}\n`
}

export function closeActiveWork(target) {
  const state = readActiveWork(target)
  if (!state.exists) return { updated: false, reason: 'ACTIVE_WORK_NOT_FOUND', path: state.path }
  const work = parseActiveWork(state.content)
  if (work?.status === 'closed') return { updated: false, reason: 'ACTIVE_WORK_ALREADY_CLOSED', path: state.path }
  const content = state.content
    .replace(/^Status: `[^`]+`$/m, 'Status: `closed`')
    .replace(/## Next Permitted Action\n\n[^\n]+/, '## Next Permitted Action\n\nCreate a new Active Work boundary before continuing.')
  writeActiveWork(state.path, `${content.trimEnd()}${historyEntry('closed', [`objective=${work?.objective || 'unknown'}`])}`)
  return { updated: true, reason: 'ACTIVE_WORK_CLOSED', path: state.path }
}

export function proposeActiveWorkTransition({ target, objective, mode, allowedPaths = null }) {
  const state = readActiveWork(target)
  if (!state.exists) return { updated: false, reason: 'ACTIVE_WORK_NOT_FOUND', path: state.path }
  const work = parseActiveWork(state.content)
  if (work?.status === 'closed') return { updated: false, reason: 'ACTIVE_WORK_CLOSED', path: state.path }
  const withoutProposal = state.content.replace(/\n## Proposed Transition\n[\s\S]*?(?=\n## Lifecycle History|$)/, '')
  const proposedPaths = allowedPaths === null ? work.allowedPaths : allowedPaths
  const proposal = `\n## Proposed Transition\n\n- Objective: ${objective}\n- Mode: \`${mode}\`\n- Allowed Paths: ${proposedPaths.length ? proposedPaths.map((path) => `\`${path}\``).join(', ') : 'all'}\n- Decision: \`pending\`\n`
  const content = withoutProposal.replace(/^Status: `[^`]+`$/m, 'Status: `transition_proposed`')
  writeActiveWork(state.path, `${content.trimEnd()}${proposal}${historyEntry('transition_proposed', [`from=${work?.mode || 'unknown'}`, `to=${mode}`])}`)
  return { updated: true, reason: 'ACTIVE_WORK_TRANSITION_PROPOSED', path: state.path }
}

export function continueActiveWork(target) {
  const state = readActiveWork(target)
  if (!state.exists) return { updated: false, reason: 'ACTIVE_WORK_NOT_FOUND', path: state.path }
  const work = parseActiveWork(state.content)
  if (work?.status === 'closed') return { updated: false, reason: 'ACTIVE_WORK_CLOSED', path: state.path }
  if (work?.status !== 'transition_proposed') {
    return { updated: false, reason: 'ACTIVE_WORK_ALREADY_ACTIVE', path: state.path }
  }
  const proposal = state.content.match(/## Proposed Transition\n\n- Objective: ([^\n]+)\n- Mode: `([^`]+)`(?:\n- Allowed Paths: ([^\n]+))?/)
  if (!proposal) return { updated: false, reason: 'ACTIVE_WORK_TRANSITION_INVALID', path: state.path }
  const [, objective, mode, pathList] = proposal
  const allowedPaths = !pathList ? work.allowedPaths : pathList === 'all' ? [] : [...pathList.matchAll(/`([^`]+)`/g)].map((match) => match[1])
  const content = state.content
    .replace(/^Status: `[^`]+`$/m, 'Status: `active`')
    .replace(/^- Objective: [^\n]+$/m, `- Objective: ${objective}`)
    .replace(/^- Mode: `[^`]+`$/m, `- Mode: \`${mode}\``)
    .replace(/## Allowed Paths\n\n(?:- [^\n]+\n?)+/, `## Allowed Paths\n\n${allowedPaths.length ? allowedPaths.map((path) => `- \`${path}\``).join('\n') : '- Not declared; the whole repository is allowed.'}\n`)
    .replace(/\n## Proposed Transition\n[\s\S]*?(?=\n## Lifecycle History|$)/, '')
  writeActiveWork(state.path, `${content.trimEnd()}${historyEntry('transition_accepted', [`from=${work.mode}`, `to=${mode}`])}`)
  return { updated: true, reason: 'ACTIVE_WORK_TRANSITION_ACCEPTED', path: state.path, objective, mode, allowedPaths }
}

export function readActiveWork(target) {
  const path = activeWorkPath(target)
  if (!existsSync(path)) {
    return { exists: false, path, content: null, reason: 'ACTIVE_WORK_NOT_FOUND' }
  }
  return {
    exists: true,
    path,
    content: readFileSync(path, 'utf8'),
    reason: 'ACTIVE_WORK_FOUND',
  }
}

function sectionBullet(content, heading) {
  const match = content.match(new RegExp(`## ${heading}\\n\\n- ([^\\n]+)`))
  return match?.[1]?.trim() || null
}

export function parseActiveWork(content) {
  if (typeof content !== 'string' || !content.trim()) return null

  const field = (name) => content.match(new RegExp('- ' + name + ': (?:`([^`]+)`|([^\\n]+))'))
  const value = (name) => {
    const match = field(name)
    return (match?.[1] || match?.[2] || '').trim() || null
  }
  const nextAction = content.match(/## Next Permitted Action\n\n([^\n]+)/)?.[1]?.trim() || null
  const proposal = content.match(/## Proposed Transition\n\n- Objective: ([^\n]+)\n- Mode: `([^`]+)`/)
  const allowedSection = content.match(/## Allowed Paths\n\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const allowedPaths = [...allowedSection.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1])

  return {
    status: content.match(/Status: `([^`]+)`/)?.[1]?.trim() || null,
    language: content.match(/Language: `(en|es)`/)?.[1] || null,
    repository: value('Repository'),
    objective: value('Objective'),
    mode: value('Mode'),
    allowedPaths,
    allowed: sectionBullet(content, 'Allowed'),
    forbidden: sectionBullet(content, 'Forbidden'),
    nextAction,
    proposedObjective: proposal?.[1]?.trim() || null,
    proposedMode: proposal?.[2]?.trim() || null,
  }
}
