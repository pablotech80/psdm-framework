import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function frameworkRoot() {
  return rootDir
}

export function templateDir() {
  return resolve(rootDir, 'templates')
}

export function resolveTarget(args) {
  return resolve(args[0] || process.cwd())
}
