import { realpathSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { inspectRepositoryIdentity } from './git.mjs'
import { normalizePath } from './risk-paths.mjs'

function canonical(path) {
  try { return realpathSync(resolve(path)) } catch { return resolve(path) }
}

function escapeRegex(value) {
  return value.replace(/[.+^${}()|[\]\\]/g, '\\$&')
}

function patternRegex(pattern) {
  const normalized = normalizePath(pattern).replace(/\/$/, '')
  let source = '^'
  for (let index = 0; index < normalized.length; index += 1) {
    if (normalized[index] === '*' && normalized[index + 1] === '*') {
      source += '.*'
      index += 1
    } else if (normalized[index] === '*') source += '[^/]*'
    else source += escapeRegex(normalized[index])
  }
  if (!normalized.includes('*')) source += '(?:/.*)?'
  return new RegExp(`${source}$`)
}

export function changedPaths(lines) {
  return [...new Set(lines.flatMap((line) => {
    const value = line.slice(3).trim().replace(/^"|"$/g, '')
    return value.includes(' -> ') ? value.split(' -> ') : [value]
  }).filter(Boolean))]
}

export function evaluatePathsAgainstActiveWork({ target, work, paths }) {
  if (!work) return { decision: 'NO_ACTIVE_WORK', repositoryMatches: null, allowedPatterns: [], changedPaths: paths, violations: [] }
  const repositoryMatches = canonical(work.repository) === canonical(target)
  if (!repositoryMatches) return { decision: 'REPOSITORY_CONFLICT', repositoryMatches, allowedPatterns: work.allowedPaths || [], changedPaths: paths, violations: [] }
  const identity = inspectRepositoryIdentity(target)
  const prefix = identity ? normalizePath(relative(canonical(identity.root), canonical(target))) : ''
  const allowedPatterns = (work.allowedPaths || []).map((pattern) => normalizePath(prefix ? `${prefix}/${pattern}` : pattern))
  const scopedPaths = paths.filter((path) => !/(^|\/)\.riscala(?:\/|$)/.test(path))
  if (allowedPatterns.length === 0) return { decision: 'UNSCOPED', repositoryMatches, allowedPatterns, changedPaths: scopedPaths, violations: [] }
  const matchers = allowedPatterns.map(patternRegex)
  const violations = scopedPaths.filter((path) => !matchers.some((matcher) => matcher.test(normalizePath(path))))
  return { decision: violations.length ? 'SCOPE_REVIEW_REQUIRED' : 'SCOPE_ALIGNED', repositoryMatches, allowedPatterns, changedPaths: scopedPaths, violations }
}

export function evaluateActiveWorkScope({ target, git, work }) {
  return evaluatePathsAgainstActiveWork({ target, work, paths: changedPaths(git.changes) })
}
