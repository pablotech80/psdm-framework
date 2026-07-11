import { relative } from 'node:path'
import { realpathSync } from 'node:fs'
import { buildJudgmentBrief } from './judgment.mjs'
import { inspectStagedChange } from './inspect.mjs'
import { inspectRepositoryIdentity, readGitTextFile } from './git.mjs'

const SURFACE_PATHS = [
  { surface: 'delivery', patterns: [/^\.github\/workflows\//, /^infra\//, /(^|\/)Dockerfile$/, /(^|\/)docker-compose/, /(^|\/)terraform\//, /(^|\/)k8s\//] },
  { surface: 'schema', patterns: [/(^|\/)migrations?\//, /(^|\/)schema\./, /(^|\/)models?\//] },
  { surface: 'authentication', patterns: [/(^|\/)(auth|authentication|authorization|sessions?)(\/|\.|$)/] },
  { surface: 'api-contract', patterns: [/(^|\/)api\//] },
  { surface: 'user-flow', patterns: [/(^|\/)(contact|contacto|leads?|forms?)(\/|\.|-)/] },
  { surface: 'ai-behavior', patterns: [/(^|\/)(ai|agents?|prompts?|rag|embeddings?|tools?)(\/|\.|$)/] },
  { surface: 'configuration', patterns: [/(^|\/)(config|configuration)(\/|\.|$)/, /(^|\/)\.env(\.|$)/] },
  { surface: 'dependency', patterns: [/(^|\/)package\.json$/, /(^|\/)pyproject\.toml$/, /(^|\/)requirements\.txt$/, /(^|\/)go\.mod$/, /(^|\/)Cargo\.toml$/] },
  { surface: 'test', patterns: [/(^|\/)(tests?|__tests__)(\/|\.|$)/, /\.(test|spec)\.[^/]+$/] },
  { surface: 'documentation', patterns: [/(^|\/)docs?\//, /(^|\/)README\.md$/i, /(^|\/)ADRs?\//] },
]

const EXPECTED_RULE_SURFACES = {
  authentication: ['authentication', 'schema', 'configuration', 'test'],
  'data-change': ['schema', 'delivery', 'test'],
  delivery: ['delivery', 'configuration', 'test'],
  'ai-behavior': ['ai-behavior', 'configuration', 'dependency', 'test'],
  'dependency-change': ['dependency', 'delivery', 'test'],
  'lead-intake': ['user-flow', 'api-contract', 'schema', 'test'],
  'local-presentation': ['documentation', 'test'],
}

function parseJson(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function packageDependencies(value) {
  const packageJson = parseJson(value)
  if (!packageJson) return null
  return new Set(Object.keys({
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.peerDependencies || {}),
    ...(packageJson.optionalDependencies || {}),
  }))
}

function dependencyDelta(target, stagedFiles) {
  if (!stagedFiles.includes('package.json')) return null
  const before = packageDependencies(readGitTextFile(target, 'head', 'package.json'))
  const after = packageDependencies(readGitTextFile(target, 'index', 'package.json'))
  if (!after) {
    return {
      status: 'unavailable',
      source: 'package.json',
      added: [],
      removed: [],
      note: 'Staged package.json could not be parsed as JSON.',
    }
  }
  if (!before) {
    return {
      status: 'baseline_unavailable',
      source: 'package.json',
      added: [...after].sort(),
      removed: [],
      note: 'HEAD package.json is unavailable; staged dependencies are reported as additions against an unknown baseline.',
    }
  }
  return {
    status: 'compared',
    source: 'package.json',
    added: [...after].filter((item) => !before.has(item)).sort(),
    removed: [...before].filter((item) => !after.has(item)).sort(),
    note: 'Dependency names were compared between HEAD and the Git index.',
  }
}

function surfacesForFile(path) {
  return SURFACE_PATHS
    .filter((entry) => entry.patterns.some((pattern) => pattern.test(path)))
    .map((entry) => entry.surface)
}

function expectedSurfaceSet(brief) {
  const rules = new Set(brief.judgment.affectedSurfaces.map((item) => item.rule).filter(Boolean))
  return new Set([...rules].flatMap((rule) => EXPECTED_RULE_SURFACES[rule] || []))
}

function unique(values) {
  return Array.from(new Set(values))
}

export function buildChangeEnvelope({ intent, expectedFiles, brief }) {
  const expectedSurfaces = [...expectedSurfaceSet(brief)].sort()
  return {
    version: 1,
    intent,
    expectedScope: {
      files: unique(expectedFiles).sort(),
      source: 'cli_input',
    },
    forbiddenScope: {
      files: [],
      source: 'not_supplied',
    },
    expectedSurfaces,
    requiredEvidence: brief.judgment.affectedSurfaces.some((item) => item.rule !== 'local-presentation')
      ? ['focused validation result', 'review of unexpected or expensive-to-reverse surfaces']
      : ['focused rendering, diff, or packaging validation when relevant'],
    authority: {
      source: 'cli_input',
      authorityVerified: false,
      note: 'CLI input is an execution expectation, not verified human approval or an owner decision.',
    },
    ownerDecision: {
      status: 'unverified',
      value: null,
      authority: 'developer_only',
    },
  }
}

export function buildDecisionReview({ target, intent, expectedFiles = [], configPath = null, guidance = 'balanced' }) {
  const repository = inspectRepositoryIdentity(target)
  const targetPrefix = repository
    ? relative(realpathSync(repository.root), realpathSync(target)).replaceAll('\\', '/')
    : ''
  const normalizedExpectedFiles = unique(expectedFiles.map((file) => {
    const normalized = file.replace(/^\.\//, '').replaceAll('\\', '/')
    return targetPrefix && normalized !== targetPrefix && !normalized.startsWith(`${targetPrefix}/`)
      ? `${targetPrefix}/${normalized}`
      : normalized
  }))
  const brief = buildJudgmentBrief({ target, intent, files: normalizedExpectedFiles, configPath, guidance })
  const envelope = buildChangeEnvelope({ intent, expectedFiles: normalizedExpectedFiles, brief })
  const staged = inspectStagedChange({ target, configPath })

  if (staged.decision !== 'CHANGE_REVIEW_REQUIRED') {
    return {
      version: 1,
      command: 'review',
      target,
      guidance,
      decision: staged.decision,
      advisory: true,
      brief,
      envelope,
      staged,
      verification: null,
    }
  }

  const stagedFiles = unique(staged.files).sort()
  const expectedSet = new Set(envelope.expectedScope.files)
  const actualSet = new Set(stagedFiles)
  const outsideExpectedScope = envelope.expectedScope.files.length === 0
    ? []
    : stagedFiles.filter((file) => !expectedSet.has(file))
  const expectedButNotStaged = envelope.expectedScope.files.filter((file) => !actualSet.has(file))
  const actualSurfaceEvidence = stagedFiles.flatMap((file) => (
    surfacesForFile(file).map((surface) => ({
      file,
      surface,
      epistemicStatus: 'observed',
      confidence: 'deterministic',
    }))
  ))
  const expectedSurfaces = new Set(envelope.expectedSurfaces)
  const unexpectedSurfaces = actualSurfaceEvidence.filter((item) => (
    !['test', 'documentation'].includes(item.surface)
    && !expectedSurfaces.has(item.surface)
  ))
  const dependencies = dependencyDelta(target, stagedFiles)
  const validation = {
    stagedTestFiles: stagedFiles.filter((file) => surfacesForFile(file).includes('test')),
    executionResults: [],
    status: 'not_supplied',
    note: 'Decision Review observes staged test files but does not infer that tests were executed.',
  }
  const deviations = [
    ...outsideExpectedScope.map((file) => ({
      kind: 'scope-drift',
      file,
      severity: 'review',
      statement: `${file} is staged outside the CLI-declared expected file scope.`,
    })),
    ...unexpectedSurfaces.map((item) => ({
      kind: 'unexpected-surface',
      file: item.file,
      surface: item.surface,
      severity: ['delivery', 'schema', 'authentication'].includes(item.surface) ? 'high' : 'review',
      statement: `${item.file} introduces observed ${item.surface} impact that was not expected from the intent model.`,
    })),
    ...expectedButNotStaged.map((file) => ({
      kind: 'expected-not-staged',
      file,
      severity: 'review',
      statement: `${file} was declared as expected scope but is not present in the staged implementation.`,
    })),
  ]
  if (dependencies?.added.length > 0 || dependencies?.removed.length > 0) {
    deviations.push({
      kind: 'dependency-change',
      file: 'package.json',
      severity: 'review',
      statement: `Dependency set changed: +${dependencies.added.join(', ') || 'none'}; -${dependencies.removed.join(', ') || 'none'}.`,
    })
  }

  const readiness = deviations.length > 0 ? 'developer_review_required' : 'scope_aligned_evidence_unverified'
  return {
    version: 1,
    command: 'review',
    target,
    guidance,
    decision: 'STAGED_DECISION_REVIEW_READY',
    advisory: true,
    brief,
    envelope,
    staged,
    verification: {
      expectedFiles: envelope.expectedScope.files,
      stagedFiles,
      outsideExpectedScope,
      expectedButNotStaged,
      observedSurfaces: actualSurfaceEvidence,
      unexpectedSurfaces,
      dependencyDelta: dependencies,
      validation,
      deviations,
      readiness,
      authority: {
        approval: false,
        ownerDecisionVerified: false,
        note: 'Readiness is advisory. This review does not approve, commit, or establish human authority.',
      },
    },
  }
}

function printList(title, values, formatter = (value) => value) {
  if (values.length === 0) return
  console.log(`\n${title}`)
  for (const value of values) console.log(`- ${formatter(value)}`)
}

export function printDecisionReview(report, options = {}) {
  const concise = report.guidance === 'concise'
  const learn = report.guidance === 'learn'
  const es = options.language === 'es'
  const deviationText = (item) => {
    if (!es) return `${item.kind}: ${item.statement}`
    if (item.kind === 'scope-drift') return `${item.kind}: ${item.file} está preparado fuera del alcance esperado.`
    if (item.kind === 'expected-not-staged') return `${item.kind}: ${item.file} se declaró como esperado pero no está preparado.`
    if (item.kind === 'unexpected-surface') return `${item.kind}: ${item.file} introduce impacto ${item.surface} no previsto.`
    return `${item.kind}: ${item.statement}`
  }
  console.log(es ? 'Revisión de decisión de Riscala' : 'Riscala Decision Review')
  console.log(`${es ? 'Detalle' : 'Guidance'}: ${report.guidance}`)
  console.log(`${es ? 'Decisión' : 'Decision'}: ${report.decision}`)
  console.log(es ? 'Autoridad: consultiva · decisión del propietario no verificada' : 'Authority: advisory · owner decision not verified')

  if (!report.verification) {
    console.log(`\n${es ? 'Estado' : 'State'}\n${report.staged.decision === 'NO_STAGED_CHANGES' ? (es ? 'No hay cambios preparados.' : 'No staged changes found.') : (es ? 'El destino no es un repositorio Git.' : 'Target is not a Git repository.')}`)
    return
  }

  console.log(`\n${es ? 'Objetivo' : 'Intent'}\n${report.envelope.intent}`)
  if (!concise) {
    printList(es ? 'Archivos esperados' : 'Expected files', report.verification.expectedFiles)
    printList(es ? 'Archivos preparados' : 'Staged files', report.verification.stagedFiles)
    printList(es ? 'Superficies observadas' : 'Observed surfaces', report.verification.observedSurfaces, (item) => `${item.surface}: ${item.file}`)
  }
  printList(es ? 'Desviaciones' : 'Deviations', report.verification.deviations, deviationText)
  if (report.verification.dependencyDelta) {
    const delta = report.verification.dependencyDelta
    console.log(`\nDependencies\nAdded: ${delta.added.join(', ') || 'none'} · Removed: ${delta.removed.join(', ') || 'none'}`)
  }
  const validationNote = es
    ? 'La revisión observa archivos de prueba preparados, pero no supone que las pruebas se hayan ejecutado.'
    : report.verification.validation.note
  console.log(`\n${es ? 'Evidencia de validación' : 'Validation evidence'}\n${report.verification.validation.status}: ${validationNote}`)
  console.log(`\n${es ? 'Recomendación' : 'Readiness recommendation'}\n${report.verification.readiness}`)
  if (learn) printList(es ? 'Razonamiento reutilizable' : 'Reasoning to reuse', report.brief.judgment.learningPrinciples)
  const authorityNote = es
    ? 'La recomendación es consultiva. Esta revisión no aprueba, confirma ni establece autoridad humana.'
    : report.verification.authority.note
  console.log(`\n${es ? 'Autoridad del propietario' : 'Owner authority'}\n${authorityNote}`)
}
