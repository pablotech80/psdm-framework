import { parseArgs, printJson } from '../lib/args.mjs'
import { loadConfig } from '../lib/config.mjs'
import { resolveTarget } from '../lib/paths.mjs'
import { printValidationReport, validateMethod } from '../validator/validate-method.mjs'

export async function validateCommand(args) {
  const { options, positional } = parseArgs(args)
  const target = resolveTarget(positional)
  const configState = loadConfig(target, options.configPath)
  const report = validateMethod(target, {
    configState,
    feature: options.feature,
  })

  if (options.json) {
    printJson(report)
    return { exitCode: report.failures === 0 ? 0 : 1 }
  }

  printValidationReport(report)
  return { exitCode: report.failures === 0 ? 0 : 1 }
}
