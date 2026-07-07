const LEVEL_PRIORITY = {
  'Level 0': 0,
  'Level 1': 1,
  'Level 2': 2,
  'Level 3': 3,
  'Level 4': 4,
}

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
  return files.flatMap((file) => {
    const normalizedFile = normalizePath(file)

    return riskPaths
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
