import { parseArgs, printJson } from '../lib/args.mjs'
import { enforceChangeLevel } from '../lib/enforcement.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function enforceCommand(args) {
  const { options, positional } = parseArgs(args)
  const description = positional.join(' ').trim()

  if (!description) {
    console.error('Usage: riscala enforce "<change description>" [--max-level "Level 2"] [--file path] [--files path,path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const report = enforceChangeLevel({
    description,
    files: options.files,
    target,
    configPath: options.configPath,
    maxLevel: options.maxLevel || 'Level 2',
  })

  if (options.json) {
    printJson(report)
    return { exitCode: report.allowed ? 0 : 1 }
  }

  console.log(`Change description: ${description}`)
  console.log(`Estimated level: ${report.classification.estimatedLevel}`)
  console.log(`Allowed maximum level: ${report.maxLevel}`)
  console.log(`Decision: ${report.decision}`)

  if (report.violations.length > 0) {
    console.log('Violations:')
    for (const violation of report.violations) {
      console.log(`- ${violation}`)
    }
  }

  if (report.classification.requiredArtifacts.length > 0) {
    console.log(`Required path artifacts: ${report.classification.requiredArtifacts.join(', ')}`)
  }

  return { exitCode: report.allowed ? 0 : 1 }
}
