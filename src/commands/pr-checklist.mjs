import { parseArgs, printJson } from '../lib/args.mjs'
import { buildPrChecklist, renderPrChecklist } from '../lib/pr-checklist.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function prChecklistCommand(args) {
  const { options, positional } = parseArgs(args)
  const description = positional.join(' ').trim()

  if (!description) {
    console.error('Usage: psdm pr-checklist "<change description>" [--file path] [--files path,path] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const report = buildPrChecklist({
    description,
    files: options.files,
    target,
    configPath: options.configPath,
  })

  if (options.json) {
    printJson(report)
    return { exitCode: 0 }
  }

  console.log(renderPrChecklist(report))
  return { exitCode: 0 }
}
