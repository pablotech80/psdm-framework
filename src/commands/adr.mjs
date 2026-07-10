import { createAdr } from '../lib/adr.mjs'
import { parseArgs, printJson } from '../lib/args.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function adrCommand(args) {
  const { options, positional } = parseArgs(args)
  const title = positional.join(' ').trim()

  if (!title) {
    console.error('Usage: riscala adr "<decision title>" [--target path] [--date YYYY-MM-DD] [--status Proposed] [--json]')
    return { exitCode: 1 }
  }

  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const report = createAdr({
    target,
    title,
    date: options.date || undefined,
    status: options.status || 'Proposed',
  })

  if (options.json) {
    printJson(report)
    return { exitCode: 0 }
  }

  if (report.status === 'created') {
    console.log(`CREATED ${report.relativePath}`)
  } else {
    console.log(`EXISTS  ${report.relativePath}`)
  }

  return { exitCode: 0 }
}
