import { parseArgs, printJson } from '../lib/args.mjs'
import { ADAPTER_TOOLS, installAgentAdapters } from '../lib/agent-adapters.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function adaptersCommand(args) {
  const { options, positional } = parseArgs(args)
  const [operation, toolList] = positional
  const target = options.target ? resolveTarget([options.target]) : process.cwd()
  const tools = toolList ? toolList.split(',').map((item) => item.trim()).filter(Boolean) : ADAPTER_TOOLS
  const invalid = operation !== 'init' || tools.some((tool) => !ADAPTER_TOOLS.includes(tool))
    || options.mode !== null || options.configPath !== null || options.files.length > 0
  if (invalid) {
    console.error(`Usage: riscala adapters init [${ADAPTER_TOOLS.join(',')}] [--target path] [--json]`)
    return { exitCode: 1 }
  }
  const results = installAgentAdapters(target, tools)
  const report = { command: 'adapters', operation, target, tools, results }
  if (options.json) printJson(report)
  else results.forEach((result) => console.log(`${result.status.toUpperCase().padEnd(16)} ${result.path} · ${result.tools.join(', ')}`))
  return { exitCode: 0 }
}
