import { parseArgs, printJson } from '../lib/args.mjs'
import { classifyChange } from '../lib/classifier.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function classifyCommand(args) {
  const { options, positional } = parseArgs(args)
  const description = positional.join(' ').trim()

  if (!description) {
    console.error('Usage: riscala classify "<change description>"')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const payload = {
    command: 'classify',
    ...classifyChange({
      description,
      files: options.files,
      target,
      configPath: options.configPath,
    }),
  }

  if (options.json) {
    printJson(payload)
    return { exitCode: 0 }
  }

  console.log(`Change description: ${description}`)
  console.log(`Estimated level: ${payload.estimatedLevel}`)
  console.log(`Minimum required governance: ${payload.minimumRequiredGovernance}`)
  if (payload.matchedKeywords.length > 0) {
    console.log(`Matched signals: ${payload.matchedKeywords.join(', ')}`)
  }
  if (payload.pathMatches.length > 0) {
    console.log(`Matched risk paths: ${payload.pathMatches.map((item) => `${item.file} -> ${item.minimumLevel}`).join(', ')}`)
  }
  if (payload.requiredArtifacts.length > 0) {
    console.log(`Required path artifacts: ${payload.requiredArtifacts.join(', ')}`)
  }
  console.log(`Reason: ${payload.classificationReason}`)
  console.log(`Note: ${payload.note}`)

  return { exitCode: 0 }
}
