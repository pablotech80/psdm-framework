import { classifyChange } from './classifier.mjs'
import { levelPriority, SUPPORTED_LEVELS } from './risk-paths.mjs'

export function normalizeLevel(value) {
  if (!value) {
    return null
  }

  const trimmed = String(value).trim()
  if (SUPPORTED_LEVELS.includes(trimmed)) {
    return trimmed
  }

  if (/^[0-4]$/.test(trimmed)) {
    return `Level ${trimmed}`
  }

  return null
}

export function enforceChangeLevel({
  description,
  files = [],
  target,
  configPath = null,
  maxLevel = 'Level 2',
}) {
  const normalizedMaxLevel = normalizeLevel(maxLevel)
  const classification = classifyChange({ description, files, target, configPath })
  const violations = []

  if (!normalizedMaxLevel) {
    violations.push(`Unsupported max level: ${maxLevel}. Supported levels: ${SUPPORTED_LEVELS.join(', ')}.`)
  } else if (levelPriority(classification.estimatedLevel) > levelPriority(normalizedMaxLevel)) {
    violations.push(
      `Estimated ${classification.estimatedLevel} exceeds allowed ${normalizedMaxLevel}.`,
    )
  }

  const decision = violations.length > 0 ? 'CHANGE_LEVEL_BLOCKED' : 'CHANGE_LEVEL_APPROVED'

  return {
    command: 'enforce',
    decision,
    allowed: violations.length === 0,
    maxLevel: normalizedMaxLevel || maxLevel,
    supportedLevels: SUPPORTED_LEVELS,
    classification,
    violations,
  }
}
