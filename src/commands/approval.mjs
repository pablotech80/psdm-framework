import { parseArgs, printJson } from '../lib/args.mjs'
import { verifyGitCommitApproval } from '../lib/approval-receipt.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function approvalCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, action, ...extra] = positional

  if (
    operation !== 'verify'
    || action !== 'git.commit'
    || extra.length > 0
    || !options.receiptPath
    || options.feature !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
  ) {
    console.error('Usage: riscala approval verify git.commit --receipt path [--target path] [--config path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const report = verifyGitCommitApproval({
    target,
    configPath: options.configPath,
    receiptPath: resolveTarget([options.receiptPath]),
  })

  if (options.json) {
    printJson(report)
  } else {
    console.log('Riscala Approval Verification')
    console.log(`Action: ${report.action}`)
    console.log(`Decision: ${report.decision}`)
    if (report.receipt) {
      console.log(`Approval: ${report.receipt.approvalId}`)
      console.log(`Approver: ${report.receipt.approver}`)
      console.log(`Mode: ${report.receipt.approvalMode}`)
    }
    for (const violation of report.violations) {
      console.log(`- ${violation}`)
    }
  }

  return { exitCode: report.valid ? 0 : 1 }
}
