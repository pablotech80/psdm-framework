import { parseArgs, printJson } from '../lib/args.mjs'

const LEVEL_RULES = [
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

export async function classifyCommand(args) {
  const { options, positional } = parseArgs(args)
  const description = positional.join(' ').trim()

  if (!description) {
    console.error('Usage: psdm classify "<change description>"')
    return { exitCode: 1 }
  }

  const normalized = description.toLowerCase()
  const matches = LEVEL_RULES.map((rule) => ({
    ...rule,
    matchedKeywords: rule.keywords.filter((keyword) => normalized.includes(keyword)),
  }))
    .filter((rule) => rule.matchedKeywords.length > 0)
    .sort((a, b) => b.priority - a.priority || b.matchedKeywords.length - a.matchedKeywords.length)

  const match = matches[0] || {
    level: 'Level 0',
    priority: 0,
    matchedKeywords: [],
    required: 'Clear scope, diff review, no source-critical/security/data/deployment impact.',
  }

  const payload = {
    command: 'classify',
    description,
    estimatedLevel: match.level,
    minimumRequiredGovernance: match.required,
    matchedKeywords: match.matchedKeywords,
    matches: matches.map((item) => ({
      level: item.level,
      matchedKeywords: item.matchedKeywords,
    })),
    note: 'Final classification must be confirmed by repository context and actual impact.',
  }

  if (options.json) {
    printJson(payload)
    return { exitCode: 0 }
  }

  console.log(`Change description: ${description}`)
  console.log(`Estimated level: ${match.level}`)
  console.log(`Minimum required governance: ${match.required}`)
  if (match.matchedKeywords.length > 0) {
    console.log(`Matched signals: ${match.matchedKeywords.join(', ')}`)
  }
  console.log('Note: final classification must be confirmed by repository context and actual impact.')

  return { exitCode: 0 }
}
