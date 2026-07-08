import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { loadConfig } from './config.mjs'
import { inspectGit } from './git.mjs'

const AI_GOVERNANCE_PATHS = [
  'AGENTS.md',
  '.github/copilot-instructions.md',
  '.cursor/rules',
  '.windsurfrules',
  '.claude',
  '.codex',
  'skills',
  'prompts',
  'ai',
  'docs/AI_AGENT_SECURITY.md',
]

const AI_READINESS_SURFACES = [
  {
    kind: 'agent-instructions',
    paths: ['AGENTS.md', '.github/copilot-instructions.md', '.cursor/rules', '.windsurfrules', '.claude', '.codex'],
  },
  {
    kind: 'agent-skills-and-prompts',
    paths: ['agents', 'skills', 'prompts', 'ai'],
  },
  {
    kind: 'rag-code',
    paths: ['rag', 'retrieval', 'retrievers', 'vector', 'vectors', 'src/rag', 'backend/rag'],
    manifestIndicators: ['langchain', 'llama-index', 'llamaindex', '@langchain/core', '@langchain/openai'],
  },
  {
    kind: 'embeddings',
    paths: ['embeddings', 'embedding', 'src/embeddings', 'backend/embeddings'],
    manifestIndicators: ['tiktoken', '@dqbd/tiktoken', 'sentence-transformers'],
  },
  {
    kind: 'ai-tools',
    paths: ['tools', 'agent_tools', 'ai-tools', 'src/tools', 'backend/tools'],
  },
  {
    kind: 'provider-sdks',
    paths: [],
    manifestIndicators: [
      'openai',
      '@openai/agents',
      '@openai/realtime-api-beta',
      'ai',
      'anthropic',
      '@anthropic-ai/sdk',
      '@google/generative-ai',
      'cohere',
      'cohere-ai',
      'mistralai',
      '@mistralai/mistralai',
      'groq',
      'groq-sdk',
    ],
  },
  {
    kind: 'vector-stores',
    paths: ['chroma', 'chromadb', 'vectorstore', 'vectorstores', 'qdrant', 'pinecone', 'weaviate'],
    manifestIndicators: [
      'chromadb',
      'chroma',
      '@pinecone-database/pinecone',
      'pinecone-client',
      'qdrant-client',
      '@qdrant/js-client-rest',
      'weaviate-client',
      'faiss-cpu',
      'pgvector',
    ],
  },
  {
    kind: 'automation-folders',
    paths: ['n8n', '.n8n', 'automations', 'automation', 'workflows', 'zapier', 'make'],
    manifestIndicators: ['n8n', '@n8n_io/n8n-workflow'],
  },
  {
    kind: 'ai-security-docs',
    paths: ['docs/AI_AGENT_SECURITY.md'],
  },
]

const AI_READINESS_GOVERNANCE_ARTIFACTS = [
  {
    key: 'guardrails',
    artifacts: ['docs/AI_GUARDRAILS.md', 'docs/AI_AGENT_SECURITY.md'],
    purpose: 'Prompt injection, tool injection, output validation, and stop conditions.',
  },
  {
    key: 'data-classification',
    artifacts: ['docs/DATA_CLASSIFICATION.md', 'docs/SECURITY.md'],
    purpose: 'PII, private data, regulated data, and redaction policy.',
  },
  {
    key: 'cost-latency',
    artifacts: ['docs/COST_LATENCY_BUDGET.md', 'docs/OPERATIONS.md'],
    purpose: 'Token budget, provider cost budget, latency SLOs, fallback, and throttling expectations.',
  },
  {
    key: 'prompt-injection-tests',
    artifacts: ['docs/PROMPT_INJECTION_TESTS.md', 'docs/TESTING.md'],
    purpose: 'Adversarial prompts, indirect prompt injection, context poisoning, and regression coverage.',
  },
  {
    key: 'ai-evals',
    artifacts: ['docs/AI_EVALS.md', 'docs/TESTING.md'],
    purpose: 'Quality, safety, groundedness, refusal, and regression evaluation expectations.',
  },
  {
    key: 'tool-security',
    artifacts: ['docs/TOOL_REGISTRY.md', 'docs/AI_AGENT_SECURITY.md'],
    purpose: 'Tool authorization, allowed parameters, forbidden operations, approvals, and audit logging.',
  },
]

function inspectPath(target, artifact) {
  const fullPath = join(target, artifact)

  if (!existsSync(fullPath)) {
    return {
      artifact,
      currentState: 'missing',
      installAction: 'create',
      message: 'Would create this PSDM artifact.',
    }
  }

  const stat = statSync(fullPath)
  if (stat.isDirectory()) {
    return {
      artifact,
      currentState: 'directory',
      installAction: 'skip',
      message: 'Directory already exists; init would not overwrite it.',
    }
  }

  if (stat.size === 0) {
    return {
      artifact,
      currentState: 'empty',
      installAction: 'skip',
      message: 'File exists but is empty; init would not overwrite it.',
    }
  }

  return {
    artifact,
    currentState: 'present',
    installAction: 'skip',
    message: 'File already exists; init would not overwrite it.',
  }
}

function existingPaths(target, paths) {
  return paths.filter((path) => existsSync(join(target, path)))
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readTextIfExists(target, path) {
  const fullPath = join(target, path)
  if (!existsSync(fullPath)) {
    return null
  }

  const stat = statSync(fullPath)
  if (stat.isDirectory()) {
    return null
  }

  return readFileSync(fullPath, 'utf8')
}

function isPsdmManagedGovernancePath(target, path) {
  if (path !== 'AGENTS.md') {
    return false
  }

  const content = readTextIfExists(target, path)
  return Boolean(
    content
    && content.includes('Method: `PTECH SPEC-DRIVEN METHOD`')
    && content.includes('Artifact Type: `AI Agent Governance`'),
  )
}

function packageJsonDependencies(target) {
  const content = readTextIfExists(target, 'package.json')
  if (!content) {
    return []
  }

  try {
    const parsed = JSON.parse(content)
    return Object.keys({
      ...(parsed.dependencies || {}),
      ...(parsed.devDependencies || {}),
      ...(parsed.peerDependencies || {}),
      ...(parsed.optionalDependencies || {}),
    })
  } catch {
    return []
  }
}

function manifestIndicatorMatches(target, indicators = []) {
  if (indicators.length === 0) {
    return []
  }

  const normalizedIndicators = indicators.map((indicator) => indicator.toLowerCase())
  const packageMatches = packageJsonDependencies(target)
    .filter((dependency) => normalizedIndicators.includes(dependency.toLowerCase()))
    .map((dependency) => `package.json:${dependency}`)
  const textManifests = ['requirements.txt', 'pyproject.toml', 'Pipfile']
  const textIndicators = indicators.filter((indicator) => indicator.length >= 3)
  const textMatches = textManifests.flatMap((manifest) => {
    const content = readTextIfExists(target, manifest)
    if (!content) {
      return []
    }

    const normalizedContent = content.toLowerCase()
    return textIndicators
      .filter((indicator) => {
        const packagePattern = new RegExp(`(^|[^A-Za-z0-9_@/.-])${escapeRegex(indicator.toLowerCase())}([^A-Za-z0-9_@/.-]|$)`)
        return packagePattern.test(normalizedContent)
      })
      .map((indicator) => `${manifest}:${indicator}`)
  })

  return Array.from(new Set([...packageMatches, ...textMatches]))
}

function detectAiReadiness(target, aiGovernance) {
  const surfaces = AI_READINESS_SURFACES.map((surface) => {
    const detected = Array.from(new Set([
      ...existingPaths(target, surface.paths || []),
      ...manifestIndicatorMatches(target, surface.manifestIndicators || []),
    ]))

    return {
      kind: surface.kind,
      detected,
      status: detected.length > 0 ? 'detected' : 'not_detected',
    }
  })
  const detectedSurfaceCount = surfaces.filter((surface) => surface.detected.length > 0).length
  const governanceArtifacts = AI_READINESS_GOVERNANCE_ARTIFACTS.map((group) => {
    const existing = existingPaths(target, group.artifacts)
    const missing = group.artifacts.filter((artifact) => !existing.includes(artifact))

    return {
      key: group.key,
      purpose: group.purpose,
      existing,
      missing,
      status: existing.length > 0 ? 'present' : 'missing',
    }
  })
  const gaps = detectedSurfaceCount === 0
    ? []
    : governanceArtifacts
      .filter((group) => group.status === 'missing')
      .map((group) => ({
        key: group.key,
        message: `Missing AI readiness governance for ${group.key}.`,
        expectedArtifacts: group.missing,
      }))
  const status = detectedSurfaceCount === 0
    ? 'not_detected'
    : gaps.length > 0
      ? 'gaps_detected'
      : 'ready_for_review'

  return {
    version: 1,
    status,
    detectedSurfaceCount,
    surfaces,
    governanceArtifacts,
    gaps,
    recommendations: status === 'not_detected'
      ? [
        'No AI runtime surface was detected by the initial readiness contract.',
        'Re-run psdm audit after adding agents, RAG, prompts, tools, provider SDKs, or vector stores.',
      ]
      : [
        'Review AI readiness gaps before relying on runtime AI behavior.',
        'Document guardrails, data classification, cost and latency budgets, prompt-injection tests, evals, and tool security.',
        ...aiGovernance.recommendations,
      ],
    note: 'This is the stable AI readiness audit contract. Deeper code-level semantic detection, eval discovery, and observability signals will be added in later increments.',
  }
}

export function detectAiGovernance(target) {
  const existing = existingPaths(target, AI_GOVERNANCE_PATHS)
    .filter((path) => !isPsdmManagedGovernancePath(target, path))
  const hasExisting = existing.length > 0

  return {
    existing,
    adoptionMode: hasExisting ? 'integrate' : 'initialize',
    wouldSkip: existing.filter((path) => path === 'AGENTS.md'),
    wouldCreate: hasExisting ? ['docs/PSDM_ADOPTION.md'] : [],
    risks: hasExisting
      ? [
        'Existing AI instructions may conflict with PSDM governance rules.',
        'Existing skill or prompt files may define tool behavior that needs security review.',
      ]
      : [],
    recommendations: hasExisting
      ? [
        'Review existing AI governance files before running psdm init.',
        'Document the integration plan before changing agent instructions.',
        'Do not overwrite existing agent, Copilot, Cursor, Claude, Codex, skill, or prompt instructions.',
      ]
      : [],
  }
}

function detectProjectSignals(target) {
  const entries = existsSync(target)
    ? readdirSync(target, { withFileTypes: true }).map((entry) => entry.name)
    : []
  const hasAny = (names) => names.some((name) => entries.includes(name))

  return {
    packageManager: hasAny(['package.json', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']),
    python: hasAny(['pyproject.toml', 'requirements.txt', 'Pipfile', 'poetry.lock']),
    docker: hasAny(['Dockerfile', 'docker-compose.yml', 'compose.yml']),
    githubActions: existsSync(join(target, '.github', 'workflows')),
    existingDocs: existsSync(join(target, 'docs')),
    existingAgents: existsSync(join(target, 'AGENTS.md')),
    existingAiGovernance: detectAiGovernance(target).existing.length > 0,
  }
}

function summarizePros(results, configWillBeCreated, aiGovernance) {
  const pros = [
    'Adds explicit governance artifacts without overwriting existing files.',
    'Creates a repeatable baseline for AI-assisted development.',
    'Makes validation and reporting available for CI or local review.',
  ]

  if (configWillBeCreated) {
    pros.push('Adds local policy through psdm.config.json.')
  }

  if (results.some((item) => item.artifact === 'AGENTS.md' && item.installAction === 'create')) {
    pros.push('Adds AI-agent operating boundaries for the repository.')
  }

  if (aiGovernance.adoptionMode === 'integrate') {
    pros.push('Detects existing AI governance files so PSDM can be integrated without overwriting them.')
  }

  return pros
}

function summarizeCons(results, git, aiGovernance) {
  const cons = [
    'Adds governance files that the team must keep current.',
    'Freshly created templates require project-specific review before approval.',
  ]

  if (results.some((item) => item.currentState === 'empty')) {
    cons.push('Existing empty files are skipped, so they must be filled manually.')
  }

  if (git.isDirty) {
    cons.push('The working tree is dirty; review unrelated changes before initializing.')
  }

  for (const risk of aiGovernance.risks) {
    cons.push(risk)
  }

  return cons
}

function summarizeRecommendations(results, configState, git, aiGovernance) {
  const recommendations = []
  const missing = results.filter((item) => item.currentState === 'missing').length

  if (!configState.exists) {
    recommendations.push('Run psdm init only after reviewing the planned psdm.config.json policy.')
  }

  if (missing > 0) {
    recommendations.push(`Run psdm init to create ${missing} missing artifact/s, then fill project-specific content.`)
  } else {
    recommendations.push('Run psdm validate to check whether existing artifacts satisfy the method baseline.')
  }

  if (git.isDirty) {
    recommendations.push('Commit, stash, or review existing changes before adding PSDM artifacts.')
  }

  recommendations.push(...aiGovernance.recommendations)
  recommendations.push('Use psdm validate --json in CI after artifacts are filled.')
  return recommendations
}

export function buildAudit(target, options = {}) {
  const configState = loadConfig(target, options.configPath)
  const artifacts = options.feature
    ? configState.config.features.requiredArtifacts.map((artifact) =>
      join(configState.config.features.root, options.feature, artifact),
    )
    : configState.config.requiredArtifacts
  const artifactResults = artifacts.map((artifact) => inspectPath(target, artifact))
  const configResult = !options.feature && !options.configPath
    ? inspectPath(target, 'psdm.config.json')
    : null
  const results = configResult ? [...artifactResults, configResult] : artifactResults
  const git = inspectGit(target)
  const wouldCreate = results.filter((item) => item.installAction === 'create')
  const wouldSkip = results.filter((item) => item.installAction === 'skip')
  const aiGovernance = detectAiGovernance(target)
  const aiReadiness = detectAiReadiness(target, aiGovernance)

  return {
    command: 'audit',
    target,
    feature: options.feature || null,
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
    projectSignals: detectProjectSignals(target),
    aiGovernance,
    aiReadiness,
    git,
    summary: {
      total: results.length,
      wouldCreate: wouldCreate.length,
      wouldSkip: wouldSkip.length,
      existingEmpty: results.filter((item) => item.currentState === 'empty').length,
    },
    before: results.map(({ artifact, currentState }) => ({ artifact, currentState })),
    after: results.map(({ artifact, installAction }) => ({ artifact, installAction })),
    pros: summarizePros(results, Boolean(configResult && configResult.installAction === 'create'), aiGovernance),
    cons: summarizeCons(results, git, aiGovernance),
    recommendations: summarizeRecommendations(results, configState, git, aiGovernance),
    results,
  }
}

export function printAuditReport(report) {
  console.log(`PSDM audit: ${report.target}`)
  console.log('')
  console.log(`Config: ${report.config.exists ? report.config.path : 'default policy; psdm.config.json would be created'}`)
  console.log(`Git: ${report.git.isRepository ? report.git.branch || 'repository' : 'not a git repository'}${report.git.isDirty ? `, dirty (${report.git.changes.length} change/s)` : ''}`)
  console.log(`AI governance adoption: ${report.aiGovernance.adoptionMode}`)
  console.log(`AI readiness: ${report.aiReadiness.status}`)
  console.log('')
  console.log('Before')
  for (const item of report.before) {
    console.log(`- ${item.artifact}: ${item.currentState}`)
  }

  console.log('')
  console.log('After psdm init')
  for (const item of report.after) {
    console.log(`- ${item.artifact}: ${item.installAction}`)
  }

  console.log('')
  console.log('Existing AI governance')
  if (report.aiGovernance.existing.length === 0) {
    console.log('- none detected')
  } else {
    for (const item of report.aiGovernance.existing) {
      console.log(`- ${item}`)
    }
  }

  console.log('')
  console.log('AI readiness gaps')
  if (report.aiReadiness.gaps.length === 0) {
    console.log('- none detected')
  } else {
    for (const gap of report.aiReadiness.gaps) {
      console.log(`- ${gap.key}: ${gap.expectedArtifacts.join(', ')}`)
    }
  }

  console.log('')
  console.log('Pros')
  for (const pro of report.pros) {
    console.log(`- ${pro}`)
  }

  console.log('')
  console.log('Cons')
  for (const con of report.cons) {
    console.log(`- ${con}`)
  }

  console.log('')
  console.log('Recommendations')
  for (const recommendation of report.recommendations) {
    console.log(`- ${recommendation}`)
  }
}
