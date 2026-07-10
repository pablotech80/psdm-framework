import { fileURLToPath } from 'node:url'
import { parseArgs, printJson } from '../lib/args.mjs'
import {
  inspectPreCommitHook,
  installPreCommitHook,
  removePreCommitHook,
} from '../lib/git-hook.mjs'
import { resolveTarget } from '../lib/paths.mjs'

function invalidOptions(options) {
  return options.feature !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
    || options.configPath !== null
}

export async function hookCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, hook, ...extra] = positional

  if (
    !['install', 'remove', 'status'].includes(operation)
    || hook !== 'pre-commit'
    || extra.length > 0
    || invalidOptions(options)
  ) {
    console.error('Usage: riscala hook <install|remove|status> pre-commit [--target path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  let report
  if (operation === 'install') {
    report = installPreCommitHook({
      target,
      nodePath: process.execPath,
      cliPath: fileURLToPath(new URL('../../bin/psdm.mjs', import.meta.url)),
    })
  } else if (operation === 'remove') {
    report = removePreCommitHook(target)
  } else {
    report = inspectPreCommitHook(target)
  }

  const payload = {
    version: 1,
    command: 'hook',
    operation,
    hook: 'pre-commit',
    target,
    ...report,
  }

  if (options.json) {
    printJson(payload)
  } else {
    console.log('Riscala Git Hook')
    console.log(`Hook: ${payload.hook}`)
    console.log(`Decision: ${payload.decision}`)
    if (payload.path) {
      console.log(`Path: ${payload.path}`)
    }
  }

  const failed = ['NOT_A_GIT_REPOSITORY', 'EXISTING_HOOK_CONFLICT', 'UNMANAGED_HOOK_PRESERVED']
    .includes(payload.decision)
  return { exitCode: failed ? 1 : 0 }
}
