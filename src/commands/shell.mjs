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
  const context = buildShellContext({ target, configPath: options.configPath })
  const readline = createInterface({ input, output, terminal: Boolean(output.isTTY) })
  const prompt = renderShellPrompt({ color })

  output.write(`${renderShellBanner(context, { color })}\n\n${prompt}`)

  for await (const line of readline) {
    const result = executeShellCommand(line, {
      target,
      configPath: options.configPath,
      color,
    })

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
