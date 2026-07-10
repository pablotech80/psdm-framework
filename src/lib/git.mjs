import { execFileSync } from 'node:child_process'

function git(targetDir, args, options = {}) {
  const output = execFileSync('git', ['-C', targetDir, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return options.raw ? output : output.trim()
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

function changeType(status) {
  const types = {
    A: 'added',
    C: 'copied',
    D: 'deleted',
    M: 'modified',
    R: 'renamed',
    T: 'type-changed',
    U: 'unmerged',
    X: 'unknown',
  }

  return types[status[0]] || 'unknown'
}

function parseNameStatus(output) {
  if (!output) {
    return []
  }

  const fields = output.split('\0').filter((field) => field.length > 0)
  const changes = []

  for (let index = 0; index < fields.length;) {
    const status = fields[index]
    const type = changeType(status)
    index += 1

    if (type === 'renamed' || type === 'copied') {
      const previousPath = fields[index]
      const path = fields[index + 1]
      changes.push({ status, type, path, previousPath })
      index += 2
      continue
    }

    changes.push({ status, type, path: fields[index], previousPath: null })
    index += 1
  }

  return changes
}

export function inspectStagedGit(targetDir) {
  const repository = inspectGit(targetDir)

  if (!repository.isRepository) {
    return {
      isRepository: false,
      branch: null,
      changes: [],
    }
  }

  const output = git(targetDir, [
    'diff',
    '--cached',
    '--name-status',
    '-z',
    '--find-renames',
    '--no-ext-diff',
  ], { raw: true })

  return {
    isRepository: true,
    branch: repository.branch,
    changes: parseNameStatus(output),
  }
}
