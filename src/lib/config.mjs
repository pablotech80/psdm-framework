import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { FEATURE_REQUIRED_ARTIFACTS, REQUIRED_ARTIFACTS } from './artifacts.mjs'

export const PROFILE_PRESETS = {
  standard: {
    requiredArtifacts: [],
    riskPaths: [],
  },
  framework: {
    requiredArtifacts: ['ROADMAP.md', 'TODO.md'],
    riskPaths: [
      {
        pattern: 'bin/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'CLI entrypoint changes alter user-facing command behavior.',
      },
      {
        pattern: 'src/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Framework source changes alter PSDM behavior.',
      },
      {
        pattern: 'templates/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Template changes affect newly initialized PSDM projects.',
      },
      {
        pattern: 'tests/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/TESTING.md'],
        reason: 'Fixture changes affect regression coverage.',
      },
    ],
  },
  'backend-api': {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'backend/auth/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SECURITY.md', 'docs/TESTING.md'],
        reason: 'Authentication and authorization changes can expose private data or bypass access control.',
      },
      {
        pattern: 'backend/migrations/**',
        minimumLevel: 'Level 4',
        requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
        reason: 'Database migrations can require rollback and production operations planning.',
      },
    ],
  },
  'ai-agent': {
    requiredArtifacts: [
      'docs/SECURITY.md',
      'docs/ARCHITECTURE.md',
      'docs/AI_GUARDRAILS.md',
      'docs/DATA_CLASSIFICATION.md',
      'docs/COST_LATENCY_BUDGET.md',
      'docs/PROMPT_INJECTION_TESTS.md',
      'docs/AI_EVALS.md',
    ],
    riskPaths: [
      {
        pattern: 'agents/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
        reason: 'AI agent changes can affect tool use, data exposure, and autonomous behavior.',
      },
      {
        pattern: 'rag/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
        reason: 'RAG changes can affect private data retrieval, context construction, and output trust.',
      },
    ],
  },
  saas: {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'backend/payments/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/SECURITY.md', 'docs/TESTING.md'],
        reason: 'Payment changes affect money movement and customer billing state.',
      },
      {
        pattern: 'infra/**',
        minimumLevel: 'Level 4',
        requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
        reason: 'Infrastructure changes can affect deployment, availability, and runtime security.',
      },
    ],
  },
  monorepo: {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'packages/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Package changes can affect shared behavior across a monorepo.',
      },
    ],
  },
}

export const SUPPORTED_PROFILES = Object.keys(PROFILE_PRESETS)

export const DEFAULT_AI_POLICY = {
  pii: {
    allowedInPrompts: null,
    redactionRequired: null,
  },
  cost: {
    maxUsdPerRequest: null,
    monthlyBudgetUsd: null,
  },
  latency: {
    p95Ms: null,
  },
  tools: {
    registryRequired: null,
    humanApprovalForExternalActions: null,
  },
  evals: {
    required: null,
  },
  security: {
    promptInjectionTestsRequired: null,
  },
}

export const DEFAULT_APPROVAL_POLICY = {
  requiredLevels: ['Level 3', 'Level 4'],
  requiredActions: [],
  maxReceiptAgeSeconds: 600,
  trustedApprovers: [],
}

export const DEFAULT_CONFIG = {
  version: 1,
  profile: 'standard',
  requiredArtifacts: REQUIRED_ARTIFACTS,
  extraRequiredArtifacts: [],
  features: {
    root: 'docs/features',
    requiredArtifacts: FEATURE_REQUIRED_ARTIFACTS,
  },
  git: {
    warnOnDirty: true,
  },
  ai: DEFAULT_AI_POLICY,
  approval: DEFAULT_APPROVAL_POLICY,
  riskPaths: [
    {
      pattern: 'backend/auth/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SECURITY.md', 'docs/TESTING.md'],
      reason: 'Authentication and authorization changes can expose private data or bypass access control.',
    },
    {
      pattern: 'backend/payments/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/SECURITY.md', 'docs/TESTING.md'],
      reason: 'Payment changes affect money movement and customer billing state.',
    },
    {
      pattern: 'backend/migrations/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
      reason: 'Database migrations can require rollback and production operations planning.',
    },
    {
      pattern: 'infra/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
      reason: 'Infrastructure changes can affect deployment, availability, and runtime security.',
    },
    {
      pattern: 'AGENTS.md',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md', 'docs/TESTING.md'],
      reason: 'Agent instruction changes can alter autonomous behavior, approval boundaries, and tool use.',
    },
    {
      pattern: 'agents/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
      reason: 'AI agent changes can affect tool use, data exposure, and autonomous behavior.',
    },
    {
      pattern: 'rag/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
      reason: 'RAG changes can affect private data retrieval, context construction, and output trust.',
    },
    {
      pattern: '.github/workflows/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md', 'docs/SECURITY.md'],
      reason: 'CI workflow changes can alter release, secret, and deployment behavior.',
    },
  ],
}

function arrayOrDefault(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback
}

function uniqueByValue(items) {
  return Array.from(new Set(items))
}

function uniqueRiskPaths(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = `${item?.pattern}:${item?.minimumLevel}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergePlainObject(defaults, overrides) {
  if (!isPlainObject(overrides)) {
    return { ...defaults }
  }

  return {
    ...defaults,
    ...overrides,
  }
}

function mergeAiPolicy(rawAi) {
  if (!isPlainObject(rawAi)) {
    return {
      pii: { ...DEFAULT_AI_POLICY.pii },
      cost: { ...DEFAULT_AI_POLICY.cost },
      latency: { ...DEFAULT_AI_POLICY.latency },
      tools: { ...DEFAULT_AI_POLICY.tools },
      evals: { ...DEFAULT_AI_POLICY.evals },
      security: { ...DEFAULT_AI_POLICY.security },
    }
  }

  return {
    pii: mergePlainObject(DEFAULT_AI_POLICY.pii, rawAi.pii),
    cost: mergePlainObject(DEFAULT_AI_POLICY.cost, rawAi.cost),
    latency: mergePlainObject(DEFAULT_AI_POLICY.latency, rawAi.latency),
    tools: mergePlainObject(DEFAULT_AI_POLICY.tools, rawAi.tools),
    evals: mergePlainObject(DEFAULT_AI_POLICY.evals, rawAi.evals),
    security: mergePlainObject(DEFAULT_AI_POLICY.security, rawAi.security),
  }
}

function mergeApprovalPolicy(rawApproval) {
  if (!isPlainObject(rawApproval)) {
    return {
      requiredLevels: [...DEFAULT_APPROVAL_POLICY.requiredLevels],
      requiredActions: [...DEFAULT_APPROVAL_POLICY.requiredActions],
      maxReceiptAgeSeconds: DEFAULT_APPROVAL_POLICY.maxReceiptAgeSeconds,
      trustedApprovers: [...DEFAULT_APPROVAL_POLICY.trustedApprovers],
    }
  }

  return {
    requiredLevels: Array.isArray(rawApproval.requiredLevels)
      ? rawApproval.requiredLevels
      : [...DEFAULT_APPROVAL_POLICY.requiredLevels],
    requiredActions: Array.isArray(rawApproval.requiredActions)
      ? rawApproval.requiredActions
      : [...DEFAULT_APPROVAL_POLICY.requiredActions],
    maxReceiptAgeSeconds: rawApproval.maxReceiptAgeSeconds
      ?? DEFAULT_APPROVAL_POLICY.maxReceiptAgeSeconds,
    trustedApprovers: Array.isArray(rawApproval.trustedApprovers)
      ? rawApproval.trustedApprovers
      : [...DEFAULT_APPROVAL_POLICY.trustedApprovers],
  }
}

function validOptionalBoolean(value) {
  return value === null || typeof value === 'boolean'
}

function validOptionalPositiveNumber(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value > 0)
}

export function validateAiPolicy(rawAi) {
  if (rawAi === undefined) {
    return []
  }

  if (!isPlainObject(rawAi)) {
    return [
      {
        message: 'ai must be an object.',
        priority: 'High',
      },
    ]
  }

  const issues = []
  const objectGroups = ['pii', 'cost', 'latency', 'tools', 'evals', 'security']

  for (const group of objectGroups) {
    if (rawAi[group] !== undefined && !isPlainObject(rawAi[group])) {
      issues.push({
        message: `ai.${group} must be an object.`,
        priority: 'High',
      })
    }
  }

  const ai = mergeAiPolicy(rawAi)
  const booleanFields = [
    ['pii.allowedInPrompts', ai.pii.allowedInPrompts],
    ['pii.redactionRequired', ai.pii.redactionRequired],
    ['tools.registryRequired', ai.tools.registryRequired],
    ['tools.humanApprovalForExternalActions', ai.tools.humanApprovalForExternalActions],
    ['evals.required', ai.evals.required],
    ['security.promptInjectionTestsRequired', ai.security.promptInjectionTestsRequired],
  ]
  const numberFields = [
    ['cost.maxUsdPerRequest', ai.cost.maxUsdPerRequest],
    ['cost.monthlyBudgetUsd', ai.cost.monthlyBudgetUsd],
    ['latency.p95Ms', ai.latency.p95Ms],
  ]

  for (const [field, value] of booleanFields) {
    if (!validOptionalBoolean(value)) {
      issues.push({
        message: `ai.${field} must be a boolean or null.`,
        priority: 'High',
      })
    }
  }

  for (const [field, value] of numberFields) {
    if (!validOptionalPositiveNumber(value)) {
      issues.push({
        message: `ai.${field} must be a positive number or null.`,
        priority: 'High',
      })
    }
  }

  return issues
}

export function validateApprovalPolicy(rawApproval) {
  if (rawApproval === undefined) {
    return []
  }

  if (!isPlainObject(rawApproval)) {
    return [{ message: 'approval must be an object.', priority: 'High' }]
  }

  const issues = []
  const validLevels = new Set(['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4'])
  const validModes = new Set(['hardware-signature', 'remote-approval'])
  const fingerprintPattern = /^sha256:[a-f0-9]{64}$/

  if (
    rawApproval.requiredLevels !== undefined
    && (!Array.isArray(rawApproval.requiredLevels)
      || rawApproval.requiredLevels.some((level) => !validLevels.has(level)))
  ) {
    issues.push({
      message: 'approval.requiredLevels must contain only Level 0 through Level 4.',
      priority: 'High',
    })
  } else if (
    Array.isArray(rawApproval.requiredLevels)
    && (!rawApproval.requiredLevels.includes('Level 3')
      || !rawApproval.requiredLevels.includes('Level 4'))
  ) {
    issues.push({
      message: 'approval.requiredLevels must include Level 3 and Level 4.',
      priority: 'High',
    })
  }

  if (
    rawApproval.requiredActions !== undefined
    && (!Array.isArray(rawApproval.requiredActions)
      || rawApproval.requiredActions.some((action) => typeof action !== 'string' || !action.trim()))
  ) {
    issues.push({
      message: 'approval.requiredActions must be an array of non-empty strings.',
      priority: 'High',
    })
  }

  if (
    rawApproval.maxReceiptAgeSeconds !== undefined
    && (!Number.isInteger(rawApproval.maxReceiptAgeSeconds)
      || rawApproval.maxReceiptAgeSeconds < 60
      || rawApproval.maxReceiptAgeSeconds > 86400)
  ) {
    issues.push({
      message: 'approval.maxReceiptAgeSeconds must be an integer between 60 and 86400.',
      priority: 'High',
    })
  }

  if (
    rawApproval.trustedApprovers !== undefined
    && !Array.isArray(rawApproval.trustedApprovers)
  ) {
    issues.push({
      message: 'approval.trustedApprovers must be an array.',
      priority: 'High',
    })
    return issues
  }

  const approvers = rawApproval.trustedApprovers || []
  const seenIds = new Set()
  for (const [index, approver] of approvers.entries()) {
    const prefix = `approval.trustedApprovers[${index}]`
    if (!isPlainObject(approver)) {
      issues.push({ message: `${prefix} must be an object.`, priority: 'High' })
      continue
    }

    if (typeof approver.id !== 'string' || !approver.id.trim()) {
      issues.push({ message: `${prefix}.id must be a non-empty string.`, priority: 'High' })
    } else if (seenIds.has(approver.id)) {
      issues.push({ message: `${prefix}.id must be unique.`, priority: 'High' })
    } else {
      seenIds.add(approver.id)
    }

    if (typeof approver.publicKeyPath !== 'string' || !approver.publicKeyPath.trim()) {
      issues.push({ message: `${prefix}.publicKeyPath must be a non-empty string.`, priority: 'High' })
    }

    if (!fingerprintPattern.test(approver.publicKeyFingerprint || '')) {
      issues.push({
        message: `${prefix}.publicKeyFingerprint must use sha256:<64 lowercase hex characters>.`,
        priority: 'High',
      })
    }

    if (
      !Array.isArray(approver.approvalModes)
      || approver.approvalModes.length === 0
      || approver.approvalModes.some((mode) => !validModes.has(mode))
    ) {
      issues.push({
        message: `${prefix}.approvalModes must contain hardware-signature or remote-approval.`,
        priority: 'High',
      })
    }
  }

  return issues
}

function resolveConfigPath(targetDir, configPath) {
  if (!configPath) {
    return join(targetDir, 'psdm.config.json')
  }

  return isAbsolute(configPath) ? configPath : resolve(process.cwd(), configPath)
}

export function loadConfig(targetDir, configPath = null) {
  const path = resolveConfigPath(targetDir, configPath)
  const exists = existsSync(path)
  const rawConfig = exists ? JSON.parse(readFileSync(path, 'utf8')) : {}
  const profileName = rawConfig.profile || DEFAULT_CONFIG.profile
  const profile = PROFILE_PRESETS[profileName] || PROFILE_PRESETS.standard

  const requiredArtifacts = uniqueByValue([
    ...arrayOrDefault(rawConfig.requiredArtifacts, DEFAULT_CONFIG.requiredArtifacts),
    ...profile.requiredArtifacts,
    ...arrayOrDefault(rawConfig.extraRequiredArtifacts, DEFAULT_CONFIG.extraRequiredArtifacts),
  ])

  const config = {
    version: rawConfig.version || DEFAULT_CONFIG.version,
    profile: profileName,
    requiredArtifacts,
    extraRequiredArtifacts: arrayOrDefault(
      rawConfig.extraRequiredArtifacts,
      DEFAULT_CONFIG.extraRequiredArtifacts,
    ),
    features: {
      root: rawConfig.features?.root || DEFAULT_CONFIG.features.root,
      requiredArtifacts: arrayOrDefault(
        rawConfig.features?.requiredArtifacts,
        DEFAULT_CONFIG.features.requiredArtifacts,
      ),
    },
    git: {
      warnOnDirty: rawConfig.git?.warnOnDirty ?? DEFAULT_CONFIG.git.warnOnDirty,
    },
    ai: mergeAiPolicy(rawConfig.ai),
    approval: mergeApprovalPolicy(rawConfig.approval),
    riskPaths: uniqueRiskPaths([
      ...profile.riskPaths,
      ...arrayOrDefault(rawConfig.riskPaths, DEFAULT_CONFIG.riskPaths),
    ]),
  }

  return {
    path,
    exists,
    rawConfig,
    config,
    profile: {
      name: profileName,
      recognized: Boolean(PROFILE_PRESETS[profileName]),
      requiredArtifacts: profile.requiredArtifacts,
      riskPaths: profile.riskPaths,
    },
  }
}
