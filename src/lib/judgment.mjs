import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { classifyChange } from './classifier.mjs'
import { inspectGit } from './git.mjs'

const GUIDANCE_MODES = ['learn', 'balanced', 'concise']

const MANIFESTS = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'Pipfile',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'build.gradle',
]

const SURFACE_RULES = [
  {
    id: 'authentication',
    signals: ['auth', 'authentication', 'authorization', 'oauth', 'login', 'session', 'jwt', 'rbac', 'rls'],
    decision: 'How identity, trust, and access should change without weakening existing users or authorization boundaries.',
    impacts: [
      ['identity', 'Identity representation or provider association may change.', 'medium'],
      ['authorization', 'Authentication changes can alter who reaches protected behavior.', 'medium'],
      ['sessions', 'Existing session creation, validation, or revocation may require compatibility review.', 'medium'],
      ['data', 'Account linking or identity uniqueness can become a durable data decision.', 'medium'],
      ['testing', 'Existing and new authentication paths need explicit regression evidence.', 'high'],
    ],
    assumptions: [
      'External identity attributes are trustworthy enough for the selected linking policy.',
      'Existing users and sessions remain compatible unless explicitly migrated.',
    ],
    options: [
      {
        id: 'preserve-and-link-explicitly',
        summary: 'Preserve the current identity path and require explicit authenticated linking.',
        benefits: ['Stronger identity assurance', 'Lower accidental account-merging risk'],
        costs: ['Additional user interaction', 'More linking-state behavior'],
        reversibility: 'medium',
      },
      {
        id: 'automatic-linking',
        summary: 'Automatically link identities using a shared verified attribute.',
        benefits: ['Lower user friction', 'Simpler first-login experience'],
        costs: ['Higher account-takeover and incorrect-linking risk'],
        reversibility: 'low',
      },
    ],
    recommendation: 'Preserve existing authentication and prefer explicit identity linking unless repository evidence proves automatic linking is safe.',
    ownerDecisions: [
      'Which existing authentication behavior must remain?',
      'What evidence is sufficient to link two identities?',
      'How should existing users and sessions behave during rollout?',
    ],
    learning: 'Authentication integration is often an identity and data-lifecycle decision, not only a provider configuration task.',
  },
  {
    id: 'data-change',
    signals: ['migration', 'schema', 'database', 'table', 'column', 'index', 'delete data', 'backfill'],
    decision: 'How stored data and compatibility should evolve while preserving recoverability.',
    impacts: [
      ['data-model', 'Persistent schema or data meaning may change.', 'high'],
      ['compatibility', 'Old code, data, or consumers may not understand the new shape.', 'medium'],
      ['deployment', 'Ordering, backfill, and rollback can affect release safety.', 'high'],
      ['testing', 'Migration and compatibility paths require evidence beyond unit behavior.', 'high'],
    ],
    assumptions: ['Existing data satisfies the new constraints.', 'The change can be rolled back or safely completed forward.'],
    options: [
      {
        id: 'expand-migrate-contract',
        summary: 'Use an additive expand/migrate/contract sequence.',
        benefits: ['Safer compatibility window', 'More reversible rollout'],
        costs: ['More steps', 'Temporary schema complexity'],
        reversibility: 'high',
      },
      {
        id: 'direct-migration',
        summary: 'Apply the final schema in one migration.',
        benefits: ['Simpler implementation'],
        costs: ['Higher deployment and rollback risk'],
        reversibility: 'low',
      },
    ],
    recommendation: 'Prefer an additive migration path when existing data or running consumers may overlap the release.',
    ownerDecisions: ['What data loss is unacceptable?', 'Must old and new versions coexist?', 'What is the recovery path if migration fails?'],
    learning: 'A schema change is an operational compatibility decision as well as a code change.',
  },
  {
    id: 'delivery',
    signals: ['deploy', 'deployment', 'pipeline', 'ci/cd', 'github action', 'docker', 'kubernetes', 'terraform', 'environment variable', 'rollback'],
    decision: 'How delivery behavior should change without creating an unowned availability or recovery risk.',
    impacts: [
      ['delivery', 'Build, promotion, or environment behavior may change.', 'high'],
      ['availability', 'A failure can affect all users rather than one code path.', 'medium'],
      ['secrets', 'Environment and workflow changes can cross credential boundaries.', 'medium'],
      ['rollback', 'Recovery must match the artifact and environment being changed.', 'high'],
    ],
    assumptions: ['The target environment and ownership are known.', 'Rollback evidence matches the new delivery path.'],
    options: [],
    recommendation: 'Keep the change reversible and require explicit post-deployment and rollback evidence before promotion.',
    ownerDecisions: ['Which environment is affected?', 'Who owns rollback?', 'What observable result proves the release is healthy?'],
    learning: 'Delivery changes expand the blast radius from code behavior to system availability and recovery.',
  },
  {
    id: 'ai-behavior',
    signals: ['ai', 'llm', 'agent', 'prompt', 'rag', 'embedding', 'vector', 'model', 'tool calling'],
    decision: 'Which authority, data, cost, and failure boundaries the AI behavior should have.',
    impacts: [
      ['behavior', 'Non-deterministic output can change user-visible behavior.', 'high'],
      ['data', 'Prompts, retrieval, or tools may expose private context.', 'medium'],
      ['authority', 'Tool access can turn generated output into external action.', 'medium'],
      ['cost-latency', 'Provider and context choices affect operational cost and response time.', 'medium'],
      ['evaluation', 'Examples and evals are needed to make quality claims reviewable.', 'high'],
    ],
    assumptions: ['Model output is treated as untrusted until validated.', 'Tool authority is narrower than the model capability.'],
    options: [],
    recommendation: 'Define data, authority, evaluation, and fallback boundaries before optimizing model capability.',
    ownerDecisions: ['What may the AI decide?', 'Which data may enter model context?', 'Which failures require human review?'],
    learning: 'AI capability is not the same as AI authority; the owner must define both separately.',
  },
  {
    id: 'dependency-change',
    signals: ['dependency', 'dependencies', 'library', 'package', 'sdk'],
    decision: 'Whether a new external dependency is justified by current behavior and acceptable maintenance, security, and delivery cost.',
    impacts: [
      ['dependency', 'The project supply chain and maintenance surface may change.', 'high'],
      ['security', 'A dependency adds transitive code and vulnerability exposure.', 'medium'],
      ['delivery', 'Install, build, bundle, or runtime behavior may change.', 'medium'],
      ['testing', 'The integration boundary and failure behavior require focused evidence.', 'medium'],
    ],
    assumptions: ['Existing platform or project capabilities cannot solve the need more simply.', 'The dependency is maintained and compatible with the runtime.'],
    options: [
      {
        id: 'use-existing-capability',
        summary: 'Use an existing project or platform capability.',
        benefits: ['No new supply-chain surface', 'Lower maintenance cost'],
        costs: ['May require more local implementation'],
        reversibility: 'high',
      },
      {
        id: 'add-focused-dependency',
        summary: 'Add a narrowly scoped dependency with an explicit integration boundary.',
        benefits: ['Faster implementation', 'Reuse maintained behavior'],
        costs: ['Supply-chain, update, and compatibility cost'],
        reversibility: 'medium',
      },
    ],
    recommendation: 'Prefer existing capabilities unless the dependency provides material, tested value that justifies its long-term supply-chain cost.',
    ownerDecisions: ['What capability is missing?', 'Why is this dependency preferable to existing project or platform behavior?', 'What maintenance and security cost is acceptable?'],
    learning: 'Adding a dependency is a long-term ownership decision, not only an implementation shortcut.',
  },
  {
    id: 'local-presentation',
    signals: ['copy', 'spacing', 'layout', 'style', 'readme', 'documentation', 'hero', 'color', 'typo'],
    decision: 'Whether the change is truly local and reversible or alters a public contract or distribution surface.',
    impacts: [
      ['presentation', 'Human-facing presentation is expected to change.', 'high'],
      ['distribution', 'Published assets or package documentation may require a new release.', 'low'],
    ],
    assumptions: ['No runtime, public API, configuration, or release behavior changes.'],
    options: [],
    recommendation: 'Keep the diff local, run focused rendering or packaging validation, and avoid adding governance artifacts.',
    ownerDecisions: [],
    learning: 'Low-risk work should stay lightweight; verify the actual distribution surface without manufacturing process.',
  },
]

function safeReadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function evidence(kind, source, summary) {
  return { kind, source, summary, confidence: 'deterministic' }
}

function collectManifestEvidence(target) {
  const results = []
  for (const manifest of MANIFESTS) {
    const path = join(target, manifest)
    if (!existsSync(path)) continue
    results.push(evidence('manifest', manifest, `${manifest} is present.`))
  }

  const packagePath = join(target, 'package.json')
  const packageJson = existsSync(packagePath) ? safeReadJson(packagePath) : null
  if (packageJson?.name) {
    results.push(evidence('project-identity', 'package.json:name', `Package name is ${packageJson.name}.`))
  }
  const scripts = Object.keys(packageJson?.scripts || {})
  if (scripts.length > 0) {
    results.push(evidence('validation-capability', 'package.json:scripts', `Available package scripts: ${scripts.sort().join(', ')}.`))
  }
  const dependencies = Object.keys({
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
  })
  if (dependencies.length > 0) {
    const sortedDependencies = dependencies.sort()
    const visible = sortedDependencies.slice(0, 20)
    const remaining = sortedDependencies.length - visible.length
    results.push(evidence(
      'dependency-set',
      'package.json',
      `Declared dependency names: ${visible.join(', ')}${remaining > 0 ? `, and ${remaining} more` : ''}.`,
    ))
  }
  return results
}

function collectStructureEvidence(target) {
  if (!existsSync(target)) return []
  const candidates = ['src', 'app', 'backend', 'frontend', 'api', 'tests', 'test', 'migrations', 'infra', '.github/workflows', 'docs', 'ADRs', 'AGENTS.md']
  return candidates
    .filter((path) => existsSync(join(target, path)))
    .map((path) => evidence(
      statSync(join(target, path)).isDirectory() ? 'repository-directory' : 'repository-file',
      path,
      `${path} is present.`,
    ))
}

function collectRequestedFileEvidence(target, files) {
  return files.map((file) => {
    const path = join(target, file)
    if (!existsSync(path)) {
      return evidence('requested-path', file, `${file} was supplied as expected scope but is not present.`)
    }
    const type = statSync(path).isDirectory() ? 'directory' : (extname(path) || 'file')
    return evidence('requested-path', file, `${file} exists as ${type}.`)
  })
}

function projectMode(target, observedEvidence) {
  if (!existsSync(target)) return 'greenfield'
  const entries = readdirSync(target).filter((entry) => entry !== '.git' && entry !== '.DS_Store')
  const hasImplementation = observedEvidence.some((item) => (
    item.kind === 'manifest'
    || (item.kind === 'repository-directory' && ['src', 'app', 'backend', 'frontend', 'api'].includes(item.source))
  ))
  return entries.length === 0 || !hasImplementation ? 'greenfield' : 'legacy'
}

function matchingRules(intent) {
  const normalized = intent.toLowerCase()
  return SURFACE_RULES.filter((rule) => rule.signals.some((signal) => {
    if (signal.includes(' ') || signal.includes('/')) {
      return normalized.includes(signal)
    }
    const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(normalized)
  }))
}

function unique(values) {
  return Array.from(new Set(values))
}

function buildInference(rules, files) {
  if (rules.length === 0) {
    const fileAreas = unique(files.map((file) => file.split('/')[0]).filter(Boolean))
    return {
      decision: 'The repository does not provide enough deterministic evidence to identify the technical decision underneath this intent.',
      affectedSurfaces: fileAreas.map((area) => ({
        surface: area,
        statement: `${area} was supplied as expected scope.`,
        confidence: 'low',
        epistemicStatus: 'inferred',
      })),
      assumptions: [],
      options: [],
      recommendation: 'Clarify expected behavior, forbidden scope, and validation before delegating implementation.',
      ownerDecisionsRequired: ['What observable behavior should change?', 'What must remain unchanged?'],
      learningPrinciples: ['Uncertainty should be reduced before code generation, not hidden behind a generic risk label.'],
      uncertainty: {
        level: 'high',
        reasons: ['No supported intent pattern matched; impact remains an explicit hypothesis.'],
      },
    }
  }

  return {
    decision: rules.map((rule) => rule.decision).join(' '),
    affectedSurfaces: rules.flatMap((rule) => rule.impacts.map(([surface, statement, confidence]) => ({
      surface,
      statement,
      confidence,
      epistemicStatus: 'inferred',
      rule: rule.id,
    }))),
    assumptions: unique(rules.flatMap((rule) => rule.assumptions)),
    options: rules.flatMap((rule) => rule.options),
    recommendation: rules.map((rule) => rule.recommendation).join(' '),
    ownerDecisionsRequired: unique(rules.flatMap((rule) => rule.ownerDecisions)),
    learningPrinciples: unique(rules.map((rule) => rule.learning)),
    uncertainty: {
      level: rules.length === 1 ? 'medium' : 'high',
      reasons: ['Impact is inferred from intent signals and repository evidence; code-level semantic analysis is not implemented in this increment.'],
    },
  }
}

export function buildJudgmentBrief({ target, intent, files = [], configPath = null, guidance = 'balanced' }) {
  if (!GUIDANCE_MODES.includes(guidance)) {
    throw new Error(`Unsupported guidance mode: ${guidance}. Expected learn, balanced, or concise.`)
  }

  const git = inspectGit(target)
  const observedEvidence = [
    evidence('repository-state', '.git', git.isRepository
      ? `Git repository on branch ${git.branch || 'DETACHED_HEAD'}; ${git.changes.length} working-tree change(s).`
      : 'Target is not a Git repository.'),
    ...collectManifestEvidence(target),
    ...collectStructureEvidence(target),
    ...collectRequestedFileEvidence(target, files),
  ]
  const rules = matchingRules(intent)
  const classification = classifyChange({ description: intent, files, target, configPath })

  return {
    version: 1,
    command: 'impact',
    target,
    guidance,
    intent: {
      statement: intent,
      suppliedFiles: files,
      epistemicStatus: 'owner_input',
    },
    projectContext: {
      mode: projectMode(target, observedEvidence),
      repository: git.isRepository,
      branch: git.branch,
      initializedWithPsdm: existsSync(join(target, 'psdm.config.json')),
      contextComplete: false,
    },
    observedEvidence,
    judgment: buildInference(rules, files),
    ownerDecision: {
      status: 'required',
      value: null,
      authority: 'developer_only',
      note: 'Riscala may request or record an owner decision but cannot create, infer, approve, or simulate one.',
    },
    legacyClassification: {
      estimatedLevel: classification.estimatedLevel,
      matchedKeywords: classification.matchedKeywords,
      pathMatches: classification.pathMatches,
      note: 'Legacy classification is supporting evidence, not the complete technical judgment.',
    },
  }
}

function printList(title, values, formatter = (value) => value) {
  if (values.length === 0) return
  console.log(`\n${title}`)
  for (const value of values) console.log(`- ${formatter(value)}`)
}

export function printJudgmentBrief(report) {
  const concise = report.guidance === 'concise'
  const learn = report.guidance === 'learn'
  console.log('Riscala Judgment Brief')
  console.log(`Guidance: ${report.guidance}`)
  console.log(`Context: ${report.projectContext.mode} · ${report.projectContext.repository ? 'Git repository' : 'no Git repository'} · PSDM init ${report.projectContext.initializedWithPsdm ? 'detected' : 'not required'}`)
  console.log(`\nIntent\n${report.intent.statement}`)

  if (!concise) {
    printList('Observed facts', report.observedEvidence, (item) => `${item.summary} [${item.source}]`)
  }

  console.log(`\nDecision underneath\n${report.judgment.decision}`)
  printList('Likely impact', report.judgment.affectedSurfaces, (item) => `${item.surface}: ${item.statement} (${item.confidence} confidence)`)
  if (!concise) printList('Assumptions to challenge', report.judgment.assumptions)
  if (!concise && report.judgment.options.length > 0) {
    printList('Options', report.judgment.options, (item) => `${item.id}: ${item.summary} Reversibility: ${item.reversibility}.`)
  }
  console.log(`\nRecommendation (advisory)\n${report.judgment.recommendation}`)
  printList('Developer decisions required', report.judgment.ownerDecisionsRequired)
  console.log(`\nUncertainty\n${report.judgment.uncertainty.level}: ${report.judgment.uncertainty.reasons.join(' ')}`)
  if (learn) printList('Reasoning to reuse', report.judgment.learningPrinciples)
  console.log(`\nOwner authority\n${report.ownerDecision.note}`)
}
