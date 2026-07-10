import { createHash } from 'node:crypto'
import { basename } from 'node:path'
import { loadConfig, validateApprovalPolicy } from './config.mjs'
import { inspectRepositoryIdentity, readStagedDiff } from './git.mjs'
import { inspectStagedChange } from './inspect.mjs'

export const SUPPORTED_ACTIONS = ['git.commit']

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function sanitizedOrigin(origin) {
  if (!origin || !origin.includes('://')) {
    return origin
  }

  try {
    const url = new URL(origin)
    url.username = ''
    url.password = ''
    return url.toString()
  } catch {
    return origin
  }
}

function repositoryBinding(identity) {
  const source = sanitizedOrigin(identity.origin) || identity.root
  return {
    id: sha256(source),
    label: identity.origin
      ? basename(identity.origin.replace(/\.git$/, ''))
      : basename(identity.root),
  }
}

function actionId(binding) {
  return `action_${createHash('sha256')
    .update(`${binding.action}\0${binding.repository}\0${binding.branch}\0${binding.contentHash}`)
    .digest('hex')
    .slice(0, 24)}`
}

function publicApprovalPolicy(policy) {
  return {
    requiredLevels: policy.requiredLevels,
    requiredActions: policy.requiredActions,
    maxReceiptAgeSeconds: policy.maxReceiptAgeSeconds,
    trustedApprovers: policy.trustedApprovers.map((approver) => ({
      id: approver.id,
      publicKeyFingerprint: approver.publicKeyFingerprint,
      approvalModes: approver.approvalModes,
    })),
  }
}

export function buildGitCommitActionRecord({ target, configPath = null, now = new Date() }) {
  const staged = inspectStagedChange({ target, configPath })

  if (staged.decision !== 'CHANGE_REVIEW_REQUIRED') {
    return {
      version: 1,
      command: 'action',
      operation: 'prepare',
      action: 'git.commit',
      decision: staged.decision,
      ready: false,
      target,
      actionId: null,
      binding: null,
      classification: staged.classification,
      approval: null,
    }
  }

  const identity = inspectRepositoryIdentity(target)
  const repository = repositoryBinding(identity)
  const contentHash = sha256(readStagedDiff(target))
  const binding = {
    action: 'git.commit',
    repository: repository.id,
    branch: identity.branch || 'DETACHED_HEAD',
    contentHash,
  }
  const configState = loadConfig(target, configPath)
  const policy = configState.config.approval
  const policyIssues = validateApprovalPolicy(configState.rawConfig.approval)
  const approvalRequired = policy.requiredLevels.includes(staged.classification.estimatedLevel)
    || policy.requiredActions.includes(binding.action)
  const policyValid = policyIssues.length === 0
  const policyComplete = policyValid && (!approvalRequired || policy.trustedApprovers.length > 0)
  let decision = 'ACTION_RECORD_READY'
  if (!policyValid) {
    decision = 'APPROVAL_POLICY_INVALID'
  } else if (!policyComplete) {
    decision = 'APPROVAL_POLICY_INCOMPLETE'
  }

  return {
    version: 1,
    command: 'action',
    operation: 'prepare',
    action: binding.action,
    decision,
    ready: policyComplete,
    target,
    repositoryLabel: repository.label,
    actionId: actionId(binding),
    createdAt: now.toISOString(),
    binding,
    classification: {
      estimatedLevel: staged.classification.estimatedLevel,
      reason: staged.classification.classificationReason,
      files: staged.files,
    },
    approval: {
      required: approvalRequired,
      policy: publicApprovalPolicy(policy),
      policyIssues,
    },
  }
}
