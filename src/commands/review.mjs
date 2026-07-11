import { parseArgs, printJson } from '../lib/args.mjs'
import { buildDecisionReview, printDecisionReview } from '../lib/decision-review.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function reviewCommand(args) {
  const { options, positional } = parseArgs(args)
  const intent = positional.join(' ').trim()
  const guidance = options.guidance === null ? 'balanced' : options.guidance

  if (
    !intent
    || !options.staged
    || options.feature !== null
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.receiptPath !== null
  ) {
    console.error('Usage: riscala review "<change intent>" --staged [--guidance learn|balanced|concise] [--file expected-path] [--files expected-paths] [--target path] [--config path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  let report
  try {
    report = buildDecisionReview({
      target,
      intent,
      expectedFiles: options.files,
      configPath: options.configPath,
      guidance,
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return { exitCode: 1 }
  }

  if (options.json) printJson(report)
  else printDecisionReview(report)

  return { exitCode: report.decision === 'NOT_A_GIT_REPOSITORY' ? 1 : 0 }
}
