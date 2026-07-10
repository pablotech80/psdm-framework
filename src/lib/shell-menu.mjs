import { terminalTheme } from './terminal-style.mjs'

const MENU_WIDTH = 68

export const SHELL_MENU_COMMANDS = Object.freeze([
  { name: '/help', description: 'Show available commands and safety boundaries.' },
  { name: '/status', description: 'Refresh repository and policy context.' },
  { name: '/audit', description: 'Assess governance adoption and readiness.' },
  { name: '/validate', description: 'Validate the governance baseline.' },
  { name: '/inspect', description: 'Inspect staged changes and governance level.' },
  { name: '/exit', description: 'Close the Riscala shell.' },
])

function truncate(value, width) {
  return value.length > width
    ? `${value.slice(0, Math.max(0, width - 1))}…`
    : value
}

export function filterShellMenuCommands(input) {
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
  const name = command.name.padEnd(10)
  const descriptionWidth = MENU_WIDTH - 14
  const description = truncate(command.description, descriptionWidth).padEnd(descriptionWidth)

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
  const content = '  No matching commands'.padEnd(MENU_WIDTH)
  return `${theme.cyan('│')}${theme.dim(content)}${theme.cyan('│')}`
}

export function renderShellMenu(input, selectedIndex = 0, options = {}) {
  const theme = terminalTheme(options.color)
  const commands = filterShellMenuCommands(input)
  const title = '─ Commands '
  const top = `╭${title}${'─'.repeat(MENU_WIDTH - title.length)}╮`
  const footerText = '─ ↑/↓ navigate · Enter run · Tab complete · Esc close '
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
