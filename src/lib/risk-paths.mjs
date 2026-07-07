export const LEVEL_PRIORITY = {
  'Level 0': 0,
  'Level 1': 1,
  'Level 2': 2,
  'Level 3': 3,
  'Level 4': 4,
}

export const SUPPORTED_LEVELS = Object.keys(LEVEL_PRIORITY)
export const RISK_PATH_LEVELS = SUPPORTED_LEVELS.filter((level) => level !== 'Level 0')

export function levelPriority(level) {
  return LEVEL_PRIORITY[level] ?? 0
}

export function highestLevel(levels) {
  return levels
    .filter(Boolean)
    .sort((a, b) => levelPriority(b) - levelPriority(a))[0] || 'Level 0'
}

function escapeRegex(value) {
  return value.replace(/[.+^${}()|[\]\\]/g, '\\$&')
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validStringArray(value) {
  return Array.isArray(value) && value.every(nonEmptyString)
}

function isMatchableRiskPathRule(rule) {
  return isPlainObject(rule)
    && nonEmptyString(rule.pattern)
    && RISK_PATH_LEVELS.includes(rule.minimumLevel)
    && validStringArray(rule.requiredArtifacts)
    && nonEmptyString(rule.reason)
}

export function validateRiskPathRules(riskPaths) {
  if (!Array.isArray(riskPaths)) {
    return [
      {
        message: 'riskPaths must be an array.',
        priority: 'High',
      },
    ]
  }

  return riskPaths.flatMap((rule, index) => {
    const prefix = `riskPaths[${index}]`
    const issues = []

    if (!isPlainObject(rule)) {
      return [
        {
          message: `${prefix} must be an object.`,
          priority: 'High',
        },
      ]
    }

    if (!nonEmptyString(rule.pattern)) {
      issues.push({
        message: `${prefix}.pattern must be a non-empty string.`,
        priority: 'High',
      })
    }

    if (!RISK_PATH_LEVELS.includes(rule.minimumLevel)) {
      issues.push({
        message: `${prefix}.minimumLevel must be one of: ${RISK_PATH_LEVELS.join(', ')}.`,
        priority: 'High',
      })
    }

    if (!validStringArray(rule.requiredArtifacts)) {
      issues.push({
        message: `${prefix}.requiredArtifacts must be an array of non-empty strings.`,
        priority: 'High',
      })
    }

    if (!nonEmptyString(rule.reason)) {
      issues.push({
        message: `${prefix}.reason must be a non-empty string.`,
        priority: 'Medium',
      })
    }

    return issues
  })
}

function patternToRegex(pattern) {
  const normalized = normalizePath(pattern)
  let regex = '^'

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index]
    const next = normalized[index + 1]

    if (char === '*' && next === '*') {
      regex += '.*'
      index += 1
      continue
    }

    if (char === '*') {
      regex += '[^/]*'
      continue
    }

    regex += escapeRegex(char)
  }

  regex += '$'
  return new RegExp(regex)
}

export function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\/+/, '')
}

export function matchRiskPaths(files, riskPaths) {
  if (!Array.isArray(riskPaths)) {
    return []
  }

  return files.flatMap((file) => {
    const normalizedFile = normalizePath(file)

    return riskPaths
      .filter(isMatchableRiskPathRule)
      .filter((rule) => patternToRegex(rule.pattern).test(normalizedFile))
      .map((rule) => ({
        file: normalizedFile,
        pattern: rule.pattern,
        minimumLevel: rule.minimumLevel,
        requiredArtifacts: rule.requiredArtifacts || [],
        reason: rule.reason || 'Path matches a configured PSDM risk rule.',
      }))
  })
}
