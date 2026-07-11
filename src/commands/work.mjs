import { parseArgs, printJson } from '../lib/args.mjs'
import { createActiveWork, detectLanguage, readActiveWork, recordActiveWorkHandoff, WORK_MODES } from '../lib/active-work.mjs'
import { resolveTarget } from '../lib/paths.mjs'

function invalidOptions(options) {
  return options.feature !== null
    || options.maxLevel !== null
    || options.status !== null
    || options.date !== null
    || options.dryRun
    || options.staged
    || options.receiptPath !== null
    || options.guidance !== null
    || options.configPath !== null
}

export async function workCommand(args) {
  if (args[0] === 'handoff') {
    const values = { completed: null, validation: null, decisions: null, questions: null, pending: null, next: null, target: null, json: false }
    for (let index = 1; index < args.length; index += 1) {
      const key = args[index]
      if (key === '--json') values.json = true
      else if (['--completed', '--validation', '--decisions', '--questions', '--pending', '--next', '--target'].includes(key)) {
        values[key.slice(2)] = args[index + 1] || null
        index += 1
      } else {
        console.error('Usage: riscala work handoff --completed text --validation text --decisions text --questions text --pending text --next text [--target path] [--json]')
        return { exitCode: 1 }
      }
    }
    if (!values.completed || !values.validation || !values.decisions || !values.questions || !values.pending || !values.next) {
      console.error('Usage: riscala work handoff --completed text --validation text --decisions text --questions text --pending text --next text [--target path] [--json]')
      return { exitCode: 1 }
    }
    const target = values.target ? resolveTarget([values.target]) : process.cwd()
    const result = recordActiveWorkHandoff({ target, completed: values.completed, validation: values.validation, decisions: values.decisions, questions: values.questions, pending: values.pending, next: values.next })
    const report = { command: 'work', operation: 'handoff', target, ...result }
    if (values.json) printJson(report)
    else console.log(result.updated ? `Active Work handoff recorded: ${result.path}` : `Active Work handoff not recorded: ${result.reason}`)
    return { exitCode: result.updated ? 0 : 1 }
  }
  const { options, positional } = parseArgs(args)
  const [operation, ...rest] = positional
  const target = options.target ? resolveTarget([options.target]) : process.cwd()

  if (operation === 'init') {
    const objective = rest.join(' ').trim()
    const mode = options.mode || 'implement'
    if (!objective || invalidOptions(options) || !WORK_MODES.includes(mode)) {
      console.error('Usage: riscala work init "<objective>" [--mode inspect|experiment|design|implement|release] [--files path,path] [--target path] [--json]')
      return { exitCode: 1 }
    }
    const result = createActiveWork({ target, objective, mode, language: detectLanguage(), allowedPaths: options.files })
    const report = { command: 'work', operation, target, mode, objective, allowedPaths: options.files, ...result }
    if (options.json) printJson(report)
    else console.log(result.created ? `Active Work created: ${result.path}` : `Active Work already exists: ${result.path}`)
    return { exitCode: result.created ? 0 : 1 }
  }

  if (operation === 'show' && rest.length === 0 && options.mode === null && options.files.length === 0 && !invalidOptions(options)) {
    const report = { command: 'work', operation, target, ...readActiveWork(target) }
    if (options.json) printJson(report)
    else if (report.exists) console.log(report.content.trimEnd())
    else console.error(`Active Work not found: ${report.path}`)
    return { exitCode: report.exists ? 0 : 1 }
  }

  console.error('Usage: riscala work <init "objective" [--mode mode]|show> [--target path] [--json]')
  return { exitCode: 1 }
}
