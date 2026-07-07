import { parseArgs, printJson } from '../lib/args.mjs'
import { loadConfig } from '../lib/config.mjs'
import { resolveTarget } from '../lib/paths.mjs'
import { validateMethod } from '../validator/validate-method.mjs'

export async function reportCommand(args) {
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

  console.log(`# PSDM Compliance Report

Target: \`${target}\`

Config: \`${configState.exists ? configState.path : 'default'}\`

Decision: \`${report.decision}\`

Failures: \`${report.failures}\`
Warnings: \`${report.warnings}\`

## Findings
`)

  for (const item of report.results) {
    console.log(`- **${item.status}** \`${item.artifact}\`: ${item.message} _Priority: ${item.priority}_`)
  }

  return { exitCode: report.failures === 0 ? 0 : 1 }
}
