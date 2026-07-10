#!/usr/bin/env node

import { initCommand } from '../src/commands/init.mjs'
import { adrCommand } from '../src/commands/adr.mjs'
import { auditCommand } from '../src/commands/audit.mjs'
import { checkCommand } from '../src/commands/check.mjs'
import { validateCommand } from '../src/commands/validate.mjs'
import { classifyCommand } from '../src/commands/classify.mjs'
import { enforceCommand } from '../src/commands/enforce.mjs'
import { prChecklistCommand } from '../src/commands/pr-checklist.mjs'
import { reportCommand } from '../src/commands/report.mjs'
import { inspectCommand } from '../src/commands/inspect.mjs'

const [command, ...args] = process.argv.slice(2)

const commands = {
  adr: adrCommand,
  init: initCommand,
  audit: auditCommand,
  check: checkCommand,
  validate: validateCommand,
  classify: classifyCommand,
  enforce: enforceCommand,
  'pr-checklist': prChecklistCommand,
  report: reportCommand,
  inspect: inspectCommand,
}

function printHelp() {
  console.log(`PSDM Framework

Usage:
  psdm audit [target] [--json] [--feature name] [--config path]
  psdm adr "<decision title>" [--json] [--target path] [--date YYYY-MM-DD] [--status Proposed]
  psdm init [target] [--feature name] [--dry-run]
  psdm check [target] [--json] [--feature name] [--config path]
  psdm validate [target] [--json] [--feature name] [--config path]
  psdm inspect --staged [--json] [--target path] [--config path]
  psdm classify "<change description>" [--json] [--file path] [--files path,path] [--target path] [--config path]
  psdm enforce "<change description>" [--json] [--max-level "Level 2"] [--file path] [--files path,path] [--target path] [--config path]
  psdm pr-checklist "<change description>" [--json] [--file path] [--files path,path] [--target path] [--config path]
  psdm report [target] [--json] [--feature name] [--config path]

Commands:
  adr        Create a new Architecture Decision Record under ADRs/.
  audit      Preview repository state and what PSDM init would change.
  init       Create PSDM governance artifacts in a project.
  check      Check required artifacts exist and are non-empty.
  validate   Validate PSDM baseline structure and required sections.
  inspect    Inspect staged Git changes and explain their minimum governance level.
  classify   Estimate change level from a short description.
  enforce    Fail when a classified change exceeds the allowed maximum level.
  pr-checklist Generate a pull request checklist for a change.
  report     Print a markdown compliance report.
`)
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp()
  process.exit(0)
}

const handler = commands[command]

if (!handler) {
  console.error(`Unknown command: ${command}`)
  printHelp()
  process.exit(1)
}

try {
  const result = await handler(args)
  if (typeof result?.exitCode === 'number') {
    process.exit(result.exitCode)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
