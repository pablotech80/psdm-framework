import { parseArgs, printJson } from '../lib/args.mjs'
import { buildJudgmentBrief, printJudgmentBrief } from '../lib/judgment.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function impactCommand(args) {
  const { options, positional } = parseArgs(args)
  const intent = positional.join(' ').trim()
  const guidance = options.guidance === null ? 'balanced' : options.guidance

  if (
    !intent
    || options.feature !== null
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
  ) {
    console.error('Usage: riscala impact "<change intent>" [--guidance learn|balanced|concise] [--file path] [--files path,path] [--target path] [--config path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  let report
  try {
    report = buildJudgmentBrief({
      target,
      intent,
      files: options.files,
      configPath: options.configPath,
      guidance,
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return { exitCode: 1 }
  }

  if (options.json) {
    printJson(report)
  } else {
    printJudgmentBrief(report)
  }
  return { exitCode: 0 }
}
