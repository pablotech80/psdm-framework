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
import { shellCommand } from '../src/commands/shell.mjs'
import { actionCommand } from '../src/commands/action.mjs'
import { approvalCommand } from '../src/commands/approval.mjs'
import { hookCommand } from '../src/commands/hook.mjs'
import { impactCommand } from '../src/commands/impact.mjs'
import { reviewCommand } from '../src/commands/review.mjs'
import { workCommand } from '../src/commands/work.mjs'
import { adaptersCommand } from '../src/commands/adapters.mjs'
import {
  COMPATIBILITY_EXECUTABLE,
  PRIMARY_EXECUTABLE,
  productHeader,
} from '../src/lib/branding.mjs'

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
  shell: shellCommand,
  action: actionCommand,
  approval: approvalCommand,
  hook: hookCommand,
  impact: impactCommand,
  review: reviewCommand,
  work: workCommand,
  adapters: adaptersCommand,
}

function printHelp() {
  console.log(`${productHeader()}

Amplify developer judgment before and after AI-assisted coding.

Start here:
  ${PRIMARY_EXECUTABLE} work init "<active objective>" --mode implement
  ${PRIMARY_EXECUTABLE} work show
  ${PRIMARY_EXECUTABLE} impact "<change intent>"
  # Make the decisions and implement with your preferred AI coding tool.
  git add <expected-files>
  ${PRIMARY_EXECUTABLE} review "<change intent>" --staged --files <expected-files>

Usage:
  ${PRIMARY_EXECUTABLE} work init "<objective>" [--mode inspect|experiment|design|implement|release] [--files path,path] [--target path] [--json]
  ${PRIMARY_EXECUTABLE} work show [--target path] [--json]
  ${PRIMARY_EXECUTABLE} work handoff --completed text --validation text --decisions text --questions text --pending text --next text [--target path] [--json]
  ${PRIMARY_EXECUTABLE} adapters init [codex,claude,cursor,windsurf,opencode,antigravity] [--target path] [--json]
  ${PRIMARY_EXECUTABLE} impact "<change intent>" [--guidance learn|balanced|concise] [--file path] [--files path,path] [--target path] [--config path] [--json]
  ${PRIMARY_EXECUTABLE} review "<change intent>" --staged [--guidance learn|balanced|concise] [--file expected-path] [--files expected-paths] [--target path] [--config path] [--json]
  ${PRIMARY_EXECUTABLE} audit [target] [--json] [--feature name] [--config path]
  ${PRIMARY_EXECUTABLE} adr "<decision title>" [--json] [--target path] [--date YYYY-MM-DD] [--status Proposed]
  ${PRIMARY_EXECUTABLE} init [target] [--feature name] [--dry-run]
  ${PRIMARY_EXECUTABLE} check [target] [--json] [--feature name] [--config path]
  ${PRIMARY_EXECUTABLE} validate [target] [--json] [--feature name] [--config path]
  ${PRIMARY_EXECUTABLE} inspect --staged [--json] [--target path] [--config path]
  ${PRIMARY_EXECUTABLE} shell [target] [--config path]
  ${PRIMARY_EXECUTABLE} action prepare git.commit [--target path] [--config path] [--json]
  ${PRIMARY_EXECUTABLE} approval verify git.commit --receipt path [--target path] [--config path] [--json]
  ${PRIMARY_EXECUTABLE} approval enforce git.commit [--receipt path] [--target path] [--config path] [--json]
  ${PRIMARY_EXECUTABLE} hook <install|remove|status> pre-commit [--target path] [--json]
  ${PRIMARY_EXECUTABLE} classify "<change description>" [--json] [--file path] [--files path,path] [--target path] [--config path]
  ${PRIMARY_EXECUTABLE} enforce "<change description>" [--json] [--max-level "Level 2"] [--file path] [--files path,path] [--target path] [--config path]
  ${PRIMARY_EXECUTABLE} pr-checklist "<change description>" [--json] [--file path] [--files path,path] [--target path] [--config path]
  ${PRIMARY_EXECUTABLE} report [target] [--json] [--feature name] [--config path]

Compatibility:
  ${COMPATIBILITY_EXECUTABLE} remains supported with identical commands and behavior.

Judgment loop:
  work       Preserve the active repository, objective, mode, and boundaries across chats.
  adapters   Connect supported coding agents to the same Active Work boundary.
  impact     Build a repository-grounded technical Judgment Brief before implementation.
  review     Compare accepted intent and expected scope with staged Git evidence.

Project adoption (optional):
  audit      Preview repository state and what Riscala init would change.
  init       Create PSDM governance artifacts when durable project policy is justified.
  check      Check required artifacts exist and are non-empty.
  validate   Validate the adopted PSDM baseline.
  report     Print a markdown governance report.

Risk and delivery controls:
  adr        Create a new Architecture Decision Record under ADRs/.
  inspect    Inspect staged Git changes and explain their minimum governance level.
  shell      Open the operational Active Work governance shell.
  action     Build a content-bound record for a proposed action.
  approval   Verify a signed approval receipt against the live action.
  hook       Manage the Riscala pre-commit enforcement hook.
  classify   Estimate change level from a short description.
  enforce    Fail when a classified change exceeds the allowed maximum level.
  pr-checklist Generate a pull request checklist for a change.

Riscala advises; the developer owns the decision. impact and review require no init.
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
