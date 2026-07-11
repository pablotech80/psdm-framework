import { parseArgs, printJson } from '../lib/args.mjs'
import { createActiveWork, readActiveWork, WORK_MODES } from '../lib/active-work.mjs'
import { resolveTarget } from '../lib/paths.mjs'

function invalidOptions(options) {
  return options.feature !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
    || options.guidance !== null
    || options.configPath !== null
}

export async function workCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, ...rest] = positional
  const target = options.target ? resolveTarget([options.target]) : process.cwd()

  if (operation === 'init') {
    const objective = rest.join(' ').trim()
    const mode = options.mode || 'implement'
    if (!objective || invalidOptions(options) || !WORK_MODES.includes(mode)) {
      console.error('Usage: riscala work init "<objective>" [--mode inspect|experiment|design|implement|release] [--target path] [--json]')
      return { exitCode: 1 }
    }
    const result = createActiveWork({ target, objective, mode })
    const report = { command: 'work', operation, target, mode, objective, ...result }
    if (options.json) printJson(report)
    else console.log(result.created ? `Active Work created: ${result.path}` : `Active Work already exists: ${result.path}`)
    return { exitCode: result.created ? 0 : 1 }
  }

  if (operation === 'show' && rest.length === 0 && options.mode === null && !invalidOptions(options)) {
    const report = { command: 'work', operation, target, ...readActiveWork(target) }
    if (options.json) printJson(report)
    else if (report.exists) console.log(report.content.trimEnd())
    else console.error(`Active Work not found: ${report.path}`)
    return { exitCode: report.exists ? 0 : 1 }
  }

  console.error('Usage: riscala work <init "objective" [--mode mode]|show> [--target path] [--json]')
  return { exitCode: 1 }
}
