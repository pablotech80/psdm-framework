export function parseArgs(args) {
  const options = {
    json: false,
    configPath: null,
    feature: null,
    target: null,
    files: [],
    maxLevel: null,
    status: null,
    date: null,
    dryRun: false,
    staged: false,
  }
  const positional = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--json') {
      options.json = true
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--staged') {
      options.staged = true
      continue
    }

    if (arg === '--config') {
      options.configPath = args[index + 1] || null
      index += 1
      continue
    }

    if (arg === '--feature') {
      options.feature = args[index + 1] || null
      index += 1
      continue
    }

    if (arg === '--target') {
      options.target = args[index + 1] || null
      index += 1
      continue
    }

    if (arg === '--file') {
      if (args[index + 1]) {
        options.files.push(args[index + 1])
      }
      index += 1
      continue
    }

    if (arg === '--files') {
      if (args[index + 1]) {
        options.files.push(...args[index + 1].split(',').map((file) => file.trim()).filter(Boolean))
      }
      index += 1
      continue
    }

    if (arg === '--max-level') {
      options.maxLevel = args[index + 1] || null
      index += 1
      continue
    }

    if (arg === '--status') {
      options.status = args[index + 1] || null
      index += 1
      continue
    }

    if (arg === '--date') {
      options.date = args[index + 1] || null
      index += 1
      continue
    }

    positional.push(arg)
  }

  return { options, positional }
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2))
}
