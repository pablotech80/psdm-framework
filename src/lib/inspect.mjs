import { classifyChange } from './classifier.mjs'
import { inspectStagedGit } from './git.mjs'

function stagedFileEvidence(change) {
  const pathContext = change.previousPath
    ? `${change.previousPath} -> ${change.path}`
    : change.path

  return {
    kind: 'staged-file',
    level: 'Level 1',
    file: change.path,
    message: `${change.type} staged file: ${pathContext}`,
  }
}

function riskPathEvidence(match) {
  return {
    kind: 'risk-path',
    level: match.minimumLevel,
    file: match.file,
    pattern: match.pattern,
    message: match.reason,
  }
}

export function inspectStagedChange({ target, configPath = null }) {
  const git = inspectStagedGit(target)

  if (!git.isRepository) {
    return {
      command: 'inspect',
      source: 'staged',
      target,
      decision: 'NOT_A_GIT_REPOSITORY',
      git,
      files: [],
      evidence: [],
      classification: null,
    }
  }

  const files = Array.from(new Set(git.changes.flatMap((change) => (
    change.previousPath ? [change.previousPath, change.path] : [change.path]
  ))))

  if (files.length === 0) {
    return {
      command: 'inspect',
      source: 'staged',
      target,
      decision: 'NO_STAGED_CHANGES',
      git,
      files,
      evidence: [],
      classification: null,
    }
  }

  const classification = classifyChange({
    description: 'staged changes',
    files,
    target,
    configPath,
    minimumLevel: 'Level 1',
    minimumLevelReason: 'Staged file changes require at least Level 1 governance.',
  })
  const evidence = [
    ...git.changes.map(stagedFileEvidence),
    ...classification.pathMatches.map(riskPathEvidence),
  ]

  return {
    command: 'inspect',
    source: 'staged',
    target,
    decision: 'CHANGE_REVIEW_REQUIRED',
    git,
    files,
    evidence,
    classification,
  }
}
