import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { FEATURE_REQUIRED_ARTIFACTS, REQUIRED_ARTIFACTS } from './artifacts.mjs'

export const DEFAULT_CONFIG = {
  version: 1,
  requiredArtifacts: REQUIRED_ARTIFACTS,
  extraRequiredArtifacts: [],
  features: {
    root: 'docs/features',
    requiredArtifacts: FEATURE_REQUIRED_ARTIFACTS,
  },
  git: {
    warnOnDirty: true,
  },
}

function arrayOrDefault(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback
}

function resolveConfigPath(targetDir, configPath) {
  if (!configPath) {
    return join(targetDir, 'psdm.config.json')
  }

  return isAbsolute(configPath) ? configPath : resolve(process.cwd(), configPath)
}

export function loadConfig(targetDir, configPath = null) {
  const path = resolveConfigPath(targetDir, configPath)
  const exists = existsSync(path)
  const rawConfig = exists ? JSON.parse(readFileSync(path, 'utf8')) : {}

  const requiredArtifacts = [
    ...arrayOrDefault(rawConfig.requiredArtifacts, DEFAULT_CONFIG.requiredArtifacts),
    ...arrayOrDefault(rawConfig.extraRequiredArtifacts, DEFAULT_CONFIG.extraRequiredArtifacts),
  ]

  const config = {
    version: rawConfig.version || DEFAULT_CONFIG.version,
    requiredArtifacts,
    extraRequiredArtifacts: arrayOrDefault(
      rawConfig.extraRequiredArtifacts,
      DEFAULT_CONFIG.extraRequiredArtifacts,
    ),
    features: {
      root: rawConfig.features?.root || DEFAULT_CONFIG.features.root,
      requiredArtifacts: arrayOrDefault(
        rawConfig.features?.requiredArtifacts,
        DEFAULT_CONFIG.features.requiredArtifacts,
      ),
    },
    git: {
      warnOnDirty: rawConfig.git?.warnOnDirty ?? DEFAULT_CONFIG.git.warnOnDirty,
    },
  }

  return { path, exists, config }
}
