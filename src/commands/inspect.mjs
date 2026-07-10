import { parseArgs, printJson } from '../lib/args.mjs'
import { inspectStagedChange } from '../lib/inspect.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function inspectCommand(args) {
  const { options, positional } = parseArgs(args)

  if (!options.staged || positional.length > 0) {
    console.error('Usage: riscala inspect --staged [--json] [--target path] [--config path]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const report = inspectStagedChange({
    target,
    configPath: options.configPath,
  })

  if (options.json) {
    printJson(report)
    return { exitCode: report.decision === 'NOT_A_GIT_REPOSITORY' ? 1 : 0 }
  }

  if (report.decision === 'NOT_A_GIT_REPOSITORY') {
    console.error(`Target is not a Git repository: ${target}`)
    return { exitCode: 1 }
  }

  if (report.decision === 'NO_STAGED_CHANGES') {
    console.log('No staged changes found.')
    return { exitCode: 0 }
  }

  console.log('Riscala Staged Change Inspection')
  console.log('Method: PSDM')
  console.log('')
  console.log(`Files: ${report.files.length}`)
  for (const change of report.git.changes) {
    const path = change.previousPath
      ? `${change.previousPath} -> ${change.path}`
      : change.path
    console.log(`- ${change.status} ${path}`)
  }
  console.log(`Estimated level: ${report.classification.estimatedLevel}`)
  console.log(`Minimum required governance: ${report.classification.minimumRequiredGovernance}`)
  console.log(`Reason: ${report.classification.classificationReason}`)

  if (report.classification.pathMatches.length > 0) {
    console.log('Risk evidence:')
    for (const match of report.classification.pathMatches) {
      console.log(`- ${match.file} matches ${match.pattern} -> ${match.minimumLevel}: ${match.reason}`)
    }
  }

  if (report.classification.requiredArtifacts.length > 0) {
    console.log(`Required path artifacts: ${report.classification.requiredArtifacts.join(', ')}`)
  }

  console.log(`Note: ${report.classification.note}`)
  return { exitCode: 0 }
}
