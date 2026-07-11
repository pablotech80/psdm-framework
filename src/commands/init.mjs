import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { TEMPLATE_MAP } from '../lib/artifacts.mjs'
import { parseArgs } from '../lib/args.mjs'
import { buildAudit, detectAiGovernance, printAuditReport } from '../lib/audit.mjs'
import { loadConfig } from '../lib/config.mjs'
import { resolveTarget, templateDir } from '../lib/paths.mjs'
import { detectLanguage } from '../lib/active-work.mjs'

const PSDM_AGENTS_MARKER = '<!-- riscala-psdm-governance -->'
const PSDM_AGENTS_END_MARKER = '<!-- /riscala-psdm-governance -->'

function missingAgentsSections(content) {
  return ['# AGENTS.md', 'Required Reading', 'Boundaries', 'Escalation']
    .filter((marker) => !content.includes(marker))
}

function agentsIntegrationBlock(missing, language) {
  const spanish = language === 'es'
  const sections = []
  if (missing.includes('# AGENTS.md')) {
    sections.push('# AGENTS.md — PSDM Integration')
  }
  if (missing.includes('Required Reading')) {
    sections.push(`## PSDM Required Reading / Lectura obligatoria

${spanish ? 'Antes de modificar, lee' : 'Before modifying, read'} \`.riscala/ACTIVE_WORK.md\`, \`psdm.config.json\` ${spanish ? 'y los documentos PSDM relacionados con el cambio' : 'and the PSDM documents relevant to the change'}.`)
  }
  if (missing.includes('Boundaries')) {
    sections.push(`## PSDM Boundaries / Límites

- ${spanish ? 'Trabaja únicamente dentro del repositorio y del objetivo definidos en `.riscala/ACTIVE_WORK.md`.' : 'Work only inside the repository and objective defined in `.riscala/ACTIVE_WORK.md`.'}
- ${spanish ? 'No amplíes el alcance, el modo ni la autoridad sin una transición explícita.' : 'Do not expand scope, mode, or authority without an explicit transition.'}
- ${spanish ? 'Conserva los cambios ajenos, secretos, credenciales y datos privados.' : 'Preserve unrelated changes, secrets, credentials, and private data.'}`)
  }
  if (missing.includes('Escalation')) {
    sections.push(`## PSDM Escalation / Escalado

${spanish ? 'Detente y pide una decisión cuando cambien el repositorio, el objetivo o el modo; cuando falte una decisión material; o cuando exista riesgo de seguridad, datos, despliegue o producción.' : 'Stop and request a decision when repository, objective, or mode changes; when a material decision is missing; or when security, data, deployment, or production risk is unclear.'}`)
  }
  return `${sections.join('\n\n')}\n\n${PSDM_AGENTS_END_MARKER}\n`
}

function integrateExistingAgents(path, language) {
  const content = readFileSync(path, 'utf8')
  const missing = missingAgentsSections(content)
  if (missing.length === 0) return false
  const marker = content.includes(PSDM_AGENTS_MARKER) ? '' : `${PSDM_AGENTS_MARKER}\n\n`
  const separator = content.endsWith('\n') ? '\n' : '\n\n'
  appendFileSync(path, `${separator}${marker}${agentsIntegrationBlock(missing, language)}`)
  return true
}

export function initializeProject({ target, configPath = null, feature = null, language = detectLanguage(), log = console.log }) {
  const templates = templateDir()
  const configState = loadConfig(target, configPath)
  const aiGovernance = detectAiGovernance(target)
  const featureArtifacts = feature
    ? configState.config.features.requiredArtifacts.map((artifact) =>
      join(configState.config.features.root, feature, artifact),
    )
    : []
  const artifacts = feature ? featureArtifacts : configState.config.requiredArtifacts
  let created = 0
  let updated = 0
  let skipped = 0

  mkdirSync(target, { recursive: true })

  for (const artifact of artifacts) {
    const destination = join(target, artifact)

    if (artifact === 'ADRs') {
      if (!existsSync(destination)) {
        mkdirSync(destination, { recursive: true })
        const readme = join(destination, 'README.md')
        const template = readFileSync(join(templates, 'ADRS_README.md'), 'utf8')
        writeFileSync(readme, template)
        created += 1
        log(`CREATED ${artifact}`)
      } else {
        const readme = join(destination, 'README.md')
        if (!existsSync(readme)) {
          const template = readFileSync(join(templates, 'ADRS_README.md'), 'utf8')
          writeFileSync(readme, template)
        }
        skipped += 1
        log(`SKIP    ${artifact}`)
      }
      continue
    }

    if (existsSync(destination)) {
      if (!feature && artifact === 'AGENTS.md' && integrateExistingAgents(destination, language)) {
        updated += 1
        log(`UPDATED ${artifact}`)
        continue
      }
      skipped += 1
      log(`SKIP    ${artifact}`)
      continue
    }

    mkdirSync(dirname(destination), { recursive: true })
    const templateName = TEMPLATE_MAP[artifact] || TEMPLATE_MAP[artifact.split('/').at(-1)]
    const template = templateName
      ? readFileSync(join(templates, templateName), 'utf8')
      : `# ${artifact.split('/').at(-1)}\n\nTODO: Define project-specific PSDM content.\n`
    writeFileSync(destination, template)
    created += 1
    log(`CREATED ${artifact}`)
  }

  if (!feature && aiGovernance.adoptionMode === 'integrate') {
    const adoptionArtifact = 'docs/PSDM_ADOPTION.md'
    const adoptionDestination = join(target, adoptionArtifact)

    if (!existsSync(adoptionDestination)) {
      mkdirSync(dirname(adoptionDestination), { recursive: true })
      const template = readFileSync(join(templates, 'PSDM_ADOPTION.md'), 'utf8')
      writeFileSync(adoptionDestination, template)
      created += 1
      log(`CREATED ${adoptionArtifact}`)
    } else {
      skipped += 1
      log(`SKIP    ${adoptionArtifact}`)
    }
  }

  if (!feature && !configPath) {
    const configDestination = join(target, 'psdm.config.json')
    if (!existsSync(configDestination)) {
      const template = readFileSync(join(templates, 'psdm.config.json'), 'utf8')
      writeFileSync(configDestination, template)
      created += 1
      log('CREATED psdm.config.json')
    } else {
      skipped += 1
      log('SKIP    psdm.config.json')
    }
  }

  return { created, updated, skipped }
}

export async function initCommand(args) {
  const { options, positional } = parseArgs(args)
  const target = resolveTarget(positional)

  if (options.dryRun) {
    printAuditReport(buildAudit(target, {
      configPath: options.configPath,
      feature: options.feature,
    }))
    return { exitCode: 0 }
  }

  const result = initializeProject({
    target,
    configPath: options.configPath,
    feature: options.feature,
  })

  console.log('')
  console.log(`Riscala init complete. Created: ${result.created}. Updated: ${result.updated}. Skipped: ${result.skipped}.`)
  console.log('Method: PSDM')

  return { exitCode: 0 }
}
