import { classifyChange } from './classifier.mjs'

const COMMON_CHECKS = [
  'Scope and intent are clear.',
  'Diff was reviewed for accidental unrelated changes.',
  'Allowed and forbidden files are understood.',
  'Relevant validation was run and results are documented.',
]

const LEVEL_CHECKS = {
  'Level 0': [
    'Scope is trivial and non-behavioral.',
    'No source-critical, security, data, deployment, or operations impact.',
  ],
  'Level 1': [
    'Change is local and low risk.',
    'No high-risk surface is touched or the level has been raised.',
  ],
  'Level 2': [
    'Product or CLI behavior is described in the spec.',
    'Tasks and acceptance criteria are clear.',
    'Testing covers the changed behavior.',
    'Architecture impact was reviewed when module boundaries changed.',
  ],
  'Level 3': [
    'Spec, architecture, security, and testing context were reviewed.',
    'Owner approval is documented.',
    'Data, auth, payment, AI, or tool-governance risks are addressed.',
    'ADR is added or explicitly not needed for durable decisions.',
    'No secrets, private data, or production values are exposed.',
  ],
  'Level 4': [
    'Deployment and operations impact are documented.',
    'Rollback or recovery plan is documented.',
    'Owner approval is documented.',
    'Production execution is not implied by merge.',
    'Secrets, CI/CD, infrastructure, and release behavior are reviewed.',
  ],
}

function artifactChecks(artifacts) {
  return artifacts.map((artifact) => `${artifact} is updated or explicitly not applicable.`)
}

function riskPathChecks(pathMatches) {
  return pathMatches.map((match) =>
    `Risk path ${match.pattern} for ${match.file} reviewed: ${match.reason}`,
  )
}

function checklistForLevel(level) {
  return [
    ...COMMON_CHECKS,
    ...(LEVEL_CHECKS[level] || []),
  ]
}

export function buildPrChecklist({ description, files = [], target, configPath = null }) {
  const classification = classifyChange({ description, files, target, configPath })
  const requiredArtifacts = Array.from(new Set([
    ...classification.requiredArtifacts,
    ...artifactDefaultsForLevel(classification.estimatedLevel),
  ]))
  const checks = Array.from(new Set([
    ...checklistForLevel(classification.estimatedLevel),
    ...artifactChecks(requiredArtifacts),
    ...riskPathChecks(classification.pathMatches),
  ]))

  return {
    command: 'pr-checklist',
    description,
    target,
    files,
    classification,
    requiredArtifacts,
    checks,
  }
}

function artifactDefaultsForLevel(level) {
  if (level === 'Level 4') {
    return ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md', 'docs/SECURITY.md', 'docs/TESTING.md']
  }

  if (level === 'Level 3') {
    return ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md', 'docs/TESTING.md']
  }

  if (level === 'Level 2') {
    return ['docs/SPEC.md', 'docs/TASKS.md', 'docs/TESTING.md']
  }

  if (level === 'Level 1') {
    return ['AGENTS.md']
  }

  return []
}

export function renderPrChecklist(report) {
  const lines = [
    '# PSDM PR Checklist',
    '',
    `Change: ${report.description}`,
    `Estimated level: ${report.classification.estimatedLevel}`,
    `Reason: ${report.classification.classificationReason}`,
    '',
    '## Files',
  ]

  if (report.files.length === 0) {
    lines.push('- No files provided. Add `--file` or `--files` for path-aware checks.')
  } else {
    for (const file of report.files) {
      lines.push(`- ${file}`)
    }
  }

  lines.push('', '## Required Artifacts')
  if (report.requiredArtifacts.length === 0) {
    lines.push('- No additional artifacts required by this classification.')
  } else {
    for (const artifact of report.requiredArtifacts) {
      lines.push(`- [ ] ${artifact}`)
    }
  }

  lines.push('', '## Checklist')
  for (const check of report.checks) {
    lines.push(`- [ ] ${check}`)
  }

  if (report.classification.pathMatches.length > 0) {
    lines.push('', '## Risk Paths')
    for (const match of report.classification.pathMatches) {
      lines.push(`- ${match.file} matches ${match.pattern}: ${match.minimumLevel}`)
    }
  }

  lines.push('', `Note: ${report.classification.note}`)
  return lines.join('\n')
}
