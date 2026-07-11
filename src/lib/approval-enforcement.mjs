import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { verifyGitCommitApproval } from './approval-receipt.mjs'
import { resolveGitDirectory } from './git.mjs'
import { inspectStagedGit } from './git.mjs'
import { parseActiveWork, readActiveWork } from './active-work.mjs'
import { evaluatePathsAgainstActiveWork } from './scope-control.mjs'

function enforcementPaths(target) {
  const gitDirectory = resolveGitDirectory(target)
  if (!gitDirectory) {
    return null
  }

  const stateDirectory = join(gitDirectory, 'riscala')
  return {
    stateDirectory,
    receipt: join(stateDirectory, 'approval-receipt.json'),
    ledger: join(stateDirectory, 'consumed-approvals.json'),
    lock: join(stateDirectory, 'approval.lock'),
  }
}

export function defaultApprovalReceiptPath(target) {
  return enforcementPaths(target)?.receipt || null
}

function readLedger(path) {
  if (!existsSync(path)) {
    return { version: 1, consumptions: [] }
  }

  const ledger = JSON.parse(readFileSync(path, 'utf8'))
  if (
    ledger?.version !== 1
    || !Array.isArray(ledger.consumptions)
  ) {
    throw new Error('Approval consumption ledger is invalid.')
  }

  return ledger
}

function consumeApproval({ paths, report, now }) {
  mkdirSync(paths.stateDirectory, { recursive: true, mode: 0o700 })
  let lockDescriptor = null

  try {
    lockDescriptor = openSync(paths.lock, 'wx', 0o600)
  } catch {
    return {
      consumed: false,
      violation: 'Approval consumption lock is already held or cannot be created.',
    }
  }

  try {
    const ledger = readLedger(paths.ledger)
    const approvalId = report.receipt.approvalId
    if (ledger.consumptions.some((item) => item.approvalId === approvalId)) {
      return {
        consumed: false,
        violation: 'Approval receipt has already been consumed.',
      }
    }

    ledger.consumptions.push({
      approvalId,
      actionId: report.actionRecord.actionId,
      action: report.action,
      contentHash: report.actionRecord.binding.contentHash,
      consumedAt: now.toISOString(),
    })

    const temporaryPath = `${paths.ledger}.${process.pid}.tmp`
    writeFileSync(temporaryPath, `${JSON.stringify(ledger, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    })
    renameSync(temporaryPath, paths.ledger)
    return { consumed: true, violation: null }
  } catch (error) {
    return {
      consumed: false,
      violation: error instanceof Error ? error.message : String(error),
    }
  } finally {
    if (lockDescriptor !== null) {
      closeSync(lockDescriptor)
    }
    if (existsSync(paths.lock)) {
      unlinkSync(paths.lock)
    }
  }
}

export function enforceGitCommitApproval({
  target,
  receiptPath = null,
  configPath = null,
  now = new Date(),
}) {
  const paths = enforcementPaths(target)
  if (!paths) {
    return {
      version: 1,
      command: 'approval',
      operation: 'enforce',
      action: 'git.commit',
      decision: 'COMMIT_APPROVAL_DENIED',
      allowed: false,
      verification: null,
      consumption: null,
      violations: ['Target is not a Git repository.'],
    }
  }

  const activeState = readActiveWork(target)
  const activeWork = parseActiveWork(activeState.content)
  const staged = inspectStagedGit(target)
  const stagedPaths = [...new Set(staged.changes.flatMap((change) => change.previousPath ? [change.previousPath, change.path] : [change.path]))]
  const scope = evaluatePathsAgainstActiveWork({ target, work: activeWork, paths: stagedPaths })
  if (scope.decision === 'REPOSITORY_CONFLICT' || scope.violations.length > 0) {
    return {
      version: 1,
      command: 'approval',
      operation: 'enforce',
      action: 'git.commit',
      decision: 'COMMIT_ACTIVE_WORK_SCOPE_DENIED',
      allowed: false,
      verification: null,
      scope,
      consumption: null,
      violations: scope.decision === 'REPOSITORY_CONFLICT'
        ? ['Active Work belongs to a different repository.']
        : scope.violations.map((file) => `${file} is staged outside the Active Work allowed paths.`),
    }
  }

  const verification = verifyGitCommitApproval({
    target,
    receiptPath: receiptPath || paths.receipt,
    configPath,
    now,
  })
  const report = {
    version: 1,
    command: 'approval',
    operation: 'enforce',
    action: 'git.commit',
    decision: 'COMMIT_APPROVAL_DENIED',
    allowed: false,
    verification,
    consumption: null,
    violations: [...verification.violations],
    scope,
  }

  if (!verification.valid) {
    return report
  }

  if (verification.decision === 'APPROVAL_NOT_REQUIRED') {
    report.decision = 'COMMIT_APPROVAL_NOT_REQUIRED'
    report.allowed = true
    return report
  }

  const consumption = consumeApproval({ paths, report: verification, now })
  report.consumption = consumption
  if (!consumption.consumed) {
    report.violations.push(consumption.violation)
    return report
  }

  report.decision = 'COMMIT_APPROVAL_CONSUMED'
  report.allowed = true
  return report
}
