import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { REQUIRED_ARTIFACTS, TEMPLATE_MAP } from '../lib/artifacts.mjs'
import { resolveTarget, templateDir } from '../lib/paths.mjs'

export async function initCommand(args) {
  const target = resolveTarget(args)
  const templates = templateDir()
  let created = 0
  let skipped = 0

  mkdirSync(target, { recursive: true })

  for (const artifact of REQUIRED_ARTIFACTS) {
    const destination = join(target, artifact)

    if (artifact === 'ADRs') {
      if (!existsSync(destination)) {
        mkdirSync(destination, { recursive: true })
        created += 1
        console.log(`CREATED ${artifact}`)
      } else {
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
    const templateName = TEMPLATE_MAP[artifact]
    const template = readFileSync(join(templates, templateName), 'utf8')
    writeFileSync(destination, template)
    created += 1
    console.log(`CREATED ${artifact}`)
  }

  console.log('')
  console.log(`PSDM init complete. Created: ${created}. Skipped: ${skipped}.`)

  return { exitCode: 0 }
}
