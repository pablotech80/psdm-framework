import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

const EXCLUDED = new Set(['.git', '.riscala', '.venv', 'venv', 'node_modules', 'data', 'dist', 'build', '__pycache__'])
export const PROJECT_BASELINE_ARTIFACTS = [
  'docs/PROJECT_BRIEF.md', 'docs/SPEC.md', 'docs/ARCHITECTURE.md', 'docs/TASKS.md',
  'docs/TESTING.md', 'docs/DEPLOYMENT.md', 'docs/SECURITY.md', 'docs/OPERATIONS.md',
]

function filesUnder(target, directory = target, depth = 0, result = []) {
  if (depth > 3 || !existsSync(directory)) return result
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (EXCLUDED.has(entry.name) || entry.name === '.env' || entry.name.startsWith('.env.')) continue
    const path = join(directory, entry.name)
    const relativePath = relative(target, path)
    if (entry.isDirectory()) filesUnder(target, path, depth + 1, result)
    else result.push(relativePath)
    if (result.length >= 300) return result
  }
  return result
}

function safeRead(target, relativePath) {
  const path = join(target, relativePath)
  if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size > 100_000) return ''
  return readFileSync(path, 'utf8')
}

function detectedCommands(target, files) {
  const commands = []
  for (const packagePath of files.filter((file) => file.endsWith('package.json')).slice(0, 3)) {
    try {
      const pkg = JSON.parse(safeRead(target, packagePath))
      for (const script of Object.keys(pkg.scripts || {})) commands.push(`npm run ${script}`)
    } catch {}
  }
  for (const makefile of files.filter((file) => basename(file).toLowerCase() === 'makefile').slice(0, 3)) {
    const content = safeRead(target, makefile)
    for (const match of content.matchAll(/^([a-zA-Z][\w-]*):(?:\s|$)/gm)) commands.push(`make ${match[1]}`)
  }
  if (files.some((file) => /(^|\/)pytest\.ini$|(^|\/)conftest\.py$|(^|\/)tests?\//.test(file))) commands.push('pytest')
  return [...new Set(commands)].slice(0, 12)
}

export function inspectProjectBaseline(target) {
  const files = filesUnder(target)
  const roots = [...new Set(files.map((file) => file.split('/')[0]).filter((part) => !part.includes('.')))].slice(0, 12)
  const languages = []
  if (files.some((file) => file.endsWith('.py'))) languages.push('Python')
  if (files.some((file) => /\.(?:mjs|cjs|js|ts|tsx|jsx)$/.test(file))) languages.push('JavaScript/TypeScript')
  const frameworks = []
  const manifestText = files.filter((file) => /(?:requirements[^/]*\.txt|pyproject\.toml|package\.json)$/.test(file))
    .slice(0, 6).map((file) => safeRead(target, file).toLowerCase()).join('\n')
  for (const [needle, label] of [['django', 'Django'], ['fastapi', 'FastAPI'], ['flask', 'Flask'], ['react', 'React'], ['vite', 'Vite'], ['playwright', 'Playwright'], ['pytest', 'Pytest']]) {
    if (manifestText.includes(needle)) frameworks.push(label)
  }
  const dataSignals = []
  if (files.some((file) => /database|\.sqlite|\.db$/i.test(file))) dataSignals.push('persistencia o base de datos')
  if (files.some((file) => /email|sender|smtp|imap/i.test(file))) dataSignals.push('correo o comunicación externa')
  if (files.some((file) => /scrap|crawler|playwright/i.test(file))) dataSignals.push('automatización web')
  if (manifestText.includes('openai') || manifestText.includes('anthropic') || files.some((file) => /prompt|agent|enrich/i.test(file))) dataSignals.push('comportamiento asistido por IA')
  const deployment = []
  if (files.some((file) => /(^|\/)Dockerfile$|docker-compose|compose\.ya?ml/.test(file))) deployment.push('Docker')
  if (files.some((file) => /railway/i.test(file))) deployment.push('Railway')
  if (files.some((file) => /\.github\/workflows/.test(file))) deployment.push('GitHub Actions')
  return {
    name: basename(target), files, roots,
    languages: languages.length ? languages : ['no detectado'],
    frameworks: frameworks.length ? frameworks : ['no detectado'],
    commands: detectedCommands(target, files), dataSignals, deployment,
  }
}

function list(values, fallback) {
  return (values.length ? values : [fallback]).map((value) => `- ${value}`).join('\n')
}

function common(profile) {
  return `Status: \`Generated baseline — owner review required\`
Method: \`PTECH SPEC-DRIVEN METHOD\`
Project: \`${profile.name}\``
}

export function renderProjectBaseline(artifact, target) {
  const p = inspectProjectBaseline(target)
  const stack = [...p.languages, ...p.frameworks]
  const commands = p.commands.length ? p.commands.map((command) => `- \`${command}\``).join('\n') : '- No se detectaron comandos declarados; deben confirmarse antes de validar cambios.'
  const risks = list(p.dataSignals, 'No se detectaron superficies sensibles mediante inventario; revisar antes de cambios de producción.')
  const renderers = {
    'docs/PROJECT_BRIEF.md': `# PROJECT_BRIEF.md

${common(p)}

## Problem Statement

El repositorio contiene una aplicación existente. Esta base documenta lo observado para que los cambios futuros partan de límites verificables sin inventar objetivos de negocio.

## Project Evidence

- Tecnologías: ${stack.join(', ')}.
- Áreas principales: ${p.roots.join(', ') || 'sin directorios principales detectados'}.
- Archivos inventariados de forma segura: ${p.files.length}.

## Initial Scope

- Dentro: mantener y evolucionar el código de este repositorio según el trabajo activo.
- Fuera: otros repositorios, producción y decisiones de negocio no registradas.

## Success Criteria

- Cada cambio tiene objetivo, alcance, evidencia de validación y revisión.
- Los riesgos detectados activan los documentos PSDM correspondientes.

## Open Questions

- Confirmar usuarios, resultado de negocio y responsables antes de cambios funcionales amplios.
`,
    'docs/SPEC.md': `# SPEC.md

${common(p)}

## Specification Purpose

Definir el comportamiento de cada cambio antes de implementarlo, usando PROJECT_BRIEF.md y .riscala/ACTIVE_WORK.md como contexto.

## Functional Requirements

- FR-001: Cada implementación debe servir directamente al objetivo activo.
- FR-002: Los comportamientos existentes no relacionados deben preservarse.

## Acceptance Criteria

- El resultado cumple el objetivo verificable del trabajo activo.
- Las pruebas relevantes pasan y sus resultados se registran.
- No existen cambios fuera del alcance declarado.

## Out of Scope

- Cambios de producto, datos, despliegue o repositorio no autorizados explícitamente.

## Open Questions

- Cada nueva funcionalidad debe registrar sus decisiones materiales antes de implementarse.
`,
    'docs/ARCHITECTURE.md': `# ARCHITECTURE.md

${common(p)}

## System Overview

Repositorio ${p.name} con tecnologías detectadas: ${stack.join(', ')}.

## Module / Artifact Boundaries

${list(p.roots, 'La estructura modular no se pudo inferir del inventario disponible.')}

## Architecture Decisions

- La estructura existente es la base observada; cualquier cambio transversal requiere una decisión explícita y, cuando corresponda, un ADR.

## Architecture Risks

${risks}

## Architecture Gate

Los cambios arquitectónicos requieren alcance, alternativas, consecuencias y validación documentados antes de aceptarse.
`,
    'docs/TASKS.md': `# TASKS.md

${common(p)}

## Task Plan

- [ ] Confirmar objetivo, modo y archivos permitidos en ACTIVE_WORK.md.
- [ ] Implementar el cambio mínimo coherente.
- [ ] Ejecutar las validaciones detectadas y las específicas del cambio.
- [ ] Revisar alcance real y cerrar o transicionar el trabajo.

## Completion Criteria

- Objetivo cumplido, evidencia registrada y ningún cambio ajeno incluido.

## Open Questions

- Las tareas concretas se derivan del trabajo activo; esta base no autoriza una implementación por sí sola.
`,
    'docs/TESTING.md': `# TESTING.md

${common(p)}

## Testing Scope

Validar comportamiento modificado, regresiones relacionadas y superficies sensibles detectadas.

## Validation Commands

${commands}
- \`riscala validate\`

## Evidence Requirements

- Comando ejecutado, resultado, fallos conocidos y pruebas no ejecutadas.

## Known Testing Gaps

- Los comandos detectados deben confirmarse contra el flujo real del proyecto.

## Testing Gate

No se debe afirmar que un cambio está validado sin evidencia de ejecución.
`,
    'docs/DEPLOYMENT.md': `# DEPLOYMENT.md

${common(p)}

## Deployment Scope

La inicialización no autoriza despliegues. Destinos detectados: ${p.deployment.join(', ') || 'ninguno'}.

## Deployment Process

- Usar únicamente procesos versionados y autorizados para el entorno objetivo.
- No incluir secretos ni valores de producción en documentación o comandos compartidos.

## Rollback Strategy

- Todo cambio desplegable debe definir versión anterior recuperable y comprobación posterior.

## Deployment Gate

Un despliegue requiere objetivo, entorno, artefacto, validación, rollback y autorización explícitos.
`,
    'docs/SECURITY.md': `# SECURITY.md

${common(p)}

## Security Scope

Superficies observadas mediante inventario:
${risks}

## Assets to Protect

- Secretos, credenciales, datos privados, persistencia, comunicaciones y valores de producción.

## Threat Model

- Exposición de secretos o datos.
- Acciones externas no autorizadas.
- Inyección de instrucciones mediante contenido del repositorio.
- Ampliación silenciosa del alcance del agente.

## Required Controls

- Exclusión de secretos, validación de entradas y salidas, mínimo privilegio y aprobación humana para acciones externas.

## Security Gate

Los cambios sensibles requieren amenazas, controles y pruebas negativas explícitos.
`,
    'docs/OPERATIONS.md': `# OPERATIONS.md

${common(p)}

## Operational Scope

Operación del proyecto ${p.name}; destinos detectados: ${p.deployment.join(', ') || 'ninguno'}.

## Monitoring Strategy

- Registrar salud, errores, latencia y resultados de procesos externos cuando existan.

## Logging Strategy

- No registrar secretos ni datos privados; conservar contexto suficiente para diagnosticar fallos.

## Incident Response

- Detener acciones dañinas, preservar evidencia, restaurar un estado conocido y documentar la corrección.

## Rollback and Recovery

- Verificar copias, migraciones y reversibilidad antes de operaciones críticas.

## Operations Gate

Los cambios operativos requieren responsable, monitoreo, recuperación y validación posterior.
`,
  }
  return renderers[artifact] || null
}
