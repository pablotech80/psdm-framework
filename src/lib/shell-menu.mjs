import { terminalTheme } from './terminal-style.mjs'

const MENU_WIDTH = 68
const MENU_NAME_WIDTH = 18

const SPANISH_DESCRIPTIONS = {
  '/action': 'Preparar un registro para git.commit.',
  '/approval': 'Mostrar el límite de aprobación.',
  '/audit': 'Evaluar adopción y preparación.',
  '/check': 'Comprobar artefactos requeridos.',
  '/classify': 'Clasificar un cambio descrito.',
  '/exit': 'Cerrar la consola de Riscala.',
  '/help': 'Mostrar comandos y límites de seguridad.',
  '/hook-status': 'Comprobar el hook pre-commit.',
  '/impact': 'Evaluar un cambio antes de programar.',
  '/init-preview': 'Previsualizar archivos de gobierno.',
  '/inspect': 'Inspeccionar cambios preparados.',
  '/language': 'Cambiar el idioma entre inglés y español.',
  '/lenguaje': 'Cambiar el idioma entre español e inglés.',
  '/pr-checklist': 'Preparar la lista de una PR.',
  '/report': 'Resumir el estado del informe.',
  '/review': 'Comparar objetivo y evidencia preparada.',
  '/status': 'Actualizar repositorio y política.',
  '/validate': 'Validar la base de gobierno.',
  '/work': 'Crear, cambiar, continuar o cerrar trabajo.',
  '/work close': 'Cerrar el trabajo activo.',
  '/work continue': 'Aceptar una transición propuesta.',
  '/work design ': 'Crear diseño; escribir el objetivo.',
  '/work experiment ': 'Crear experimento; escribir el objetivo.',
  '/work implement ': 'Crear implementación; escribir el objetivo.',
  '/work inspect ': 'Crear inspección; escribir el objetivo.',
  '/work release ': 'Crear publicación; escribir el objetivo.',
  '/work transition ': 'Proponer modo y objetivo.',
}

const WORK_SUBMENU = Object.freeze([
  { name: '/work close', description: 'Close Active Work.', execute: true },
  { name: '/work continue', description: 'Accept a proposed transition.', execute: true },
  { name: '/work design ', description: 'Create design work; type the objective.' },
  { name: '/work experiment ', description: 'Create an experiment; type the objective.' },
  { name: '/work implement ', description: 'Create implementation work; type the objective.' },
  { name: '/work inspect ', description: 'Create inspection work; type the objective.' },
  { name: '/work release ', description: 'Create release work; type the objective.' },
  { name: '/work transition ', description: 'Propose mode and objective.' },
])

const LANGUAGE_SUBMENU = Object.freeze([
  { name: '/language en', description: 'Cambiar a inglés / Switch to English.', execute: true },
  { name: '/language es', description: 'Cambiar a español / Switch to Spanish.', execute: true },
])

const LENGUAJE_SUBMENU = Object.freeze([
  { name: '/lenguaje en', description: 'Cambiar a inglés.', execute: true },
  { name: '/lenguaje es', description: 'Cambiar a español.', execute: true },
])

export const SHELL_MENU_COMMANDS = Object.freeze([
  { name: '/action', description: 'Prepare a git.commit action record.' },
  { name: '/approval', description: 'Show approval receipt boundary.' },
  { name: '/audit', description: 'Assess governance adoption and readiness.' },
  { name: '/check', description: 'Check required artifacts exist.' },
  { name: '/classify', description: 'Classify a described change.' },
  { name: '/exit', description: 'Close the Riscala shell.' },
  { name: '/help', description: 'Show available commands and safety boundaries.' },
  { name: '/hook-status', description: 'Inspect managed pre-commit hook status.' },
  { name: '/impact', description: 'Think through a change before implementation.' },
  { name: '/init-preview', description: 'Preview governance files without writing.' },
  { name: '/inspect', description: 'Inspect staged changes and governance level.' },
  { name: '/language', description: 'Change language between English and Spanish.', children: LANGUAGE_SUBMENU },
  { name: '/lenguaje', description: 'Cambiar el idioma entre español e inglés.', children: LENGUAJE_SUBMENU },
  { name: '/pr-checklist', description: 'Build a PR checklist for a described change.' },
  { name: '/report', description: 'Summarize compliance report readiness.' },
  { name: '/review', description: 'Compare intent with staged Git evidence.' },
  { name: '/status', description: 'Refresh repository and policy context.' },
  { name: '/validate', description: 'Validate the governance baseline.' },
  { name: '/work', description: 'Create, transition, continue, or close Active Work.', children: WORK_SUBMENU },
])

function truncate(value, width) {
  return value.length > width
    ? `${value.slice(0, Math.max(0, width - 1))}…`
    : value
}

export function filterShellMenuCommands(input, parentName = null) {
  if (parentName) {
    return SHELL_MENU_COMMANDS.find((command) => command.name === parentName)?.children || []
  }
  const normalized = input.trim().toLowerCase()
  if (!normalized.startsWith('/')) {
    return []
  }

  return SHELL_MENU_COMMANDS.filter((command) => command.name.startsWith(normalized))
}

export function moveShellMenuSelection(current, direction, count) {
  if (count <= 0) {
    return 0
  }

  const offset = direction === 'previous' ? -1 : 1
  return (current + offset + count) % count
}

function commandRow(command, selected, options) {
  const theme = terminalTheme(options.color)
  const marker = selected ? '❯' : ' '
  const label = command.children ? `${command.name} ›` : command.name
  const name = label.padEnd(MENU_NAME_WIDTH)
  const descriptionWidth = MENU_WIDTH - MENU_NAME_WIDTH - 4
  const translated = options.language === 'es' ? SPANISH_DESCRIPTIONS[command.name] : null
  const description = truncate(translated || command.description, descriptionWidth).padEnd(descriptionWidth)

  return [
    theme.cyan('│'),
    ' ',
    selected ? theme.cyanLight(marker) : marker,
    ' ',
    selected ? theme.cyanLight(name) : theme.cyan(name),
    ' ',
    theme.dim(description),
    theme.cyan('│'),
  ].join('')
}

function emptyRow(options) {
  const theme = terminalTheme(options.color)
  const content = `  ${options.language === 'es' ? 'No hay comandos coincidentes' : 'No matching commands'}`.padEnd(MENU_WIDTH)
  return `${theme.cyan('│')}${theme.dim(content)}${theme.cyan('│')}`
}

export function renderShellMenu(input, selectedIndex = 0, options = {}) {
  const theme = terminalTheme(options.color)
  const commands = filterShellMenuCommands(input, options.parentName)
  const rawTitle = options.parentName ? options.parentName.slice(1) : 'Commands'
  const localizedTitle = options.language === 'es'
    ? ({ Commands: 'Comandos', work: 'trabajo', language: 'idioma', lenguaje: 'lenguaje' }[rawTitle] || rawTitle)
    : rawTitle
  const title = `─ ${localizedTitle} `
  const top = `╭${title}${'─'.repeat(MENU_WIDTH - title.length)}╮`
  const footerText = options.language === 'es'
    ? (options.parentName ? '─ ↑/↓ navegar · Enter elegir · ←/Esc volver ' : '─ ↑/↓ navegar · →/Enter abrir · Tab completar ')
    : (options.parentName ? '─ ↑/↓ navigate · Enter select · ←/Esc back ' : '─ ↑/↓ navigate · →/Enter open · Tab complete ')
  const bottom = `╰${footerText}${'─'.repeat(MENU_WIDTH - footerText.length)}╯`
  const rows = commands.length > 0
    ? commands.map((command, index) => commandRow(command, index === selectedIndex, options))
    : [emptyRow(options)]

  return [
    theme.cyan(top),
    ...rows,
    theme.cyan(bottom),
  ].join('\n')
}
