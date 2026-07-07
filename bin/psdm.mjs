#!/usr/bin/env node

import { initCommand } from '../src/commands/init.mjs'
import { checkCommand } from '../src/commands/check.mjs'
import { validateCommand } from '../src/commands/validate.mjs'
import { classifyCommand } from '../src/commands/classify.mjs'
import { reportCommand } from '../src/commands/report.mjs'

const [command, ...args] = process.argv.slice(2)

const commands = {
  init: initCommand,
  check: checkCommand,
  validate: validateCommand,
  classify: classifyCommand,
  report: reportCommand,
}

function printHelp() {
  console.log(`PSDM Framework

Usage:
  psdm init [target] [--feature name]
  psdm check [target] [--json] [--feature name] [--config path]
  psdm validate [target] [--json] [--feature name] [--config path]
  psdm classify "<change description>" [--json] [--file path] [--files path,path] [--target path] [--config path]
  psdm report [target] [--json] [--feature name] [--config path]

Commands:
  init       Create PSDM governance artifacts in a project.
  check      Check required artifacts exist and are non-empty.
  validate   Validate PSDM baseline structure and required sections.
  classify   Estimate change level from a short description.
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
