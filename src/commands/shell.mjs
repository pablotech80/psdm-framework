import { createInterface } from 'node:readline/promises'
import { parseArgs } from '../lib/args.mjs'
import {
  buildShellContext,
  executeShellCommand,
  renderShellBanner,
} from '../lib/shell.mjs'
import { resolveTarget } from '../lib/paths.mjs'

const PROMPT = 'riscala › '

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
  const context = buildShellContext({ target, configPath: options.configPath })
  const readline = createInterface({ input, output, terminal: Boolean(output.isTTY) })

  output.write(`${renderShellBanner(context)}\n\n${PROMPT}`)

  for await (const line of readline) {
    const result = executeShellCommand(line, {
      target,
      configPath: options.configPath,
    })

    if (result.output) {
      output.write(`${result.output}\n`)
    }

    if (result.exit) {
      break
    }

    output.write(`\n${PROMPT}`)
  }

  readline.close()
  return { exitCode: 0 }
}
