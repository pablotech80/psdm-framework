import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs, printJson } from '../lib/args.mjs'
import { loadConfig } from '../lib/config.mjs'
import { inspectGit } from '../lib/git.mjs'
import { resolveTarget } from '../lib/paths.mjs'

function featureArtifacts(target, config, feature) {
  if (feature) {
    return config.features.requiredArtifacts.map((artifact) =>
      join(config.features.root, feature, artifact),
    )
  }

  const featureRoot = join(target, config.features.root)
  if (!existsSync(featureRoot)) {
    return []
  }

  return readdirSync(featureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      config.features.requiredArtifacts.map((artifact) =>
        join(config.features.root, entry.name, artifact),
      ),
    )
}

function inspectArtifact(target, artifact) {
  const fullPath = join(target, artifact)

  if (!existsSync(fullPath)) {
    return { artifact, status: 'MISSING', message: 'Missing required artifact.' }
  }

  const stat = statSync(fullPath)
  if (stat.isFile() && stat.size === 0) {
    return { artifact, status: 'EMPTY', message: 'Artifact is empty.' }
  }

  return { artifact, status: 'OK', message: stat.isDirectory() ? 'Directory exists.' : 'Artifact exists.' }
}

export async function checkCommand(args) {
  const { options, positional } = parseArgs(args)
  const target = resolveTarget(positional)
  const configState = loadConfig(target, options.configPath)
  const artifacts = [
    ...configState.config.requiredArtifacts,
    ...featureArtifacts(target, configState.config, options.feature),
  ]
  const results = artifacts.map((artifact) => inspectArtifact(target, artifact))
  const git = inspectGit(target)
  const failures = results.filter((item) => item.status !== 'OK').length
  const payload = {
    command: 'check',
    target,
    config: {
      path: configState.path,
      exists: configState.exists,
      profile: configState.profile,
    },
    feature: options.feature || null,
    status: failures === 0 ? 'complete' : 'incomplete',
    failures,
    git,
    results,
  }

  if (options.json) {
    printJson(payload)
    return { exitCode: failures === 0 ? 0 : 1 }
  }

  console.log(`PSDM check: ${target}`)
  console.log('')

  for (const result of results) {
    console.log(`${result.status.padEnd(7)} ${result.artifact}`)
  }

  if (configState.config.git.warnOnDirty && git.isDirty) {
    console.log('')
    console.log(`WARN    git working tree has ${git.changes.length} uncommitted change/s`)
  }

  console.log('')
  console.log(failures === 0 ? 'Status: complete' : `Status: incomplete (${failures} issue/s)`)

  return { exitCode: failures === 0 ? 0 : 1 }
}
