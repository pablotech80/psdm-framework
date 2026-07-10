import { parseArgs, printJson } from '../lib/args.mjs'
import { verifyGitCommitApproval } from '../lib/approval-receipt.mjs'
import { enforceGitCommitApproval } from '../lib/approval-enforcement.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function approvalCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, action, ...extra] = positional

  const supportedOperation = operation === 'verify' || operation === 'enforce'

  if (
    !supportedOperation
    || action !== 'git.commit'
    || extra.length > 0
    || (operation === 'verify' && !options.receiptPath)
    || options.feature !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
  ) {
    console.error('Usage: riscala approval <verify|enforce> git.commit [--receipt path] [--target path] [--config path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const receiptPath = options.receiptPath ? resolveTarget([options.receiptPath]) : null
  const report = operation === 'verify'
    ? verifyGitCommitApproval({
      target,
      configPath: options.configPath,
      receiptPath,
    })
    : enforceGitCommitApproval({
      target,
      configPath: options.configPath,
      receiptPath,
    })

  if (options.json) {
    printJson(report)
  } else {
    console.log(operation === 'verify'
      ? 'Riscala Approval Verification'
      : 'Riscala Commit Approval Enforcement')
    console.log(`Action: ${report.action}`)
    console.log(`Decision: ${report.decision}`)
    const receipt = operation === 'verify' ? report.receipt : report.verification?.receipt
    if (receipt) {
      console.log(`Approval: ${receipt.approvalId}`)
      console.log(`Approver: ${receipt.approver}`)
      console.log(`Mode: ${receipt.approvalMode}`)
    }
    for (const violation of report.violations) {
      console.log(`- ${violation}`)
    }
  }

  const allowed = operation === 'verify' ? report.valid : report.allowed
  return { exitCode: allowed ? 0 : 1 }
}
