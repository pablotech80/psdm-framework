import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { REQUIRED_ARTIFACTS } from '../lib/artifacts.mjs'
import { resolveTarget } from '../lib/paths.mjs'

export async function checkCommand(args) {
  const target = resolveTarget(args)
  let failures = 0

  console.log(`PSDM check: ${target}`)
  console.log('')

  for (const artifact of REQUIRED_ARTIFACTS) {
    const fullPath = join(target, artifact)

    if (!existsSync(fullPath)) {
      failures += 1
      console.log(`MISSING ${artifact}`)
      continue
    }

    const stat = statSync(fullPath)
    if (stat.isFile() && stat.size === 0) {
      failures += 1
      console.log(`EMPTY   ${artifact}`)
      continue
    }

    console.log(`OK      ${artifact}`)
  }

  console.log('')
  console.log(failures === 0 ? 'Status: complete' : `Status: incomplete (${failures} issue/s)`)

  return { exitCode: failures === 0 ? 0 : 1 }
}
