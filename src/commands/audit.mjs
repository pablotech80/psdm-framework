import { parseArgs, printJson } from '../lib/args.mjs'
import { buildAudit, printAuditReport } from '../lib/audit.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function auditCommand(args) {
  const { options, positional } = parseArgs(args)
  const target = resolveTarget(positional)
  const report = buildAudit(target, {
    configPath: options.configPath,
    feature: options.feature,
  })

  if (options.json) {
    printJson(report)
    return { exitCode: 0 }
  }

  printAuditReport(report)
  return { exitCode: 0 }
}
