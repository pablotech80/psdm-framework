import { resolveTarget } from '../lib/paths.mjs'
import { validateMethod } from '../validator/validate-method.mjs'

export async function reportCommand(args) {
  const target = resolveTarget(args)
  const report = validateMethod(target)

  console.log(`# PSDM Compliance Report

Target: \`${target}\`

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
