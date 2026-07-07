const LEVEL_RULES = [
  {
    level: 'Level 4',
    priority: 4,
    keywords: ['deploy', 'deployment', 'docker', 'vps', 'ci/cd', 'pipeline', 'environment variable', 'migration', 'rollback', 'infrastructure', 'monitoring', 'backup'],
    required: 'DEPLOYMENT, OPERATIONS, SECURITY if data/secrets are involved, rollback plan, owner approval.',
  },
  {
    level: 'Level 3',
    priority: 3,
    keywords: ['auth', 'authorization', 'rls', 'supabase', 'service role', 'stripe', 'payment', 'webhook', 'secret', 'token', 'private data', 'ai', 'openai', 'prompt', 'document access'],
    required: 'SPEC, ARCHITECTURE, SECURITY, TASKS, TESTING, owner approval, ADR if decision-level.',
  },
  {
    level: 'Level 2',
    priority: 2,
    keywords: ['user flow', 'dashboard', 'client area', 'admin', 'messages', 'notifications', 'documents', 'project behavior', 'product behavior'],
    required: 'Product-specific SPEC, TASKS, TESTING, architecture review if structure changes.',
  },
  {
    level: 'Level 1',
    priority: 1,
    keywords: ['fix', 'bug', 'style', 'component', 'layout', 'copy', 'ui', 'spacing'],
    required: 'Scope note, AGENTS.md, relevant docs, allowed/forbidden files, validation.',
  },
]

export async function classifyCommand(args) {
  const description = args.join(' ').trim()

  if (!description) {
    console.error('Usage: psdm classify "<change description>"')
    return { exitCode: 1 }
  }

  const normalized = description.toLowerCase()
  const matches = LEVEL_RULES.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  ).sort((a, b) => b.priority - a.priority)

  const match = matches[0] || {
    level: 'Level 0',
    required: 'Clear scope, diff review, no source-critical/security/data/deployment impact.',
  }

  console.log(`Change description: ${description}`)
  console.log(`Estimated level: ${match.level}`)
  console.log(`Minimum required governance: ${match.required}`)
  console.log('Note: final classification must be confirmed by repository context and actual impact.')

  return { exitCode: 0 }
}
