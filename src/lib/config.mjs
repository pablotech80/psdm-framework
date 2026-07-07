import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { FEATURE_REQUIRED_ARTIFACTS, REQUIRED_ARTIFACTS } from './artifacts.mjs'

export const PROFILE_PRESETS = {
  standard: {
    requiredArtifacts: [],
    riskPaths: [],
  },
  framework: {
    requiredArtifacts: ['ROADMAP.md', 'TODO.md'],
    riskPaths: [
      {
        pattern: 'bin/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'CLI entrypoint changes alter user-facing command behavior.',
      },
      {
        pattern: 'src/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Framework source changes alter PSDM behavior.',
      },
      {
        pattern: 'templates/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Template changes affect newly initialized PSDM projects.',
      },
      {
        pattern: 'tests/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/TESTING.md'],
        reason: 'Fixture changes affect regression coverage.',
      },
    ],
  },
  'backend-api': {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'backend/auth/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SECURITY.md', 'docs/TESTING.md'],
        reason: 'Authentication and authorization changes can expose private data or bypass access control.',
      },
      {
        pattern: 'backend/migrations/**',
        minimumLevel: 'Level 4',
        requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
        reason: 'Database migrations can require rollback and production operations planning.',
      },
    ],
  },
  'ai-agent': {
    requiredArtifacts: ['docs/SECURITY.md', 'docs/ARCHITECTURE.md'],
    riskPaths: [
      {
        pattern: 'agents/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
        reason: 'AI agent changes can affect tool use, data exposure, and autonomous behavior.',
      },
      {
        pattern: 'rag/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
        reason: 'RAG changes can affect private data retrieval, context construction, and output trust.',
      },
    ],
  },
  saas: {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'backend/payments/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/SPEC.md', 'docs/SECURITY.md', 'docs/TESTING.md'],
        reason: 'Payment changes affect money movement and customer billing state.',
      },
      {
        pattern: 'infra/**',
        minimumLevel: 'Level 4',
        requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
        reason: 'Infrastructure changes can affect deployment, availability, and runtime security.',
      },
    ],
  },
  monorepo: {
    requiredArtifacts: [],
    riskPaths: [
      {
        pattern: 'packages/**',
        minimumLevel: 'Level 2',
        requiredArtifacts: ['docs/SPEC.md', 'docs/TESTING.md'],
        reason: 'Package changes can affect shared behavior across a monorepo.',
      },
    ],
  },
}

export const SUPPORTED_PROFILES = Object.keys(PROFILE_PRESETS)

export const DEFAULT_CONFIG = {
  version: 1,
  profile: 'standard',
  requiredArtifacts: REQUIRED_ARTIFACTS,
  extraRequiredArtifacts: [],
  features: {
    root: 'docs/features',
    requiredArtifacts: FEATURE_REQUIRED_ARTIFACTS,
  },
  git: {
    warnOnDirty: true,
  },
  riskPaths: [
    {
      pattern: 'backend/auth/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SECURITY.md', 'docs/TESTING.md'],
      reason: 'Authentication and authorization changes can expose private data or bypass access control.',
    },
    {
      pattern: 'backend/payments/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/SECURITY.md', 'docs/TESTING.md'],
      reason: 'Payment changes affect money movement and customer billing state.',
    },
    {
      pattern: 'backend/migrations/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
      reason: 'Database migrations can require rollback and production operations planning.',
    },
    {
      pattern: 'infra/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md'],
      reason: 'Infrastructure changes can affect deployment, availability, and runtime security.',
    },
    {
      pattern: 'agents/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
      reason: 'AI agent changes can affect tool use, data exposure, and autonomous behavior.',
    },
    {
      pattern: 'rag/**',
      minimumLevel: 'Level 3',
      requiredArtifacts: ['docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/SECURITY.md'],
      reason: 'RAG changes can affect private data retrieval, context construction, and output trust.',
    },
    {
      pattern: '.github/workflows/**',
      minimumLevel: 'Level 4',
      requiredArtifacts: ['docs/DEPLOYMENT.md', 'docs/OPERATIONS.md', 'docs/SECURITY.md'],
      reason: 'CI workflow changes can alter release, secret, and deployment behavior.',
    },
  ],
}

function arrayOrDefault(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : fallback
}

function uniqueByValue(items) {
  return Array.from(new Set(items))
}

function uniqueRiskPaths(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = `${item?.pattern}:${item?.minimumLevel}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
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
  const profileName = rawConfig.profile || DEFAULT_CONFIG.profile
  const profile = PROFILE_PRESETS[profileName] || PROFILE_PRESETS.standard

  const requiredArtifacts = uniqueByValue([
    ...arrayOrDefault(rawConfig.requiredArtifacts, DEFAULT_CONFIG.requiredArtifacts),
    ...profile.requiredArtifacts,
    ...arrayOrDefault(rawConfig.extraRequiredArtifacts, DEFAULT_CONFIG.extraRequiredArtifacts),
  ])

  const config = {
    version: rawConfig.version || DEFAULT_CONFIG.version,
    profile: profileName,
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
    riskPaths: uniqueRiskPaths([
      ...profile.riskPaths,
      ...arrayOrDefault(rawConfig.riskPaths, DEFAULT_CONFIG.riskPaths),
    ]),
  }

  return {
    path,
    exists,
    rawConfig,
    config,
    profile: {
      name: profileName,
      recognized: Boolean(PROFILE_PRESETS[profileName]),
      requiredArtifacts: profile.requiredArtifacts,
      riskPaths: profile.riskPaths,
    },
  }
}
