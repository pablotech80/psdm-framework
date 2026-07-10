import { buildGitCommitActionRecord, SUPPORTED_ACTIONS } from '../lib/action-record.mjs'
import { parseArgs, printJson } from '../lib/args.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function actionCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, action, ...extra] = positional

  if (
    operation !== 'prepare'
    || !SUPPORTED_ACTIONS.includes(action)
    || extra.length > 0
    || options.feature !== null
    || options.files.length > 0
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
  ) {
    console.error('Usage: riscala action prepare git.commit [--target path] [--config path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const record = buildGitCommitActionRecord({ target, configPath: options.configPath })

  if (options.json) {
    printJson(record)
  } else {
    console.log('Riscala Action Record')
    console.log(`Action: ${record.action}`)
    console.log(`Decision: ${record.decision}`)
    if (record.binding) {
      console.log(`Repository: ${record.repositoryLabel} (${record.binding.repository})`)
      console.log(`Branch: ${record.binding.branch}`)
      console.log(`Content: ${record.binding.contentHash}`)
      console.log(`Change level: ${record.classification.estimatedLevel}`)
      console.log(`Approval required: ${record.approval.required ? 'yes' : 'no'}`)
    }
  }

  return { exitCode: record.ready ? 0 : 1 }
}
