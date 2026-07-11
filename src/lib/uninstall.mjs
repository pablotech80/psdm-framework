import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { REQUIRED_ARTIFACTS, TEMPLATE_MAP } from './artifacts.mjs'
import { removeAgentAdapters } from './agent-adapters.mjs'
import { templateDir } from './paths.mjs'

const PSDM_START = '<!-- riscala-psdm-governance -->'
const PSDM_END = '<!-- /riscala-psdm-governance -->'
const EXTRA_TEMPLATES = {
  'docs/PSDM_ADOPTION.md': 'PSDM_ADOPTION.md',
  'psdm.config.json': 'psdm.config.json',
}

function sameContent(path, expected) {
  return existsSync(path) && statSync(path).isFile() && readFileSync(path, 'utf8') === expected
}

function managedCandidates(target) {
  const templates = templateDir()
  const entries = [
    ...REQUIRED_ARTIFACTS.filter((artifact) => artifact !== 'ADRs').map((artifact) => [artifact, TEMPLATE_MAP[artifact]]),
    ...Object.entries(EXTRA_TEMPLATES),
  ]
  const unique = new Map(entries)
  return [...unique].map(([relativePath, templateName]) => ({
    relativePath,
    path: join(target, relativePath),
    expected: readFileSync(join(templates, templateName), 'utf8'),
  }))
}

function inspectAgents(target) {
  const path = join(target, 'AGENTS.md')
  if (!existsSync(path)) return null
  const content = readFileSync(path, 'utf8')
  if (!content.includes(PSDM_START)) return null
  return content.includes(PSDM_END) ? 'remove_block' : 'preserve_legacy_block'
}

export function inspectUninstall(target) {
  const root = resolve(target)
  const remove = []
  const preserve = []
  if (existsSync(join(root, '.riscala'))) remove.push('.riscala/')
  for (const item of managedCandidates(root)) {
    if (!existsSync(item.path)) continue
    if (sameContent(item.path, item.expected)) remove.push(item.relativePath)
    else if (item.relativePath !== 'AGENTS.md') preserve.push(item.relativePath)
  }
  const agents = inspectAgents(root)
  if (agents === 'remove_block') remove.push('AGENTS.md (bloque PSDM)')
  if (agents === 'preserve_legacy_block') preserve.push('AGENTS.md (integración antigua sin marcador final)')
  const adrs = join(root, 'ADRs')
  if (existsSync(adrs) && statSync(adrs).isDirectory()) {
    const entries = readdirSync(adrs)
    if (entries.length === 1 && entries[0] === 'README.md') {
      const expected = readFileSync(join(templateDir(), 'ADRS_README.md'), 'utf8')
      if (sameContent(join(adrs, 'README.md'), expected)) remove.push('ADRs/')
      else preserve.push('ADRs/')
    } else if (entries.length > 0) preserve.push('ADRs/')
  }
  return { target: root, remove: [...new Set(remove)], preserve: [...new Set(preserve)] }
}

function removePsdmAgentsBlock(target) {
  const path = join(target, 'AGENTS.md')
  if (!existsSync(path)) return false
  const content = readFileSync(path, 'utf8')
  const start = content.indexOf(PSDM_START)
  const end = content.indexOf(PSDM_END)
  if (start < 0 || end < start) return false
  const next = `${content.slice(0, start).trimEnd()}${content.slice(end + PSDM_END.length)}`.trim()
  if (next) writeFileSync(path, `${next}\n`)
  else rmSync(path)
  return true
}

export function uninstallProject(target) {
  const report = inspectUninstall(target)
  const removed = []
  if (removePsdmAgentsBlock(report.target)) removed.push('AGENTS.md (bloque PSDM)')
  const adapters = removeAgentAdapters(report.target)
  removed.push(...adapters.removed)
  for (const relativePath of report.remove) {
    if (relativePath.includes('(')) continue
    const path = join(report.target, relativePath.replace(/\/$/, ''))
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true })
      removed.push(relativePath)
    }
  }
  const docs = join(report.target, 'docs')
  if (existsSync(docs) && readdirSync(docs).length === 0) rmSync(docs, { recursive: true })
  return { ...report, removed: [...new Set(removed)], preserved: [...new Set([...report.preserve, ...adapters.preserved])] }
}
