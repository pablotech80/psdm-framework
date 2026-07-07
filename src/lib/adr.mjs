import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeAdrDate(value) {
  const date = value || today()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('ADR date must use YYYY-MM-DD format.')
  }

  return date
}

export function slugifyAdrTitle(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'decision'
}

export function renderAdr({
  title,
  date = today(),
  status = 'Proposed',
}) {
  const normalizedDate = normalizeAdrDate(date)

  return `# ADR-${normalizedDate}-${slugifyAdrTitle(title)}

Status: \`${status}\`
Date: \`${normalizedDate}\`
Method: \`PTECH SPEC-DRIVEN METHOD\`
Artifact Type: \`Architecture Decision Record\`

## 1. Decision

Describe the decision in one or two precise sentences.

## 2. Context

Describe the forces, constraints, risks, and project state that make this decision necessary.

## 3. Options Considered

1. Describe the chosen option.
2. Describe the strongest alternative.
3. Describe the fallback or lowest-effort option.

## 4. Chosen Option

Name the option selected for this repository.

## 5. Rationale

Explain why this option best fits the current architecture, delivery risk, and maintenance model.

## 6. Consequences

### Positive

- Describe the main benefit.

### Negative

- Describe the main cost or limitation.

### Trade-offs

- Describe what this decision optimizes for and what it intentionally does not optimize for.

## 7. Validation

List the commands, reviews, or evidence used to validate the decision.

## 8. Related Artifacts

- \`docs/SPEC.md\`
- \`docs/ARCHITECTURE.md\`

## 9. Review Notes

Record owner review, approval notes, or follow-up conditions.
`
}

export function createAdr({
  target,
  title,
  date = today(),
  status = 'Proposed',
}) {
  const normalizedDate = normalizeAdrDate(date)
  const slug = slugifyAdrTitle(title)
  const relativePath = join('ADRs', `${normalizedDate}-${slug}.md`)
  const path = join(target, relativePath)

  if (existsSync(path)) {
    return {
      command: 'adr',
      status: 'exists',
      title,
      date: normalizedDate,
      adrStatus: status,
      relativePath,
      path,
    }
  }

  mkdirSync(join(target, 'ADRs'), { recursive: true })
  writeFileSync(path, renderAdr({ title, date: normalizedDate, status }))

  return {
    command: 'adr',
    status: 'created',
    title,
    date: normalizedDate,
    adrStatus: status,
    relativePath,
    path,
  }
}
