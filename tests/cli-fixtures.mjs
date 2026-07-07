import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = resolve(repoRoot, 'bin/psdm.mjs')

function run(args, options = {}) {
  try {
    return execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    if (options.allowFailure && typeof error.stdout === 'string') {
      return error.stdout
    }

    throw error
  }
}

function runJson(args, options = {}) {
  return JSON.parse(run(args, options))
}

function existingProject() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-existing-'))
  mkdirSync(resolve(target, 'docs'))
  writeFileSync(resolve(target, 'package.json'), '{"name":"existing-app"}\n')
  writeFileSync(resolve(target, 'docs/README.md'), '# Existing docs\n')
  return target
}

function testAuditExistingProject() {
  const target = existingProject()
  const report = runJson(['audit', target, '--json'])

  assert.equal(report.command, 'audit')
  assert.equal(report.config.exists, false)
  assert.equal(report.projectSignals.packageManager, true)
  assert.equal(report.projectSignals.existingDocs, true)
  assert.equal(report.aiReadiness.version, 1)
  assert.equal(report.aiReadiness.status, 'not_detected')
  assert.equal(report.aiReadiness.detectedSurfaceCount, 0)
  assert.deepEqual(report.aiReadiness.gaps, [])
  assert.equal(report.summary.wouldCreate, 12)
  assert.equal(report.summary.wouldSkip, 0)
  assert.ok(report.pros.some((item) => item.includes('without overwriting')))
  assert.ok(report.cons.some((item) => item.includes('must keep current')))
  assert.ok(report.recommendations.some((item) => item.includes('psdm init')))
}

function testAuditDetectsExistingAiGovernance() {
  const target = existingProject()
  mkdirSync(resolve(target, '.github'), { recursive: true })
  mkdirSync(resolve(target, '.cursor', 'rules'), { recursive: true })
  mkdirSync(resolve(target, 'skills', 'deploy'), { recursive: true })
  writeFileSync(resolve(target, 'AGENTS.md'), '# Existing agent rules\n')
  writeFileSync(resolve(target, '.github', 'copilot-instructions.md'), '# Copilot rules\n')
  writeFileSync(resolve(target, 'skills', 'deploy', 'SKILL.md'), '# Deploy skill\n')

  const report = runJson(['audit', target, '--json'])
  const output = run(['audit', target])

  assert.equal(report.projectSignals.existingAiGovernance, true)
  assert.equal(report.aiGovernance.adoptionMode, 'integrate')
  assert.ok(report.aiGovernance.existing.includes('AGENTS.md'))
  assert.ok(report.aiGovernance.existing.includes('.github/copilot-instructions.md'))
  assert.ok(report.aiGovernance.existing.includes('.cursor/rules'))
  assert.ok(report.aiGovernance.existing.includes('skills'))
  assert.deepEqual(report.aiGovernance.wouldCreate, ['docs/PSDM_ADOPTION.md'])
  assert.equal(report.aiReadiness.status, 'gaps_detected')
  assert.ok(report.aiReadiness.detectedSurfaceCount >= 2)
  assert.ok(report.aiReadiness.surfaces.some((item) => (
    item.kind === 'agent-instructions'
    && item.detected.includes('AGENTS.md')
  )))
  assert.ok(report.aiReadiness.governanceArtifacts.some((item) => (
    item.key === 'cost-latency'
    && item.status === 'missing'
  )))
  assert.ok(report.aiReadiness.gaps.some((item) => item.key === 'cost-latency'))
  assert.ok(report.cons.some((item) => item.includes('Existing AI instructions may conflict')))
  assert.ok(report.recommendations.some((item) => item.includes('Do not overwrite existing agent')))
  assert.match(output, /AI governance adoption: integrate/)
  assert.match(output, /AI readiness: gaps_detected/)
  assert.match(output, /AI readiness gaps/)
  assert.match(output, /Existing AI governance/)
}

function testAuditDetectsAiRuntimeSurfaces() {
  const target = existingProject()
  mkdirSync(resolve(target, 'rag'), { recursive: true })
  mkdirSync(resolve(target, 'prompts'), { recursive: true })
  mkdirSync(resolve(target, 'n8n'), { recursive: true })
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'ai-runtime-app',
    dependencies: {
      openai: '^4.0.0',
      langchain: '^0.3.0',
      chromadb: '^1.0.0',
    },
  }))
  writeFileSync(resolve(target, 'requirements.txt'), 'tiktoken==0.7.0\n')

  const report = runJson(['audit', target, '--json'])
  const surface = (kind) => report.aiReadiness.surfaces.find((item) => item.kind === kind)

  assert.equal(report.aiReadiness.status, 'gaps_detected')
  assert.ok(surface('agent-skills-and-prompts').detected.includes('prompts'))
  assert.ok(surface('rag-code').detected.includes('rag'))
  assert.ok(surface('rag-code').detected.includes('package.json:langchain'))
  assert.ok(surface('embeddings').detected.includes('requirements.txt:tiktoken'))
  assert.ok(surface('provider-sdks').detected.includes('package.json:openai'))
  assert.ok(surface('vector-stores').detected.includes('package.json:chromadb'))
  assert.ok(surface('automation-folders').detected.includes('n8n'))
  assert.ok(report.aiReadiness.gaps.some((item) => item.key === 'guardrails'))
}

function testInitCreatesAdoptionPlanForExistingAiGovernance() {
  const target = existingProject()
  mkdirSync(resolve(target, '.github'), { recursive: true })
  writeFileSync(resolve(target, 'AGENTS.md'), '# Existing agent rules\n')
  writeFileSync(resolve(target, '.github', 'copilot-instructions.md'), '# Copilot rules\n')

  const output = run(['init', target])

  assert.match(output, /CREATED docs\/PSDM_ADOPTION\.md/)
  assert.equal(existsSync(resolve(target, 'docs', 'PSDM_ADOPTION.md')), true)
  assert.match(readFileSync(resolve(target, 'docs', 'PSDM_ADOPTION.md'), 'utf8'), /Existing AI Governance/)
}

function testInitDryRunDoesNotWrite() {
  const target = existingProject()
  const output = run(['init', target, '--dry-run'])

  assert.match(output, /Before/)
  assert.match(output, /After psdm init/)
  assert.match(output, /AGENTS\.md: create/)
  assert.equal(existsSync(resolve(target, 'AGENTS.md')), false)
}

function testAdrCreatesDecisionRecord() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-adr-'))
  const report = runJson([
    'adr',
    'Adopt CI change level enforcement',
    '--target',
    target,
    '--date',
    '2026-07-08',
    '--json',
  ])
  const second = runJson([
    'adr',
    'Adopt CI change level enforcement',
    '--target',
    target,
    '--date',
    '2026-07-08',
    '--json',
  ])

  assert.equal(report.command, 'adr')
  assert.equal(report.status, 'created')
  assert.equal(report.relativePath, 'ADRs/2026-07-08-adopt-ci-change-level-enforcement.md')
  assert.equal(second.status, 'exists')
  assert.equal(existsSync(resolve(target, report.relativePath)), true)
  const content = readFileSync(resolve(target, report.relativePath), 'utf8')
  assert.match(content, /# ADR-2026-07-08-adopt-ci-change-level-enforcement/)
  assert.match(content, /Status: `Proposed`/)
  assert.match(content, /## 1\. Decision/)
}

function testAdrRejectsInvalidDate() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-adr-invalid-date-'))
  const output = run([
    'adr',
    'Invalid date path',
    '--target',
    target,
    '--date',
    '../bad',
    '--json',
  ], {
    allowFailure: true,
  })

  assert.equal(output, '')
  assert.equal(existsSync(resolve(target, 'ADRs')), false)
}

function testClassifyRiskPathJson() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-classify-'))
  const report = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--file',
    'backend/auth/session.py',
    '--json',
  ])

  assert.equal(report.command, 'classify')
  assert.equal(report.estimatedLevel, 'Level 3')
  assert.equal(report.classificationReason, 'Configured risk path raised the estimated level.')
  assert.equal(report.pathMatches[0].pattern, 'backend/auth/**')
}

function testPrChecklistJson() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-checklist-json-'))
  const report = runJson([
    'pr-checklist',
    'small cleanup',
    '--target',
    target,
    '--file',
    'backend/auth/session.py',
    '--json',
  ])

  assert.equal(report.command, 'pr-checklist')
  assert.equal(report.classification.estimatedLevel, 'Level 3')
  assert.ok(report.requiredArtifacts.includes('docs/SECURITY.md'))
  assert.ok(report.requiredArtifacts.includes('docs/ARCHITECTURE.md'))
  assert.ok(report.checks.some((item) => item.includes('Risk path backend/auth/**')))
}

function testPrChecklistMarkdownLevel4() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-checklist-md-'))
  const output = run([
    'pr-checklist',
    'deploy migration',
    '--target',
    target,
    '--files',
    'backend/migrations/001.sql,.github/workflows/deploy.yml',
  ])

  assert.match(output, /# PSDM PR Checklist/)
  assert.match(output, /Estimated level: Level 4/)
  assert.match(output, /Rollback or recovery plan is documented/)
  assert.match(output, /backend\/migrations\/001\.sql matches backend\/migrations\/\*\*/)
  assert.match(output, /\.github\/workflows\/deploy\.yml matches \.github\/workflows\/\*\*/)
}

function testEnforceAllowsConfiguredLevel() {
  const report = runJson([
    'enforce',
    'small cleanup',
    '--target',
    repoRoot,
    '--file',
    'src/index.mjs',
    '--max-level',
    'Level 2',
    '--json',
  ])

  assert.equal(report.command, 'enforce')
  assert.equal(report.decision, 'CHANGE_LEVEL_APPROVED')
  assert.equal(report.allowed, true)
  assert.equal(report.classification.estimatedLevel, 'Level 2')
}

function testEnforceBlocksExceededLevel() {
  const report = runJson([
    'enforce',
    'deployment pipeline change',
    '--target',
    repoRoot,
    '--file',
    '.github/workflows/deploy.yml',
    '--max-level',
    'Level 2',
    '--json',
  ], {
    allowFailure: true,
  })

  assert.equal(report.command, 'enforce')
  assert.equal(report.decision, 'CHANGE_LEVEL_BLOCKED')
  assert.equal(report.allowed, false)
  assert.equal(report.classification.estimatedLevel, 'Level 4')
  assert.ok(report.violations.some((item) => item.includes('exceeds allowed Level 2')))
}

function testValidateInitializedProject() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-validate-'))
  run(['init', target])
  const report = runJson(['validate', target, '--json'])

  assert.equal(report.decision, 'METHOD_BASELINE_REVIEW_REQUIRED')
  assert.equal(report.failures, 0)
  assert.ok(report.warnings > 0)
  assert.equal(report.config.exists, true)
  assert.equal(report.config.ai.pii.allowedInPrompts, false)
  assert.equal(report.config.ai.tools.registryRequired, true)
  assert.ok(report.results.some((item) => item.artifact === 'AGENTS.md' && item.status === 'PASS'))
}

function testCustomConfigArtifact() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-config-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'custom.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['docs/CUSTOM.md'],
    features: {
      root: 'features',
      requiredArtifacts: ['SPEC.md'],
    },
    git: {
      warnOnDirty: false,
    },
    ai: {
      pii: {
        allowedInPrompts: false,
        redactionRequired: true,
      },
      cost: {
        maxUsdPerRequest: 0.05,
        monthlyBudgetUsd: 100,
      },
      latency: {
        p95Ms: 3000,
      },
      tools: {
        registryRequired: true,
        humanApprovalForExternalActions: true,
      },
      evals: {
        required: true,
      },
      security: {
        promptInjectionTestsRequired: true,
      },
    },
    riskPaths: [
      {
        pattern: 'secure/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/CUSTOM.md'],
        reason: 'Custom secure path.',
      },
    ],
  }))

  run(['init', target, '--config', configPath])
  const check = runJson(['check', target, '--config', configPath, '--json'])
  const validate = runJson(['validate', target, '--config', configPath, '--json'])
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'secure/token.js',
    '--json',
  ])

  assert.equal(check.status, 'complete')
  assert.deepEqual(check.results.map((item) => item.artifact), ['docs/CUSTOM.md'])
  assert.equal(validate.config.ai.pii.allowedInPrompts, false)
  assert.equal(validate.config.ai.cost.maxUsdPerRequest, 0.05)
  assert.equal(validate.config.ai.latency.p95Ms, 3000)
  assert.equal(validate.config.ai.tools.registryRequired, true)
  assert.equal(classified.estimatedLevel, 'Level 3')
  assert.equal(classified.pathMatches[0].pattern, 'secure/**')
}

function testInvalidAiPolicyFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-ai-policy-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-ai.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    ai: {
      pii: {
        allowedInPrompts: 'no',
      },
      cost: {
        maxUsdPerRequest: -1,
      },
      latency: {
        p95Ms: 'fast',
      },
      tools: {
        registryRequired: 'yes',
      },
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message === 'ai.pii.allowedInPrompts must be a boolean or null.'
  )))
  assert.ok(validation.results.some((item) => item.message === 'ai.cost.maxUsdPerRequest must be a positive number or null.'))
  assert.ok(validation.results.some((item) => item.message === 'ai.latency.p95Ms must be a positive number or null.'))
  assert.ok(validation.results.some((item) => item.message === 'ai.tools.registryRequired must be a boolean or null.'))
}

function testValidationProfileFramework() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-profile-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'framework.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    profile: 'framework',
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'src/index.mjs',
    '--json',
  ])

  assert.equal(validation.config.profile.name, 'framework')
  assert.equal(validation.config.profile.recognized, true)
  assert.ok(validation.results.some((item) => item.artifact === 'ROADMAP.md' && item.status === 'FAIL'))
  assert.ok(validation.results.some((item) => item.artifact === 'TODO.md' && item.status === 'FAIL'))
  assert.equal(classified.estimatedLevel, 'Level 2')
  assert.equal(classified.pathMatches[0].pattern, 'src/**')
}

function testUnsupportedProfileFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-profile-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    profile: 'unknown-profile',
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.equal(validation.config.profile.name, 'unknown-profile')
  assert.equal(validation.config.profile.recognized, false)
  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message.includes('Unsupported profile: unknown-profile')
  )))
}

function testInvalidRiskPathFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-riskpath-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-risk.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    riskPaths: [
      {
        pattern: 'secure/**',
        minimumLevel: 'Level 5',
        requiredArtifacts: 'docs/SECURITY.md',
        reason: '',
      },
    ],
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'secure/token.js',
    '--json',
  ])

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message.includes('riskPaths[0].minimumLevel')
  )))
  assert.ok(validation.results.some((item) => item.message.includes('riskPaths[0].requiredArtifacts')))
  assert.ok(validation.results.some((item) => item.message.includes('riskPaths[0].reason')))
  assert.equal(classified.estimatedLevel, 'Level 1')
  assert.deepEqual(classified.pathMatches, [])
}

function testInvalidRiskPathCollectionFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-riskpath-type-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-risk-type.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    riskPaths: {
      pattern: 'secure/**',
      minimumLevel: 'Level 3',
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message === 'riskPaths must be an array.'
  )))
}

function testFeatureArtifacts() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-feature-'))
  run(['init', target])
  run(['init', target, '--feature', 'billing'])

  const check = runJson(['check', target, '--feature', 'billing', '--json'])
  const validate = runJson(['validate', target, '--feature', 'billing', '--json'])

  assert.equal(check.status, 'complete')
  assert.ok(check.results.some((item) => item.artifact === 'docs/features/billing/SPEC.md'))
  assert.equal(validate.failures, 0)
  assert.ok(validate.results.some((item) => item.artifact === 'docs/features/billing/SECURITY.md'))
}

const tests = [
  testAuditExistingProject,
  testAuditDetectsExistingAiGovernance,
  testAuditDetectsAiRuntimeSurfaces,
  testInitCreatesAdoptionPlanForExistingAiGovernance,
  testInitDryRunDoesNotWrite,
  testAdrCreatesDecisionRecord,
  testAdrRejectsInvalidDate,
  testClassifyRiskPathJson,
  testPrChecklistJson,
  testPrChecklistMarkdownLevel4,
  testEnforceAllowsConfiguredLevel,
  testEnforceBlocksExceededLevel,
  testValidateInitializedProject,
  testCustomConfigArtifact,
  testInvalidAiPolicyFailsValidation,
  testValidationProfileFramework,
  testUnsupportedProfileFailsValidation,
  testInvalidRiskPathFailsValidation,
  testInvalidRiskPathCollectionFailsValidation,
  testFeatureArtifacts,
]

for (const test of tests) {
  test()
  console.log(`PASS ${test.name}`)
}
