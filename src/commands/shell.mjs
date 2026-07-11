import { createInterface } from 'node:readline/promises'
import { parseArgs } from '../lib/args.mjs'
import {
  buildShellContext,
  executeShellCommand,
  renderShellBanner,
  renderShellPrompt,
} from '../lib/shell.mjs'
import { resolveTarget } from '../lib/paths.mjs'
import { supportsTerminalColor } from '../lib/terminal-style.mjs'
import { detectLanguage } from '../lib/active-work.mjs'
import { runInteractiveShellSession } from '../lib/shell-session.mjs'

function invalidOptions(options, positional) {
  return positional.length > 1
    || options.json
    || options.feature !== null
    || options.target !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
}

export async function shellCommand(args, streams = {}) {
  const { options, positional } = parseArgs(args)

  if (invalidOptions(options, positional)) {
    console.error('Usage: riscala shell [target] [--config path]')
    return { exitCode: 1 }
  }

  const target = resolveTarget(positional)
  const input = streams.input || process.stdin
  const output = streams.output || process.stdout
  const env = streams.env || process.env
  const color = supportsTerminalColor(output, env)
  let language = detectLanguage(env)
  const context = buildShellContext({ target, configPath: options.configPath, language, env })
  const prompt = renderShellPrompt({ color })

  output.write(`${renderShellBanner(context, { color })}\n\n${prompt}`)

  if (input.isTTY && output.isTTY && typeof input.setRawMode === 'function') {
    return runInteractiveShellSession({
      input,
      output,
      target,
      configPath: options.configPath,
      color,
      language,
      env,
      prompt,
    })
  }

  const readline = createInterface({ input, output, terminal: false })

  for await (const line of readline) {
    const result = executeShellCommand(line, {
      target,
      configPath: options.configPath,
      color,
      language,
      env,
    })
    if (result.language) language = result.language

    if (result.output) {
      output.write(`${result.output}\n`)
    }

    if (result.exit) {
      break
    }

    output.write(`\n${prompt}`)
  }

  readline.close()
  return { exitCode: 0 }
}
