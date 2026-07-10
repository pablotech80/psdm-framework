import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { TEMPLATE_MAP } from '../lib/artifacts.mjs'
import { parseArgs } from '../lib/args.mjs'
import { buildAudit, detectAiGovernance, printAuditReport } from '../lib/audit.mjs'
import { loadConfig } from '../lib/config.mjs'
import { resolveTarget, templateDir } from '../lib/paths.mjs'

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

  const templates = templateDir()
  const configState = loadConfig(target, options.configPath)
  const aiGovernance = detectAiGovernance(target)
  const featureArtifacts = options.feature
    ? configState.config.features.requiredArtifacts.map((artifact) =>
      join(configState.config.features.root, options.feature, artifact),
    )
    : []
  const artifacts = options.feature ? featureArtifacts : configState.config.requiredArtifacts
  let created = 0
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
        console.log(`CREATED ${artifact}`)
      } else {
        const readme = join(destination, 'README.md')
        if (!existsSync(readme)) {
          const template = readFileSync(join(templates, 'ADRS_README.md'), 'utf8')
          writeFileSync(readme, template)
        }
        skipped += 1
        console.log(`SKIP    ${artifact}`)
      }
      continue
    }

    if (existsSync(destination)) {
      skipped += 1
      console.log(`SKIP    ${artifact}`)
      continue
    }

    mkdirSync(dirname(destination), { recursive: true })
    const templateName = TEMPLATE_MAP[artifact] || TEMPLATE_MAP[artifact.split('/').at(-1)]
    const template = templateName
      ? readFileSync(join(templates, templateName), 'utf8')
      : `# ${artifact.split('/').at(-1)}\n\nTODO: Define project-specific PSDM content.\n`
    writeFileSync(destination, template)
    created += 1
    console.log(`CREATED ${artifact}`)
  }

  if (!options.feature && aiGovernance.adoptionMode === 'integrate') {
    const adoptionArtifact = 'docs/PSDM_ADOPTION.md'
    const adoptionDestination = join(target, adoptionArtifact)

    if (!existsSync(adoptionDestination)) {
      mkdirSync(dirname(adoptionDestination), { recursive: true })
      const template = readFileSync(join(templates, 'PSDM_ADOPTION.md'), 'utf8')
      writeFileSync(adoptionDestination, template)
      created += 1
      console.log(`CREATED ${adoptionArtifact}`)
    } else {
      skipped += 1
      console.log(`SKIP    ${adoptionArtifact}`)
    }
  }

  if (!options.feature && !options.configPath) {
    const configDestination = join(target, 'psdm.config.json')
    if (!existsSync(configDestination)) {
      const template = readFileSync(join(templates, 'psdm.config.json'), 'utf8')
      writeFileSync(configDestination, template)
      created += 1
      console.log('CREATED psdm.config.json')
    } else {
      skipped += 1
      console.log('SKIP    psdm.config.json')
    }
  }

  console.log('')
  console.log(`Riscala init complete. Created: ${created}. Skipped: ${skipped}.`)
  console.log('Method: PSDM')

  return { exitCode: 0 }
}
