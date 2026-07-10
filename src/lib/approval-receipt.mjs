import {
  createHash,
  createPublicKey,
  verify,
} from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { buildGitCommitActionRecord } from './action-record.mjs'
import { loadConfig } from './config.mjs'

const STRONG_APPROVAL_MODES = new Set(['hardware-signature', 'remote-approval'])

function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

export function canonicalReceiptPayload(receipt) {
  const { signature, ...payload } = receipt
  return canonicalize(payload)
}

export function publicKeyFingerprint(publicKey) {
  const key = createPublicKey(publicKey)
  const der = key.export({ type: 'spki', format: 'der' })
  return `sha256:${createHash('sha256').update(der).digest('hex')}`
}

function resolvePublicKeyPath(configPath, publicKeyPath) {
  if (isAbsolute(publicKeyPath)) {
    return publicKeyPath
  }

  return resolve(dirname(configPath), publicKeyPath)
}

function validBase64(value) {
  return typeof value === 'string'
    && value.length > 0
    && /^[A-Za-z0-9+/]+={0,2}$/.test(value)
}

function receiptTime(receipt, maxAgeSeconds, now, violations) {
  const issuedAt = Date.parse(receipt.issuedAt)
  const expiresAt = Date.parse(receipt.expiresAt)

  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    violations.push('Receipt issuedAt and expiresAt must be valid ISO timestamps.')
    return
  }

  if (issuedAt > now.getTime()) {
    violations.push('Receipt issuedAt is in the future.')
  }

  if (expiresAt <= now.getTime()) {
    violations.push('Receipt has expired.')
  }

  if (expiresAt <= issuedAt) {
    violations.push('Receipt expiresAt must be later than issuedAt.')
  }

  if (expiresAt - issuedAt > maxAgeSeconds * 1000) {
    violations.push('Receipt lifetime exceeds approval.maxReceiptAgeSeconds.')
  }
}

function matchBinding(receipt, record, violations) {
  const expected = {
    actionId: record.actionId,
    action: record.binding?.action,
    repository: record.binding?.repository,
    branch: record.binding?.branch,
    contentHash: record.binding?.contentHash,
  }

  for (const [field, value] of Object.entries(expected)) {
    if (receipt[field] !== value) {
      violations.push(`Receipt ${field} does not match the live action record.`)
    }
  }
}

export function verifyGitCommitApproval({
  target,
  receiptPath,
  configPath = null,
  now = new Date(),
}) {
  const record = buildGitCommitActionRecord({ target, configPath, now })
  const report = {
    version: 1,
    command: 'approval',
    operation: 'verify',
    action: 'git.commit',
    decision: 'APPROVAL_RECEIPT_INVALID',
    valid: false,
    actionRecord: record,
    receipt: null,
    violations: [],
  }

  if (!record.ready) {
    report.violations.push(`Live action record is not ready: ${record.decision}.`)
    return report
  }

  if (!record.approval.required) {
    report.decision = 'APPROVAL_NOT_REQUIRED'
    report.valid = true
    return report
  }

  if (!receiptPath || !existsSync(receiptPath)) {
    report.violations.push('Approval receipt file does not exist.')
    return report
  }

  let receipt
  try {
    receipt = JSON.parse(readFileSync(receiptPath, 'utf8'))
  } catch {
    report.violations.push('Approval receipt must be valid JSON.')
    return report
  }

  report.receipt = {
    approvalId: receipt.approvalId || null,
    approver: receipt.approver || null,
    approvalMode: receipt.approvalMode || null,
    issuedAt: receipt.issuedAt || null,
    expiresAt: receipt.expiresAt || null,
  }

  matchBinding(receipt, record, report.violations)
  receiptTime(receipt, record.approval.policy.maxReceiptAgeSeconds, now, report.violations)

  if (receipt.version !== 1) {
    report.violations.push('Receipt version must be 1.')
  }

  if (typeof receipt.approvalId !== 'string' || !receipt.approvalId.trim()) {
    report.violations.push('Receipt approvalId must be a non-empty string.')
  }

  if (!STRONG_APPROVAL_MODES.has(receipt.approvalMode)) {
    report.violations.push('Receipt approvalMode must be hardware-signature or remote-approval.')
  }

  const configState = loadConfig(target, configPath)
  const approver = configState.config.approval.trustedApprovers.find((candidate) => (
    candidate.id === receipt.approver
  ))

  if (!approver) {
    report.violations.push('Receipt approver is not trusted by project policy.')
    return report
  }

  if (!approver.approvalModes.includes(receipt.approvalMode)) {
    report.violations.push('Receipt approvalMode is not allowed for this approver.')
  }

  if (receipt.approverKeyFingerprint !== approver.publicKeyFingerprint) {
    report.violations.push('Receipt approverKeyFingerprint does not match project policy.')
  }

  const publicKeyPath = resolvePublicKeyPath(configState.path, approver.publicKeyPath)
  if (!existsSync(publicKeyPath)) {
    report.violations.push('Trusted approver public key file does not exist.')
    return report
  }

  let publicKey
  try {
    publicKey = readFileSync(publicKeyPath, 'utf8')
    if (publicKeyFingerprint(publicKey) !== approver.publicKeyFingerprint) {
      report.violations.push('Trusted public key fingerprint does not match project policy.')
      return report
    }
  } catch {
    report.violations.push('Trusted approver public key is invalid.')
    return report
  }

  if (!validBase64(receipt.signature)) {
    report.violations.push('Receipt signature must be base64 encoded.')
    return report
  }

  try {
    const key = createPublicKey(publicKey)
    const algorithm = ['ed25519', 'ed448'].includes(key.asymmetricKeyType) ? null : 'sha256'
    const signatureValid = verify(
      algorithm,
      Buffer.from(canonicalReceiptPayload(receipt)),
      key,
      Buffer.from(receipt.signature, 'base64'),
    )

    if (!signatureValid) {
      report.violations.push('Receipt signature is invalid.')
    }
  } catch {
    report.violations.push('Receipt signature verification failed.')
  }

  if (report.violations.length === 0) {
    report.decision = 'APPROVAL_RECEIPT_VALID'
    report.valid = true
  }

  return report
}
