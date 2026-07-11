import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { resolveGitPath } from './git.mjs'

const HOOK_MARKER = '# RISCALA_MANAGED_PRE_COMMIT_V1'

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

function hookPath(target) {
  return resolveGitPath(target, 'hooks/pre-commit')
}

function renderHook({ nodePath, cliPath, target }) {
  return `#!/bin/sh
${HOOK_MARKER}
git rev-parse --show-toplevel >/dev/null || exit 1
exec ${shellQuote(nodePath)} ${shellQuote(cliPath)} approval enforce git.commit --target ${shellQuote(resolve(target))}
`
}

export function inspectPreCommitHook(target) {
  const path = hookPath(target)
  if (!path) {
    return {
      decision: 'NOT_A_GIT_REPOSITORY',
      installed: false,
      managed: false,
      path: null,
    }
  }

  const installed = existsSync(path)
  const content = installed ? readFileSync(path, 'utf8') : ''
  return {
    decision: installed ? 'HOOK_PRESENT' : 'HOOK_NOT_INSTALLED',
    installed,
    managed: content.includes(HOOK_MARKER),
    path,
  }
}

export function installPreCommitHook({ target, nodePath, cliPath }) {
  const state = inspectPreCommitHook(target)
  if (!state.path) {
    return { ...state, changed: false }
  }

  if (state.installed && !state.managed) {
    return {
      ...state,
      decision: 'EXISTING_HOOK_CONFLICT',
      changed: false,
    }
  }

  const content = renderHook({
    nodePath: resolve(nodePath),
    cliPath: resolve(cliPath),
    target,
  })
  const existing = state.installed ? readFileSync(state.path, 'utf8') : null
  if (existing === content) {
    return {
      ...state,
      decision: 'HOOK_ALREADY_INSTALLED',
      changed: false,
    }
  }

  mkdirSync(dirname(state.path), { recursive: true })
  writeFileSync(state.path, content, { encoding: 'utf8', mode: 0o755 })
  chmodSync(state.path, 0o755)
  return {
    decision: 'HOOK_INSTALLED',
    installed: true,
    managed: true,
    changed: true,
    path: state.path,
  }
}

export function removePreCommitHook(target) {
  const state = inspectPreCommitHook(target)
  if (!state.installed) {
    return { ...state, decision: 'HOOK_NOT_INSTALLED', changed: false }
  }

  if (!state.managed) {
    return { ...state, decision: 'UNMANAGED_HOOK_PRESERVED', changed: false }
  }

  unlinkSync(state.path)
  return {
    decision: 'HOOK_REMOVED',
    installed: false,
    managed: true,
    changed: true,
    path: state.path,
  }
}
