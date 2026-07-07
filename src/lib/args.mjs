export function parseArgs(args) {
  const options = {
    json: false,
    configPath: null,
    feature: null,
  }
  const positional = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--json') {
      options.json = true
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

    positional.push(arg)
  }

  return { options, positional }
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2))
}
