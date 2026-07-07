import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = resolve(repoRoot, 'bin/psdm.mjs')

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function runJson(args) {
  return JSON.parse(run(args))
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

const tests = [
  testAuditExistingProject,
  testInitDryRunDoesNotWrite,
  testClassifyRiskPathJson,
  testPrChecklistJson,
  testPrChecklistMarkdownLevel4,
]

for (const test of tests) {
  test()
  console.log(`PASS ${test.name}`)
}
