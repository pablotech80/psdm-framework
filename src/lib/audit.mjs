import { existsSync, readdirSync, statSync } from 'node:fs'
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

export function detectAiGovernance(target) {
  const existing = existingPaths(target, AI_GOVERNANCE_PATHS)
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
