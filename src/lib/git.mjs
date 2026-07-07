import { execFileSync } from 'node:child_process'

function git(targetDir, args) {
  return execFileSync('git', ['-C', targetDir, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

export function inspectGit(targetDir) {
  try {
    git(targetDir, ['rev-parse', '--is-inside-work-tree'])
  } catch {
    return {
      isRepository: false,
      isDirty: false,
      branch: null,
      changes: [],
    }
  }

  const branch = git(targetDir, ['branch', '--show-current']) || null
  const changes = git(targetDir, ['status', '--porcelain'])
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)

  return {
    isRepository: true,
    isDirty: changes.length > 0,
    branch,
    changes,
  }
}
