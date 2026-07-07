import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { requiredSectionsForArtifact } from '../lib/artifacts.mjs'
import { loadConfig } from '../lib/config.mjs'
import { inspectGit } from '../lib/git.mjs'

function record(results, status, artifact, message, priority = 'Medium') {
  results.push({ status, artifact, message, priority })
}

function validateArtifacts(targetDir, artifacts, results) {
  for (const artifact of artifacts) {
    const fullPath = join(targetDir, artifact)

    if (!existsSync(fullPath)) {
      record(results, 'FAIL', artifact, 'Missing required artifact.', 'High')
      continue
    }

    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      record(results, 'PASS', artifact, 'Directory exists.', 'Low')
      continue
    }

    if (stat.size === 0) {
      record(results, 'FAIL', artifact, 'Artifact is empty.', 'High')
      continue
    }

    const content = readFileSync(fullPath, 'utf8')
    record(results, 'PASS', artifact, 'Artifact exists and is non-empty.', 'Low')

    const requiredSections = requiredSectionsForArtifact(artifact)
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        record(results, 'FAIL', artifact, `Missing required section or marker: ${section}`, 'Medium')
      }
    }

    if (/\b(TODO|TBD)\s*:|\b(placeholder|lorem ipsum)\b/i.test(content)) {
      record(results, 'WARN', artifact, 'Contains placeholder-like wording.', 'Medium')
    }

    if (/\b(sk_live|sk_test|rk_live|service_role|password|secret)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-./+=]{12,}/i.test(content)) {
      record(results, 'FAIL', artifact, 'Potential secret-like value detected.', 'Critical')
    }
  }
}

function featureArtifacts(targetDir, config, feature) {
  const root = config.features.root
  const required = config.features.requiredArtifacts

  if (feature) {
    return required.map((artifact) => join(root, feature, artifact))
  }

  const featureRoot = join(targetDir, root)
  if (!existsSync(featureRoot)) {
    return []
  }

  return readdirSync(featureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => required.map((artifact) => join(root, entry.name, artifact)))
}

export function validateMethod(targetDir, options = {}) {
  const configState = options.configState || loadConfig(targetDir, options.configPath)
  const { config } = configState
  const results = []
  const baselineArtifacts = config.requiredArtifacts
  const scopedFeatureArtifacts = featureArtifacts(targetDir, config, options.feature)
  const git = inspectGit(targetDir)

  validateArtifacts(targetDir, baselineArtifacts, results)
  validateArtifacts(targetDir, scopedFeatureArtifacts, results)

  if (config.git.warnOnDirty && git.isDirty) {
    record(results, 'WARN', 'git', `Working tree has ${git.changes.length} uncommitted change/s.`, 'Medium')
  }

  const failures = results.filter((item) => item.status === 'FAIL')
  const warnings = results.filter((item) => item.status === 'WARN')
  const decision = failures.length > 0
    ? 'NEEDS_CORRECTION'
    : warnings.length > 0
      ? 'METHOD_BASELINE_REVIEW_REQUIRED'
      : 'METHOD_BASELINE_APPROVED'

  return {
    decision,
    failures: failures.length,
    warnings: warnings.length,
    target: targetDir,
    config: {
      path: configState.path,
      exists: configState.exists,
    },
    feature: options.feature || null,
    git,
    results,
  }
}

export function printValidationReport(report) {
  console.log('PSDM Method Validation')
  console.log('')

  for (const result of report.results) {
    console.log(`${result.status.padEnd(5)} ${result.artifact} - ${result.message}`)
  }

  console.log('')
  console.log(`Decision: ${report.decision}`)
}
