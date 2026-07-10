import { loadConfig } from './config.mjs'
import { highestLevel, levelPriority, matchRiskPaths } from './risk-paths.mjs'

export const LEVEL_RULES = [
  {
    level: 'Level 4',
    priority: 4,
    keywords: [
      'deploy',
      'deployment',
      'docker',
      'kubernetes',
      'vps',
      'aws',
      'railway',
      'ci/cd',
      'pipeline',
      'environment variable',
      'env var',
      'migration',
      'rollback',
      'infrastructure',
      'monitoring',
      'backup',
      'observability',
      'terraform',
      'dns',
    ],
    required: 'DEPLOYMENT, OPERATIONS, SECURITY if data/secrets are involved, rollback plan, owner approval.',
  },
  {
    level: 'Level 3',
    priority: 3,
    keywords: [
      'auth',
      'authentication',
      'authorization',
      'oauth',
      'jwt',
      'rbac',
      'rls',
      'supabase',
      'service role',
      'stripe',
      'payment',
      'invoice',
      'billing',
      'webhook',
      'secret',
      'token',
      'private data',
      'pii',
      'customer data',
      'ai',
      'llm',
      'rag',
      'agent',
      'openai',
      'prompt',
      'embedding',
      'vector',
      'document access',
    ],
    required: 'SPEC, ARCHITECTURE, SECURITY, TASKS, TESTING, owner approval, ADR if decision-level.',
  },
  {
    level: 'Level 2',
    priority: 2,
    keywords: [
      'user flow',
      'dashboard',
      'client area',
      'admin',
      'messages',
      'notifications',
      'documents',
      'workflow',
      'api response',
      'endpoint behavior',
      'project behavior',
      'product behavior',
    ],
    required: 'Product-specific SPEC, TASKS, TESTING, architecture review if structure changes.',
  },
  {
    level: 'Level 1',
    priority: 1,
    keywords: ['fix', 'bug', 'style', 'component', 'layout', 'copy', 'ui', 'spacing', 'refactor', 'cleanup'],
    required: 'Scope note, AGENTS.md, relevant docs, allowed/forbidden files, validation.',
  },
]

const DEFAULT_MATCH = {
  level: 'Level 0',
  priority: 0,
  matchedKeywords: [],
  required: 'Clear scope, diff review, no source-critical/security/data/deployment impact.',
}

export function classifyChange({
  description,
  files = [],
  target,
  configPath = null,
  minimumLevel = 'Level 0',
  minimumLevelReason = null,
}) {
  const normalized = description.toLowerCase()
  const configState = loadConfig(target, configPath)
  const pathMatches = matchRiskPaths(files, configState.config.riskPaths)
  const matches = LEVEL_RULES.map((rule) => ({
    ...rule,
    matchedKeywords: rule.keywords.filter((keyword) => normalized.includes(keyword)),
  }))
    .filter((rule) => rule.matchedKeywords.length > 0)
    .sort((a, b) => b.priority - a.priority || b.matchedKeywords.length - a.matchedKeywords.length)

  const match = matches[0] || DEFAULT_MATCH
  const pathLevel = highestLevel(pathMatches.map((item) => item.minimumLevel))
  const estimatedLevel = highestLevel([match.level, pathLevel, minimumLevel])
  const levelRule = LEVEL_RULES.find((rule) => rule.level === estimatedLevel)
  const requiredArtifacts = Array.from(new Set(pathMatches.flatMap((item) => item.requiredArtifacts)))
  const minimumRequiredGovernance = levelRule?.required || match.required
  let classificationReason = 'Description keywords determined the estimated level.'
  if (levelPriority(minimumLevel) > levelPriority(match.level) && levelPriority(minimumLevel) > levelPriority(pathLevel)) {
    classificationReason = minimumLevelReason || 'A caller-provided minimum raised the estimated level.'
  } else if (levelPriority(pathLevel) > levelPriority(match.level)) {
    classificationReason = 'Configured risk path raised the estimated level.'
  }

  return {
    description,
    target,
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
    files,
    estimatedLevel,
    minimumRequiredGovernance,
    requiredArtifacts,
    classificationReason,
    matchedKeywords: match.matchedKeywords,
    pathMatches,
    matches: matches.map((item) => ({
      level: item.level,
      matchedKeywords: item.matchedKeywords,
    })),
    note: 'Final classification must be confirmed by repository context and actual impact.',
  }
}
