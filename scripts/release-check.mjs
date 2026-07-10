#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = resolve(repoRoot, 'bin', 'psdm.mjs')
const allowDirty = process.argv.includes('--allow-dirty')

const requiredPackageFiles = [
  'bin/psdm.mjs',
  'src/lib/branding.mjs',
  'src/lib/config.mjs',
  'templates/psdm.config.json',
  'action.yml',
  'assets/psdm-logo.png',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'docs/INDEX.md',
  'docs/CONFIG_SCHEMA.md',
  'docs/AGENT_DECISION_PROTOCOL.md',
  'docs/INTERACTIVE_SHELL.md',
  'docs/BETA_RELEASE_NOTES.md',
  'docs/MODEL_AND_TOOL_INDEPENDENCE.md',
  'docs/KNOWLEDGE_AS_CODE.md',
  'docs/DOWNSTREAM_ACTION_VALIDATION.md',
  'docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md',
  'docs/PUBLIC_REPOSITORY_READINESS.md',
  'examples/nextjs-saas/README.md',
  'scripts/release-check.mjs',
  'tests/cli-fixtures.mjs',
]

const forbiddenPackageFiles = [
  'HANDOFF.md',
  '.env',
  '.env.local',
  'coverage',
  'dist',
  'node_modules',
]

function log(message) {
  console.log(`\n==> ${message}`)
}

function run(label, command, args) {
  log(label)
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}.`)
  }
}

function capture(label, command, args) {
  log(label)
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
}

function listMjsFiles(root) {
  if (!existsSync(root)) {
    return []
  }

  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) {
      return listMjsFiles(path)
    }

    return entry.isFile() && entry.name.endsWith('.mjs') ? [path] : []
  })
}

function assertCleanWorkingTree() {
  const status = execFileSync('git', ['status', '--short'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim()

  if (status && !allowDirty) {
    throw new Error('Working tree is dirty. Re-run with --allow-dirty only for local development validation.')
  }

  if (status) {
    console.log('Working tree is dirty; continuing because --allow-dirty was provided.')
  }
}

function assertPackageMetadata() {
  const packageJson = JSON.parse(execFileSync('node', ['-e', 'console.log(JSON.stringify(require("./package.json")))'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }))

  if (packageJson.name !== '@ptechsolution/psdm-framework') {
    throw new Error(`Unexpected package name: ${packageJson.name}`)
  }

  if (packageJson.bin?.psdm !== 'bin/psdm.mjs') {
    throw new Error('package.json bin.psdm must point to bin/psdm.mjs.')
  }

  if (packageJson.bin?.riscala !== packageJson.bin.psdm) {
    throw new Error('package.json bin.riscala must match the psdm compatibility entrypoint.')
  }

  if (packageJson.publishConfig?.access !== 'public') {
    throw new Error('package.json publishConfig.access must be public.')
  }

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    throw new Error('package.json must declare a files allowlist.')
  }
}

function assertValidation() {
  const output = capture('Validate repository governance', process.execPath, [cli, 'validate', '.', '--json'])
  const report = JSON.parse(output)

  console.log(JSON.stringify({
    decision: report.decision,
    failures: report.failures,
    warnings: report.warnings,
  }, null, 2))

  if (report.failures !== 0) {
    throw new Error('psdm validate must report zero failures before release.')
  }
}

function assertPackageContents() {
  const output = capture('Inspect package dry-run contents', 'npm', ['pack', '--dry-run', '--json'])
  const parsed = JSON.parse(output)
  const pack = findPackManifest(parsed)

  if (!pack || !Array.isArray(pack.files)) {
    throw new Error(`Unable to parse npm pack dry-run output: ${describeJsonShape(parsed)}.`)
  }

  const files = new Set(pack.files.map((file) => file.path))

  for (const required of requiredPackageFiles) {
    if (!files.has(required)) {
      throw new Error(`Package dry-run is missing required file: ${required}`)
    }
  }

  for (const forbidden of forbiddenPackageFiles) {
    for (const file of files) {
      if (file === forbidden || file.startsWith(`${forbidden}/`)) {
        throw new Error(`Package dry-run includes forbidden file: ${file}`)
      }
    }
  }

  console.log(JSON.stringify({
    filename: pack.filename,
    entryCount: pack.entryCount,
    size: pack.size,
  }, null, 2))
}

function assertExecutableParity() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-package-check-'))
  run('Install local package for executable parity', 'npm', [
    'install',
    '--prefix',
    target,
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    repoRoot,
  ])

  const binDir = resolve(target, 'node_modules', '.bin')
  const riscalaHelp = execFileSync(resolve(binDir, 'riscala'), ['help'], { encoding: 'utf8' })
  const psdmHelp = execFileSync(resolve(binDir, 'psdm'), ['help'], { encoding: 'utf8' })

  if (riscalaHelp !== psdmHelp) {
    throw new Error('riscala and psdm help output must remain identical during compatibility migration.')
  }

  if (!riscalaHelp.includes('Riscala') || !riscalaHelp.includes('Powered by PSDM')) {
    throw new Error('Installed executable help must present the Riscala product and PSDM method.')
  }
}

function findPackManifest(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPackManifest(item)
      if (found) {
        return found
      }
    }

    return null
  }

  if (Array.isArray(value.files)) {
    return value
  }

  for (const item of Object.values(value)) {
    const found = findPackManifest(item)
    if (found) {
      return found
    }
  }

  return null
}

function describeJsonShape(value) {
  if (Array.isArray(value)) {
    return `array(length=${value.length})`
  }

  if (value && typeof value === 'object') {
    return `object(keys=${Object.keys(value).slice(0, 10).join(',')})`
  }

  return typeof value
}

function main() {
  assertCleanWorkingTree()
  assertPackageMetadata()

  const syntaxFiles = [
    ...listMjsFiles(resolve(repoRoot, 'bin')),
    ...listMjsFiles(resolve(repoRoot, 'src')),
    ...listMjsFiles(resolve(repoRoot, 'tests')),
    ...listMjsFiles(resolve(repoRoot, 'scripts')),
  ]

  for (const file of syntaxFiles) {
    run(`Syntax check ${file.replace(`${repoRoot}/`, '')}`, process.execPath, ['--check', file])
  }

  run('Run CLI regression fixtures', 'npm', ['test'])
  assertValidation()
  run('Render CLI help', process.execPath, [cli, 'help'])
  assertExecutableParity()
  capture('Audit repository JSON', process.execPath, [cli, 'audit', '.', '--json'])
  capture('Classify release smoke change', process.execPath, [
    cli,
    'classify',
    'small cleanup',
    '--file',
    'src/validator/validate-method.mjs',
    '--json',
  ])
  capture('Enforce release smoke change', process.execPath, [
    cli,
    'enforce',
    'small cleanup',
    '--file',
    'src/validator/validate-method.mjs',
    '--max-level',
    'Level 3',
    '--json',
  ])
  capture('Create ADR in temp release smoke target', process.execPath, [
    cli,
    'adr',
    'Validate release readiness',
    '--target',
    mkdtempSync(resolve(tmpdir(), 'psdm-release-check-')),
    '--date',
    '2026-07-08',
    '--json',
  ])
  assertPackageContents()
  run('Check diff whitespace', 'git', ['diff', '--check'])

  console.log('\nRelease check passed.')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
