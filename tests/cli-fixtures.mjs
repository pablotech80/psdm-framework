import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
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
  assert.equal(report.summary.wouldCreate, 12)
  assert.equal(report.summary.wouldSkip, 0)
  assert.ok(report.pros.some((item) => item.includes('without overwriting')))
  assert.ok(report.cons.some((item) => item.includes('must keep current')))
  assert.ok(report.recommendations.some((item) => item.includes('psdm init')))
}

function testInitDryRunDoesNotWrite() {
  const target = existingProject()
  const output = run(['init', target, '--dry-run'])

  assert.match(output, /Before/)
  assert.match(output, /After psdm init/)
  assert.match(output, /AGENTS\.md: create/)
  assert.equal(existsSync(resolve(target, 'AGENTS.md')), false)
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

function testValidateInitializedProject() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-validate-'))
  run(['init', target])
  const report = runJson(['validate', target, '--json'])

  assert.equal(report.decision, 'METHOD_BASELINE_REVIEW_REQUIRED')
  assert.equal(report.failures, 0)
  assert.ok(report.warnings > 0)
  assert.equal(report.config.exists, true)
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
  assert.equal(classified.estimatedLevel, 'Level 3')
  assert.equal(classified.pathMatches[0].pattern, 'secure/**')
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
  testInitDryRunDoesNotWrite,
  testClassifyRiskPathJson,
  testPrChecklistJson,
  testPrChecklistMarkdownLevel4,
  testValidateInitializedProject,
  testCustomConfigArtifact,
  testValidationProfileFramework,
  testUnsupportedProfileFailsValidation,
  testFeatureArtifacts,
]

for (const test of tests) {
  test()
  console.log(`PASS ${test.name}`)
}
