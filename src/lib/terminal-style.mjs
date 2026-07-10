export const PTECH_CYAN = Object.freeze({ red: 0, green: 168, blue: 232 })
export const PTECH_CYAN_LIGHT = Object.freeze({ red: 56, green: 189, blue: 248 })

const ANSI_RESET = '\u001b[0m'

function ansi(rgb, value) {
  return `\u001b[38;2;${rgb.red};${rgb.green};${rgb.blue}m${value}${ANSI_RESET}`
}

function ansiCode(code, value) {
  return `\u001b[${code}m${value}${ANSI_RESET}`
}

function identity(value) {
  return value
}

export function supportsTerminalColor(output, env = process.env) {
  return Boolean(output?.isTTY)
    && !Object.hasOwn(env, 'NO_COLOR')
    && env.TERM !== 'dumb'
}

export function terminalTheme(enabled = false) {
  if (!enabled) {
    return {
      cyan: identity,
      cyanLight: identity,
      dim: identity,
      green: identity,
      yellow: identity,
      red: identity,
      bold: identity,
    }
  }

  return {
    cyan: (value) => ansi(PTECH_CYAN, value),
    cyanLight: (value) => ansi(PTECH_CYAN_LIGHT, value),
    dim: (value) => ansiCode('2', value),
    green: (value) => ansiCode('32', value),
    yellow: (value) => ansiCode('33', value),
    red: (value) => ansiCode('31', value),
    bold: (value) => ansiCode('1', value),
  }
}
