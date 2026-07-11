import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

export const WORK_MODES = ['inspect', 'experiment', 'design', 'implement', 'release']

export function activeWorkPath(target) {
  return join(resolve(target), '.riscala', 'ACTIVE_WORK.md')
}

function renderActiveWork({ target, objective, mode }) {
  return `# Active Work

Status: \`active\`

## Boundary

- Repository: \`${resolve(target)}\`
- Objective: ${objective}
- Mode: \`${mode}\`

## Allowed

- Work inside this repository when it directly serves the objective.

## Forbidden

- Change another repository.
- Expand the objective or mode without an explicit transition.

## Must Preserve

- Existing unrelated user changes.
- Secrets, credentials, private data, and production values.

## Stop Conditions

- Repository, objective, or mode changes.
- The requested action conflicts with Allowed, Forbidden, or Must Preserve.
- A material decision or required authority is missing.

## Context

### Human Decisions

- The repository, objective, and mode above define the active boundary.

### Observed Facts

- Project: \`${basename(resolve(target))}\`.

### Examples

- None recorded.

### Suggestions

- None recorded.

### Open Questions

- None recorded.

## Next Permitted Action

Work inside the active boundary or propose an explicit transition.
`
}

export function createActiveWork({ target, objective, mode }) {
  const path = activeWorkPath(target)
  if (existsSync(path)) {
    return { created: false, path, reason: 'ACTIVE_WORK_EXISTS' }
  }
  mkdirSync(join(resolve(target), '.riscala'), { recursive: true })
  writeFileSync(path, renderActiveWork({ target, objective, mode }))
  return { created: true, path, reason: 'ACTIVE_WORK_CREATED' }
}

export function readActiveWork(target) {
  const path = activeWorkPath(target)
  if (!existsSync(path)) {
    return { exists: false, path, content: null, reason: 'ACTIVE_WORK_NOT_FOUND' }
  }
  return {
    exists: true,
    path,
    content: readFileSync(path, 'utf8'),
    reason: 'ACTIVE_WORK_FOUND',
  }
}

function sectionBullet(content, heading) {
  const match = content.match(new RegExp(`## ${heading}\\n\\n- ([^\\n]+)`))
  return match?.[1]?.trim() || null
}

export function parseActiveWork(content) {
  if (typeof content !== 'string' || !content.trim()) return null

  const field = (name) => content.match(new RegExp('- ' + name + ': (?:`([^`]+)`|([^\\n]+))'))
  const value = (name) => {
    const match = field(name)
    return (match?.[1] || match?.[2] || '').trim() || null
  }
  const nextAction = content.match(/## Next Permitted Action\n\n([^\n]+)/)?.[1]?.trim() || null

  return {
    status: content.match(/Status: `([^`]+)`/)?.[1]?.trim() || null,
    repository: value('Repository'),
    objective: value('Objective'),
    mode: value('Mode'),
    allowed: sectionBullet(content, 'Allowed'),
    forbidden: sectionBullet(content, 'Forbidden'),
    nextAction,
  }
}
