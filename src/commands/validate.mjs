import { resolveTarget } from '../lib/paths.mjs'
import { printValidationReport, validateMethod } from '../validator/validate-method.mjs'

export async function validateCommand(args) {
  const target = resolveTarget(args)
  const report = validateMethod(target)
  printValidationReport(report)
  return { exitCode: report.failures === 0 ? 0 : 1 }
}
