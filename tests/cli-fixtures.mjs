import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { generateKeyPairSync, sign } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { PassThrough } from 'node:stream'
import {
  canonicalReceiptPayload,
  publicKeyFingerprint,
} from '../src/lib/approval-receipt.mjs'
import { validateApprovalPolicy } from '../src/lib/config.mjs'
import {
  buildShellContext,
  renderShellBanner,
  renderShellPrompt,
} from '../src/lib/shell.mjs'
import {
  PTECH_CYAN,
  supportsTerminalColor,
} from '../src/lib/terminal-style.mjs'
import {
  filterShellMenuCommands,
  moveShellMenuSelection,
  renderShellMenu,
} from '../src/lib/shell-menu.mjs'
import { shellCommand } from '../src/commands/shell.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cli = resolve(repoRoot, 'bin/psdm.mjs')

function run(args, options = {}) {
  try {
    return execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    if (options.allowFailure && typeof error.stdout === 'string') {
      return error.stdout
    }

    throw error
  }
}

function runJson(args, options = {}) {
  return JSON.parse(run(args, options))
}

function runShell(args, input) {
  return execFileSync(process.execPath, [cli, 'shell', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

function existingProject() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-existing-'))
  mkdirSync(resolve(target, 'docs'))
  writeFileSync(resolve(target, 'package.json'), '{"name":"existing-app"}\n')
  writeFileSync(resolve(target, 'docs/README.md'), '# Existing docs\n')
  return target
}

function git(target, args) {
  return execFileSync('git', ['-C', target, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function testRiscalaExecutableAliasContract() {
  const packageJson = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'))
  const help = run(['help'])

  assert.equal(packageJson.bin.riscala, 'bin/psdm.mjs')
  assert.equal(packageJson.bin.psdm, packageJson.bin.riscala)
  assert.equal(packageJson.scripts.postinstall, undefined)
  assert.match(help, /^Riscala/m)
  assert.match(help, /AI Code Governance for Software Delivery/)
  assert.match(help, /Powered by PSDM/)
  assert.match(help, /psdm remains supported with identical commands and behavior/)
  assert.match(help, /riscala shell \[target\]/)
  assert.match(help, /riscala impact "<change intent>"/)
  assert.match(help, /riscala review "<change intent>" --staged/)
}

function testActiveWorkCreatesReadsAndPreservesBoundary() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-active-work-'))
  const created = runJson([
    'work', 'init', 'Ship the smallest beta.6 continuity flow',
    '--mode', 'design', '--target', target, '--json',
  ])
  const path = resolve(target, '.riscala', 'ACTIVE_WORK.md')
  const content = readFileSync(path, 'utf8')
  const shown = runJson(['work', 'show', '--target', target, '--json'])
  const duplicate = runJson([
    'work', 'init', 'Replace the objective', '--target', target, '--json',
  ], { allowFailure: true })

  assert.equal(created.created, true)
  assert.equal(created.mode, 'design')
  assert.match(content, /Ship the smallest beta\.6 continuity flow/)
  assert.match(content, /Mode: `design`/)
  assert.match(content, /Change another repository/)
  assert.equal(shown.exists, true)
  assert.equal(shown.content, content)
  assert.equal(duplicate.created, false)
  assert.equal(readFileSync(path, 'utf8'), content)
}

function testImpactLowRiskWithoutInitStaysLightweight() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-low-risk-'))
  writeFileSync(resolve(target, 'package.json'), '{"name":"docs-project"}\n')
  const before = readdirSync(target).sort()

  const report = runJson([
    'impact',
    'update README hero',
    '--target',
    target,
    '--guidance',
    'concise',
    '--json',
  ])
  const output = run([
    'impact',
    'update README hero',
    '--target',
    target,
    '--guidance',
    'concise',
  ])

  assert.equal(report.command, 'impact')
  assert.equal(report.projectContext.initializedWithPsdm, false)
  assert.equal(report.projectContext.mode, 'legacy')
  assert.equal(report.ownerDecision.value, null)
  assert.equal(report.ownerDecision.authority, 'developer_only')
  assert.deepEqual(report.judgment.ownerDecisionsRequired, [])
  assert.ok(report.judgment.affectedSurfaces.some((item) => item.surface === 'presentation'))
  assert.ok(report.observedEvidence.every((item) => item.confidence === 'deterministic'))
  assert.ok(report.judgment.affectedSurfaces.every((item) => item.epistemicStatus === 'inferred'))
  assert.doesNotMatch(output, /Observed facts/)
  assert.doesNotMatch(output, /Assumptions to challenge/)
  assert.match(output, /avoid adding governance artifacts/)
  assert.deepEqual(readdirSync(target).sort(), before)
}

function testImpactAuthTeachesDecisionWithoutTakingAuthority() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-auth-'))
  mkdirSync(resolve(target, 'src', 'auth'), { recursive: true })
  mkdirSync(resolve(target, 'tests'), { recursive: true })
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'auth-service',
    scripts: { test: 'node tests/auth.mjs' },
    dependencies: { express: '1.0.0' },
  }))
  writeFileSync(resolve(target, 'src', 'auth', 'session.mjs'), 'export const session = true\n')

  const report = runJson([
    'impact',
    'add Google OAuth login while preserving passwords',
    '--target',
    target,
    '--file',
    'src/auth/session.mjs',
    '--guidance',
    'learn',
    '--json',
  ])
  const output = run([
    'impact',
    'add Google OAuth login while preserving passwords',
    '--target',
    target,
    '--file',
    'src/auth/session.mjs',
    '--guidance',
    'learn',
  ])

  assert.equal(report.projectContext.initializedWithPsdm, false)
  assert.match(report.judgment.decision, /identity, trust, and access/)
  assert.ok(report.judgment.options.some((item) => item.id === 'preserve-and-link-explicitly'))
  assert.ok(report.judgment.ownerDecisionsRequired.some((item) => item.includes('link two identities')))
  assert.equal(report.ownerDecision.status, 'required')
  assert.equal(report.ownerDecision.value, null)
  assert.equal(report.legacyClassification.estimatedLevel, 'Level 3')
  assert.ok(report.observedEvidence.some((item) => (
    item.kind === 'validation-capability'
    && item.source === 'package.json:scripts'
  )))
  assert.match(output, /Reasoning to reuse/)
  assert.match(output, /identity and data-lifecycle decision/)
  assert.match(output, /cannot create, infer, approve, or simulate one/)
}

function testImpactUnknownGreenfieldExposesUncertaintyWithoutMutation() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-greenfield-'))
  const before = readdirSync(target).sort()
  const report = runJson([
    'impact',
    'improve the system',
    '--target',
    target,
    '--json',
  ])

  assert.equal(report.projectContext.mode, 'greenfield')
  assert.equal(report.projectContext.initializedWithPsdm, false)
  assert.equal(report.judgment.uncertainty.level, 'high')
  assert.match(report.judgment.decision, /smallest user outcome/)
  assert.deepEqual(report.judgment.options, [])
  assert.ok(report.judgment.ownerDecisionsRequired.some((item) => item.includes('Who experiences the problem')))
  assert.equal(report.ownerDecision.value, null)
  assert.deepEqual(readdirSync(target).sort(), before)
}

function testImpactDoesNotMatchAiInsideOrdinaryWords() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-signal-boundary-'))
  const report = runJson([
    'impact',
    'maintain README formatting',
    '--target',
    target,
    '--json',
  ])

  assert.ok(report.judgment.affectedSurfaces.some((item) => item.rule === 'local-presentation'))
  assert.ok(report.judgment.affectedSurfaces.every((item) => item.rule !== 'ai-behavior'))
}

function testImpactLegacyUsesTargetMetadataAndLeadContext() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-legacy-context-'))
  mkdirSync(resolve(target, 'src', 'app', 'api', 'lead'), { recursive: true })
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'lead-app',
    scripts: { test: 'node tests.mjs' },
    dependencies: { express: '1.0.0', zod: '1.0.0' },
  }))
  writeFileSync(
    resolve(target, 'src', 'app', 'api', 'lead', 'route.ts'),
    "import { NextResponse } from 'next/server'\nexport async function POST() { return NextResponse.json({ ok: true }) }\n",
  )
  const file = 'src/app/api/lead/route.ts'

  const report = runJson([
    'impact',
    'add AI recommendations to the lead form',
    '--target',
    target,
    '--file',
    file,
    '--json',
  ])
  const balanced = run([
    'impact',
    'add AI recommendations to the lead form',
    '--target',
    target,
    '--file',
    file,
  ])
  const concise = run([
    'impact',
    'add AI recommendations to the lead form',
    '--target',
    target,
    '--file',
    file,
    '--guidance',
    'concise',
  ])

  assert.ok(report.observedEvidence.some((item) => (
    item.kind === 'target-imports'
    && item.source === `${file}:imports`
    && item.summary.includes('next/server')
  )))
  assert.ok(report.observedEvidence.some((item) => (
    item.kind === 'http-handler'
    && item.summary.includes('POST')
  )))
  assert.ok(report.judgment.affectedSurfaces.some((item) => item.rule === 'lead-intake'))
  assert.ok(report.judgment.ownerDecisionsRequired.some((item) => item.includes('lead routing')))
  assert.doesNotMatch(balanced, /Declared dependency names/)
  assert.match(balanced, /exports HTTP handlers: POST/)
  assert.match(concise, /references modules: next\/server/)
  assert.match(concise, /exports HTTP handlers: POST/)
}

function testImpactRejectsUnsupportedGuidance() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-impact-guidance-'))
  assert.throws(() => run([
    'impact',
    'update copy',
    '--target',
    target,
    '--guidance',
    'architect',
  ]), /Command failed/)
}

function initializeReviewRepository() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-decision-review-'))
  mkdirSync(resolve(target, 'src', 'auth'), { recursive: true })
  writeFileSync(resolve(target, 'README.md'), '# Before\n')
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'review-app',
    dependencies: { express: '1.0.0' },
  }))
  writeFileSync(resolve(target, 'src', 'auth', 'login.mjs'), 'export const login = false\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', '.'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'baseline',
  ])
  return target
}

function testDecisionReviewAlignedScopeRemainsAdvisory() {
  const target = initializeReviewRepository()
  writeFileSync(resolve(target, 'README.md'), '# After\n')
  git(target, ['add', 'README.md'])

  const report = runJson([
    'review',
    'update README copy',
    '--staged',
    '--target',
    target,
    '--file',
    'README.md',
    '--json',
  ])

  assert.equal(report.decision, 'STAGED_DECISION_REVIEW_READY')
  assert.equal(report.advisory, true)
  assert.equal(report.envelope.authority.source, 'cli_input')
  assert.equal(report.envelope.authority.authorityVerified, false)
  assert.equal(report.envelope.ownerDecision.value, null)
  assert.deepEqual(report.verification.outsideExpectedScope, [])
  assert.deepEqual(report.verification.deviations, [])
  assert.equal(report.verification.readiness, 'scope_aligned_evidence_unverified')
  assert.equal(report.verification.authority.approval, false)
}

function testDecisionReviewDetectsScopeAndDeliveryDrift() {
  const target = initializeReviewRepository()
  mkdirSync(resolve(target, '.github', 'workflows'), { recursive: true })
  writeFileSync(resolve(target, 'src', 'auth', 'login.mjs'), 'export const login = true\n')
  writeFileSync(resolve(target, '.github', 'workflows', 'deploy.yml'), 'name: deploy\n')
  git(target, ['add', 'src/auth/login.mjs', '.github/workflows/deploy.yml'])

  const report = runJson([
    'review',
    'add OAuth login',
    '--staged',
    '--target',
    target,
    '--file',
    'src/auth/login.mjs',
    '--json',
  ])
  const output = run([
    'review',
    'add OAuth login',
    '--staged',
    '--target',
    target,
    '--file',
    'src/auth/login.mjs',
  ])

  assert.deepEqual(report.verification.outsideExpectedScope, ['.github/workflows/deploy.yml'])
  assert.ok(report.verification.deviations.some((item) => item.kind === 'scope-drift'))
  assert.ok(report.verification.deviations.some((item) => (
    item.kind === 'unexpected-surface'
    && item.surface === 'delivery'
    && item.severity === 'high'
  )))
  assert.equal(report.verification.readiness, 'developer_review_required')
  assert.match(output, /Authority: advisory · owner decision not verified/)
  assert.match(output, /developer_review_required/)
  assert.match(output, /does not approve, commit, or establish human authority/)
}

function testDecisionReviewReportsDependencyDeltaWithoutReadingSource() {
  const target = initializeReviewRepository()
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'review-app',
    dependencies: { express: '1.0.0', axios: '1.0.0' },
  }))
  git(target, ['add', 'package.json'])

  const report = runJson([
    'review',
    'add HTTP client dependency',
    '--staged',
    '--target',
    target,
    '--file',
    'package.json',
    '--json',
  ])

  assert.equal(report.verification.dependencyDelta.status, 'compared')
  assert.deepEqual(report.verification.dependencyDelta.added, ['axios'])
  assert.deepEqual(report.verification.dependencyDelta.removed, [])
  assert.ok(report.verification.deviations.some((item) => item.kind === 'dependency-change'))
  assert.ok(report.brief.judgment.learningPrinciples.some((item) => item.includes('long-term ownership decision')))
  assert.equal(report.envelope.authority.authorityVerified, false)
}

function testDecisionReviewReportsMissingExpectedScope() {
  const target = initializeReviewRepository()
  writeFileSync(resolve(target, 'README.md'), '# After\n')
  git(target, ['add', 'README.md'])

  const report = runJson([
    'review',
    'update README and docs copy',
    '--staged',
    '--target',
    target,
    '--files',
    'README.md,docs/guide.md',
    '--json',
  ])

  assert.deepEqual(report.verification.expectedButNotStaged, ['docs/guide.md'])
  assert.ok(report.verification.deviations.some((item) => (
    item.kind === 'expected-not-staged'
    && item.file === 'docs/guide.md'
  )))
  assert.equal(report.verification.readiness, 'developer_review_required')
}

function testDecisionReviewNoStagedChangesIsReadOnlyNoOp() {
  const target = initializeReviewRepository()
  const report = runJson([
    'review',
    'update README copy',
    '--staged',
    '--target',
    target,
    '--file',
    'README.md',
    '--json',
  ])

  assert.equal(report.decision, 'NO_STAGED_CHANGES')
  assert.equal(report.verification, null)
  assert.equal(report.envelope.authority.authorityVerified, false)
}

function testDecisionReviewGuidanceChangesDensityNotAuthority() {
  const target = initializeReviewRepository()
  writeFileSync(resolve(target, 'README.md'), '# After\n')
  git(target, ['add', 'README.md'])

  const concise = run([
    'review',
    'update README copy',
    '--staged',
    '--target',
    target,
    '--file',
    'README.md',
    '--guidance',
    'concise',
  ])
  const learn = run([
    'review',
    'update README copy',
    '--staged',
    '--target',
    target,
    '--file',
    'README.md',
    '--guidance',
    'learn',
  ])

  assert.doesNotMatch(concise, /Expected files/)
  assert.doesNotMatch(concise, /Staged files/)
  assert.match(learn, /Reasoning to reuse/)
  assert.match(concise, /does not approve, commit, or establish human authority/)
  assert.match(learn, /does not approve, commit, or establish human authority/)
}

function testReadOnlyShellRoutesCommandsAndReportsContext() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-shell-'))
  mkdirSync(resolve(target, 'src'), { recursive: true })
  writeFileSync(resolve(target, 'package.json'), '{"name":"shell-fixture"}\n')
  writeFileSync(resolve(target, 'psdm.config.json'), '{"version":1,"profile":"framework","approval":{"requiredLevels":[],"requiredActions":[]}}\n')
  writeFileSync(resolve(target, 'src', 'tracked.mjs'), 'export const value = 1\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', '.'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'baseline',
  ])

  writeFileSync(resolve(target, 'src', 'tracked.mjs'), 'export const value = 2\n')
  git(target, ['add', 'src/tracked.mjs'])
  writeFileSync(resolve(target, 'package.json'), '{"name":"shell-fixture","private":true}\n')
  writeFileSync(resolve(target, 'notes.txt'), 'untracked\n')

  const output = runShell([target], '/help\n/impact update user flow\n/review update user flow\n/review AGENTS.md\n/status\n/audit\n/check\n/validate\n/report\n/inspect\n/classify update user flow\n/pr-checklist update user flow\n/init-preview\n/hook-status\n/action\n/approval\n/commit\n/exit\n')

  assert.match(output, /RISCALA/)
  assert.match(output, /READ ONLY · judgment workspace/)
  assert.match(output, /Project\s+shell-fixture/)
  assert.match(output, /Changes\s+1 staged · 1 unstaged · 1 untracked/)
  assert.match(output, /Files\s+M\s+src\/tracked\.mjs/)
  assert.match(output, /M\s+package\.json/)
  assert.match(output, /\?\?\s+notes\.txt/)
  assert.match(output, /Refreshed\s+\d{2}:\d{2}:\d{2} UTC/)
  assert.match(output, /Policy\s+framework · psdm\.config\.json/)
  assert.match(output, /╭─ COMMANDS /)
  assert.match(output, /╭─ IMPACT /)
  assert.match(output, /╭─ REVIEW /)
  assert.match(output, /╭─ STATUS /)
  assert.match(output, /╭─ AUDIT /)
  assert.match(output, /╭─ CHECK /)
  assert.match(output, /╭─ VALIDATE /)
  assert.match(output, /╭─ REPORT /)
  assert.match(output, /╭─ INSPECT /)
  assert.match(output, /╭─ CLASSIFY /)
  assert.match(output, /╭─ PR CHECKLIST /)
  assert.match(output, /╭─ INIT PREVIEW /)
  assert.match(output, /╭─ HOOK STATUS /)
  assert.match(output, /╭─ ACTION /)
  assert.match(output, /╭─ APPROVAL /)
  assert.match(output, /\/status\s+Refresh repository/)
  assert.match(output, /\/impact\s+Think through a change/)
  assert.match(output, /\/review\s+Compare intent with staged evidence/)
  assert.match(output, /\/audit\s+Assess governance adoption/)
  assert.match(output, /\/check\s+Check required artifacts/)
  assert.match(output, /\/validate\s+Validate the governance baseline/)
  assert.match(output, /\/classify\s+Classify a described change/)
  assert.match(output, /\/pr-checklist\s+Build a PR checklist/)
  assert.match(output, /Artifacts\s+\d+ present · \d+ missing · \d+ empty/)
  assert.match(output, /Adoption\s+Initialize governance baseline/)
  assert.match(output, /AI\s+0 surfaces · Not detected/)
  assert.match(output, /Git\s+1 staged · 1 unstaged · 1 untracked/)
  assert.match(output, /Next\s+Run riscala init/)
  assert.doesNotMatch(output, /Run psdm (?:init|validate)/)
  assert.match(output, /Status\s+incomplete/)
  assert.match(output, /Decision\s+Needs correction/)
  assert.match(output, /Checks\s+\d+ passed · \d+ failed · \d+ warning/)
  assert.match(output, /(?:Failure|Warning)\s+[^\n]+:/)
  assert.match(output, /Findings\s+\d+ failure\(s\) · \d+ warning\(s\)/)
  assert.match(output, /Next\s+Fix the failing governance checks/)
  assert.match(output, /Staged inspection · 1 file\(s\) · Level 2/)
  assert.match(output, /src\/tracked\.mjs matches src\/\*\* -> Level 2/)
  assert.match(output, /Next\s+Review this evidence before choosing the next/)
  assert.match(output, /Govern\s+Product-specific SPEC/)
  assert.match(output, /Checks\s+\d+ checklist item\(s\)/)
  assert.match(output, /Create\s+\d+ artifact\(s\)/)
  assert.match(output, /State\s+not installed/)
  assert.match(output, /Action\s+git\.commit/)
  assert.match(output, /Content\s+sha256:/)
  assert.match(output, /Review this content-bound action record before/)
  assert.match(output, /Mode\s+signed approval disabled/)
  assert.match(output, /Boundary\s+The shell remains read only/)
  assert.match(output, /AGENTS\.md looks like a file path/)
  assert.match(output, /riscala review "describe the change" --staged --file/)
  assert.match(output, /Blocked: \/commit is not available in the read-only shell/)
  assert.match(output, /Riscala advises\. You decide direction/)
  assert.match(output, /Riscala shell closed/)
  assert.doesNotMatch(output, /\u001b\[/)
  assert.equal(output.split('\n').filter((line) => line.startsWith('│')).every((line) => (
    line.length === 70 && line.at(-2) === ' '
  )), true)
  assert.equal(existsSync(resolve(target, 'AGENTS.md')), false)
  assert.equal(existsSync(resolve(target, 'ROADMAP.md')), false)
  assert.equal(git(target, ['rev-list', '--count', 'HEAD']).trim(), '1')
}

function testShellUsesPtechCyanOnlyForInteractiveTerminals() {
  const context = buildShellContext({ target: repoRoot })
  const plainBanner = renderShellBanner(context)
  const coloredBanner = renderShellBanner(context, { color: true })
  const coloredPrompt = renderShellPrompt({ color: true })
  const stripAnsi = (value) => value.replace(/\u001b\[[0-9;]*m/g, '')

  assert.deepEqual(PTECH_CYAN, { red: 0, green: 168, blue: 232 })
  assert.match(coloredBanner, /\u001b\[38;2;0;168;232m/)
  assert.equal(stripAnsi(coloredBanner), plainBanner)
  assert.equal(stripAnsi(coloredPrompt), 'riscala ❯ ')
  assert.equal(supportsTerminalColor({ isTTY: true }, { TERM: 'xterm-256color' }), true)
  assert.equal(supportsTerminalColor({ isTTY: false }, { TERM: 'xterm-256color' }), false)
  assert.equal(supportsTerminalColor({ isTTY: true }, { TERM: 'dumb' }), false)
  assert.equal(supportsTerminalColor({ isTTY: true }, { TERM: 'xterm', NO_COLOR: '' }), false)
}

function testShellMenuFiltersNavigatesAndPreservesLayout() {
  const allCommands = filterShellMenuCommands('/')
  const statusCommand = filterShellMenuCommands('/st')
  const plainMenu = renderShellMenu('/', 1)
  const coloredMenu = renderShellMenu('/', 1, { color: true })
  const stripAnsi = (value) => value.replace(/\u001b\[[0-9;]*m/g, '')

  assert.deepEqual(allCommands.map((item) => item.name), [
    '/help',
    '/impact',
    '/review',
    '/status',
    '/audit',
    '/check',
    '/validate',
    '/inspect',
    '/report',
    '/classify',
    '/pr-checklist',
    '/init-preview',
    '/hook-status',
    '/action',
    '/approval',
    '/exit',
  ])
  assert.deepEqual(statusCommand.map((item) => item.name), ['/status'])
  assert.deepEqual(filterShellMenuCommands('status'), [])
  assert.equal(moveShellMenuSelection(0, 'previous', 16), 15)
  assert.equal(moveShellMenuSelection(15, 'next', 16), 0)
  assert.match(plainMenu, /Commands/)
  assert.match(plainMenu, /❯ \/impact/)
  assert.equal(plainMenu.split('\n').every((line) => line.length === 70), true)
  assert.equal(stripAnsi(coloredMenu), plainMenu)
}

async function testInteractiveShellOpensSlashMenuAndNavigates() {
  const input = new PassThrough()
  const output = new PassThrough()
  let captured = ''
  input.isTTY = true
  input.isRaw = false
  input.setRawMode = (value) => {
    input.isRaw = value
  }
  output.isTTY = true
  output.on('data', (chunk) => {
    captured += chunk.toString()
  })

  const session = shellCommand([repoRoot], {
    input,
    output,
    env: { TERM: 'xterm-256color' },
  })
  input.write('/')
  input.write('\u001b[B')
  input.write('\u001b[B')
  input.write('\u001b[B')
  input.write('\r')
  input.write('/e')
  input.write('\r')
  await session

  const visible = captured.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '')
  assert.match(visible, /Commands/)
  assert.match(visible, /❯ \/status/)
  assert.match(visible, /Project\s+@ptechsolution\/psdm-framework/)
  assert.match(visible, /Riscala shell closed/)
  assert.equal(input.isRaw, false)
}

function approvalFixture() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-approval-'))
  const keyDirectory = resolve(target, 'governance', 'keys')
  mkdirSync(keyDirectory, { recursive: true })
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' })
  const fingerprint = publicKeyFingerprint(publicKeyPem)
  writeFileSync(resolve(keyDirectory, 'owner-public.pem'), publicKeyPem)
  writeFileSync(resolve(target, 'psdm.config.json'), `${JSON.stringify({
    version: 1,
    profile: 'standard',
    approval: {
      requiredLevels: ['Level 3', 'Level 4'],
      requiredActions: ['git.commit'],
      maxReceiptAgeSeconds: 600,
      trustedApprovers: [
        {
          id: 'owner',
          publicKeyPath: 'governance/keys/owner-public.pem',
          publicKeyFingerprint: fingerprint,
          approvalModes: ['hardware-signature'],
        },
      ],
    },
  }, null, 2)}\n`)
  writeFileSync(resolve(target, 'README.md'), '# Approval fixture\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', '.'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'baseline',
  ])
  writeFileSync(resolve(target, 'AGENTS.md'), '# Governed agent policy\n')
  git(target, ['add', 'AGENTS.md'])

  return { target, privateKey, fingerprint }
}

function signedReceipt(record, privateKey, fingerprint, overrides = {}) {
  const issuedAt = new Date(Date.now() - 1000)
  const receipt = {
    version: 1,
    approvalId: 'approval_test_owner_presence',
    actionId: record.actionId,
    action: record.binding.action,
    repository: record.binding.repository,
    branch: record.binding.branch,
    contentHash: record.binding.contentHash,
    approver: 'owner',
    approverKeyFingerprint: fingerprint,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + 5 * 60 * 1000).toISOString(),
    approvalMode: 'hardware-signature',
    ...overrides,
  }
  receipt.signature = sign(
    null,
    Buffer.from(canonicalReceiptPayload(receipt)),
    privateKey,
  ).toString('base64')
  return receipt
}

function testActionRecordAndApprovalReceiptVerification() {
  const { target, privateKey, fingerprint } = approvalFixture()
  const record = runJson(['action', 'prepare', 'git.commit', '--target', target, '--json'])

  assert.equal(record.decision, 'ACTION_RECORD_READY')
  assert.equal(record.ready, true)
  assert.equal(record.action, 'git.commit')
  assert.equal(record.classification.estimatedLevel, 'Level 3')
  assert.equal(record.approval.required, true)
  assert.match(record.binding.contentHash, /^sha256:[a-f0-9]{64}$/)
  assert.equal(record.approval.policy.trustedApprovers[0].id, 'owner')
  assert.equal(record.approval.policy.trustedApprovers[0].publicKeyPath, undefined)

  const receiptPath = resolve(target, 'approval-receipt.json')
  writeFileSync(receiptPath, `${JSON.stringify(signedReceipt(
    record,
    privateKey,
    fingerprint,
  ), null, 2)}\n`)
  const valid = runJson([
    'approval',
    'verify',
    'git.commit',
    '--target',
    target,
    '--receipt',
    receiptPath,
    '--json',
  ])

  assert.equal(valid.decision, 'APPROVAL_RECEIPT_VALID')
  assert.equal(valid.valid, true)
  assert.deepEqual(valid.violations, [])

  const phraseReceipt = signedReceipt(record, privateKey, fingerprint, {
    approvalId: 'approval_test_phrase',
    approvalMode: 'phrase',
  })
  writeFileSync(receiptPath, `${JSON.stringify(phraseReceipt, null, 2)}\n`)
  const phraseRejected = runJson([
    'approval',
    'verify',
    'git.commit',
    '--target',
    target,
    '--receipt',
    receiptPath,
    '--json',
  ], { allowFailure: true })

  assert.equal(phraseRejected.valid, false)
  assert.ok(phraseRejected.violations.some((item) => item.includes('approvalMode must be')))

  writeFileSync(resolve(target, 'AGENTS.md'), '# Modified after approval\n')
  git(target, ['add', 'AGENTS.md'])
  writeFileSync(receiptPath, `${JSON.stringify(signedReceipt(
    record,
    privateKey,
    fingerprint,
  ), null, 2)}\n`)
  const changedContent = runJson([
    'approval',
    'verify',
    'git.commit',
    '--target',
    target,
    '--receipt',
    receiptPath,
    '--json',
  ], { allowFailure: true })

  assert.equal(changedContent.valid, false)
  assert.ok(changedContent.violations.some((item) => item.includes('contentHash')))
}

function testApprovalEnforcementConsumesReceiptOnce() {
  const { target, privateKey, fingerprint } = approvalFixture()
  const record = runJson(['action', 'prepare', 'git.commit', '--target', target, '--json'])
  const stateDirectory = resolve(target, '.git', 'riscala')
  const receiptPath = resolve(stateDirectory, 'approval-receipt.json')
  mkdirSync(stateDirectory, { recursive: true })
  writeFileSync(receiptPath, `${JSON.stringify(signedReceipt(
    record,
    privateKey,
    fingerprint,
  ), null, 2)}\n`)

  const first = runJson([
    'approval',
    'enforce',
    'git.commit',
    '--target',
    target,
    '--json',
  ])
  const replay = runJson([
    'approval',
    'enforce',
    'git.commit',
    '--target',
    target,
    '--json',
  ], { allowFailure: true })
  const ledger = JSON.parse(readFileSync(
    resolve(stateDirectory, 'consumed-approvals.json'),
    'utf8',
  ))

  assert.equal(first.decision, 'COMMIT_APPROVAL_CONSUMED')
  assert.equal(first.allowed, true)
  assert.equal(first.consumption.consumed, true)
  assert.equal(replay.decision, 'COMMIT_APPROVAL_DENIED')
  assert.equal(replay.allowed, false)
  assert.ok(replay.violations.some((item) => item.includes('already been consumed')))
  assert.equal(ledger.consumptions.length, 1)
  assert.equal(ledger.consumptions[0].approvalId, 'approval_test_owner_presence')
  assert.equal(JSON.stringify(ledger).includes('signature'), false)
}

function testManagedPreCommitHookAllowsLowRiskAndBlocksHighRisk() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-hook-'))
  writeFileSync(resolve(target, 'README.md'), '# Hook fixture\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'README.md'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'baseline',
  ])

  const installed = runJson(['hook', 'install', 'pre-commit', '--target', target, '--json'])
  const status = runJson(['hook', 'status', 'pre-commit', '--target', target, '--json'])

  assert.equal(installed.decision, 'HOOK_INSTALLED')
  assert.equal(installed.managed, true)
  assert.equal(status.installed, true)
  assert.equal(status.managed, true)

  writeFileSync(resolve(target, 'README.md'), '# Hook fixture updated\n')
  git(target, ['add', 'README.md'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'low-risk allowed',
  ])

  writeFileSync(resolve(target, 'AGENTS.md'), '# High-risk agent policy\n')
  git(target, ['add', 'AGENTS.md'])
  assert.throws(() => git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'high-risk blocked',
  ]))

  const removed = runJson(['hook', 'remove', 'pre-commit', '--target', target, '--json'])
  assert.equal(removed.decision, 'HOOK_REMOVED')
  assert.equal(existsSync(resolve(target, '.git', 'hooks', 'pre-commit')), false)
}

function testHookInstallerPreservesUnmanagedHook() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-hook-conflict-'))
  git(target, ['init', '--quiet'])
  writeFileSync(resolve(target, '.git', 'hooks', 'pre-commit'), '#!/bin/sh\nexit 0\n')

  const report = runJson([
    'hook',
    'install',
    'pre-commit',
    '--target',
    target,
    '--json',
  ], { allowFailure: true })

  assert.equal(report.decision, 'EXISTING_HOOK_CONFLICT')
  assert.equal(report.changed, false)
  assert.equal(readFileSync(report.path, 'utf8'), '#!/bin/sh\nexit 0\n')
}

function testHookInstallerRespectsConfiguredHooksPath() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-hook-path-'))
  git(target, ['init', '--quiet'])
  git(target, ['config', 'core.hooksPath', 'governance-hooks'])

  const report = runJson([
    'hook',
    'install',
    'pre-commit',
    '--target',
    target,
    '--json',
  ])

  assert.equal(report.decision, 'HOOK_INSTALLED')
  assert.equal(report.path.endsWith('/governance-hooks/pre-commit'), true)
  assert.equal(existsSync(report.path), true)
}

function testActionRecordFailsClosedWithoutTrustedApprover() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-approval-incomplete-'))
  git(target, ['init', '--quiet'])
  writeFileSync(resolve(target, 'AGENTS.md'), '# High-risk policy change\n')
  git(target, ['add', 'AGENTS.md'])

  const record = runJson([
    'action',
    'prepare',
    'git.commit',
    '--target',
    target,
    '--json',
  ], { allowFailure: true })

  assert.equal(record.decision, 'APPROVAL_POLICY_INCOMPLETE')
  assert.equal(record.ready, false)
  assert.equal(record.approval.required, true)
  assert.deepEqual(record.approval.policy.trustedApprovers, [])
}

function testInvalidApprovalPolicyFailsClosed() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-approval-invalid-'))
  writeFileSync(resolve(target, 'psdm.config.json'), `${JSON.stringify({
    version: 1,
    approval: {
      requiredLevels: ['Level 5'],
      maxReceiptAgeSeconds: 10,
      trustedApprovers: [{}],
    },
  })}\n`)
  writeFileSync(resolve(target, 'AGENTS.md'), '# High-risk policy change\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'AGENTS.md'])

  const validation = runJson(['validate', target, '--json'], { allowFailure: true })
  const record = runJson([
    'action',
    'prepare',
    'git.commit',
    '--target',
    target,
    '--json',
  ], { allowFailure: true })

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.message === 'approval.requiredLevels must contain only Level 0 through Level 4.'
  )))
  assert.ok(validation.results.some((item) => item.message.includes('maxReceiptAgeSeconds')))
  assert.ok(validation.results.some((item) => item.message.includes('publicKeyFingerprint')))
  assert.equal(record.decision, 'APPROVAL_POLICY_INVALID')
  assert.equal(record.ready, false)
  assert.ok(record.approval.policyIssues.length > 0)
}

function testApprovalPolicyMayDisableSignedLevelRequirements() {
  const target = mkdtempSync(resolve(tmpdir(), 'riscala-approval-disabled-'))
  writeFileSync(resolve(target, 'psdm.config.json'), `${JSON.stringify({
    version: 1,
    approval: {
      requiredLevels: [],
      requiredActions: [],
      trustedApprovers: [],
    },
  })}\n`)
  writeFileSync(resolve(target, 'AGENTS.md'), '# High-risk policy change\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'AGENTS.md'])

  const record = runJson(['action', 'prepare', 'git.commit', '--target', target, '--json'])

  assert.deepEqual(validateApprovalPolicy({
    requiredLevels: [],
    requiredActions: [],
    trustedApprovers: [],
  }), [])
  assert.equal(record.approval.required, false)
  assert.equal(record.decision, 'ACTION_RECORD_READY')
}

function testAuditExistingProject() {
  const target = existingProject()
  const report = runJson(['audit', target, '--json'])

  assert.equal(report.command, 'audit')
  assert.equal(report.config.exists, false)
  assert.equal(report.projectSignals.packageManager, true)
  assert.equal(report.projectSignals.existingDocs, true)
  assert.equal(report.aiReadiness.version, 1)
  assert.equal(report.aiReadiness.status, 'not_detected')
  assert.equal(report.aiReadiness.detectedSurfaceCount, 0)
  assert.deepEqual(report.aiReadiness.gaps, [])
  assert.equal(report.summary.wouldCreate, 12)
  assert.equal(report.summary.wouldSkip, 0)
  assert.ok(report.pros.some((item) => item.includes('without overwriting')))
  assert.ok(report.cons.some((item) => item.includes('must keep current')))
  assert.ok(report.recommendations.some((item) => item.includes('psdm init')))
}

function testAuditDetectsExistingAiGovernance() {
  const target = existingProject()
  mkdirSync(resolve(target, '.github'), { recursive: true })
  mkdirSync(resolve(target, '.cursor', 'rules'), { recursive: true })
  mkdirSync(resolve(target, 'skills', 'deploy'), { recursive: true })
  writeFileSync(resolve(target, 'AGENTS.md'), '# Existing agent rules\n')
  writeFileSync(resolve(target, '.github', 'copilot-instructions.md'), '# Copilot rules\n')
  writeFileSync(resolve(target, 'skills', 'deploy', 'SKILL.md'), '# Deploy skill\n')

  const report = runJson(['audit', target, '--json'])
  const output = run(['audit', target])

  assert.equal(report.projectSignals.existingAiGovernance, true)
  assert.equal(report.aiGovernance.adoptionMode, 'integrate')
  assert.ok(report.aiGovernance.existing.includes('AGENTS.md'))
  assert.ok(report.aiGovernance.existing.includes('.github/copilot-instructions.md'))
  assert.ok(report.aiGovernance.existing.includes('.cursor/rules'))
  assert.ok(report.aiGovernance.existing.includes('skills'))
  assert.deepEqual(report.aiGovernance.wouldCreate, ['docs/PSDM_ADOPTION.md'])
  assert.equal(report.aiReadiness.status, 'gaps_detected')
  assert.ok(report.aiReadiness.detectedSurfaceCount >= 2)
  assert.ok(report.aiReadiness.surfaces.some((item) => (
    item.kind === 'agent-instructions'
    && item.detected.includes('AGENTS.md')
  )))
  assert.ok(report.aiReadiness.governanceArtifacts.some((item) => (
    item.key === 'cost-latency'
    && item.status === 'missing'
  )))
  assert.ok(report.aiReadiness.gaps.some((item) => item.key === 'cost-latency'))
  assert.ok(report.cons.some((item) => item.includes('Existing AI instructions may conflict')))
  assert.ok(report.recommendations.some((item) => item.includes('Do not overwrite existing agent')))
  assert.match(output, /AI governance adoption: integrate/)
  assert.match(output, /AI readiness: gaps_detected/)
  assert.match(output, /AI readiness gaps/)
  assert.match(output, /Existing AI governance/)
}

function testAuditDetectsAiRuntimeSurfaces() {
  const target = existingProject()
  mkdirSync(resolve(target, 'rag'), { recursive: true })
  mkdirSync(resolve(target, 'prompts'), { recursive: true })
  mkdirSync(resolve(target, 'n8n'), { recursive: true })
  writeFileSync(resolve(target, 'package.json'), JSON.stringify({
    name: 'ai-runtime-app',
    dependencies: {
      openai: '^4.0.0',
      langchain: '^0.3.0',
      chromadb: '^1.0.0',
    },
  }))
  writeFileSync(resolve(target, 'requirements.txt'), 'tiktoken==0.7.0\n')

  const report = runJson(['audit', target, '--json'])
  const surface = (kind) => report.aiReadiness.surfaces.find((item) => item.kind === kind)

  assert.equal(report.aiReadiness.status, 'gaps_detected')
  assert.ok(surface('agent-skills-and-prompts').detected.includes('prompts'))
  assert.ok(surface('rag-code').detected.includes('rag'))
  assert.ok(surface('rag-code').detected.includes('package.json:langchain'))
  assert.ok(surface('embeddings').detected.includes('requirements.txt:tiktoken'))
  assert.ok(surface('provider-sdks').detected.includes('package.json:openai'))
  assert.ok(surface('vector-stores').detected.includes('package.json:chromadb'))
  assert.ok(surface('automation-folders').detected.includes('n8n'))
  assert.ok(report.aiReadiness.gaps.some((item) => item.key === 'guardrails'))
}

function testInitCreatesAdoptionPlanForExistingAiGovernance() {
  const target = existingProject()
  mkdirSync(resolve(target, '.github'), { recursive: true })
  writeFileSync(resolve(target, 'AGENTS.md'), '# Existing agent rules\n')
  writeFileSync(resolve(target, '.github', 'copilot-instructions.md'), '# Copilot rules\n')

  const output = run(['init', target])

  assert.match(output, /CREATED docs\/PSDM_ADOPTION\.md/)
  assert.equal(existsSync(resolve(target, 'docs', 'PSDM_ADOPTION.md')), true)
  assert.match(readFileSync(resolve(target, 'docs', 'PSDM_ADOPTION.md'), 'utf8'), /Existing AI Governance/)
}

function testInitIsIdempotentForPsdmManagedGovernance() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-idempotent-'))

  run(['init', target])
  const output = run(['init', target])
  const report = runJson(['audit', target, '--json'])

  assert.doesNotMatch(output, /CREATED docs\/PSDM_ADOPTION\.md/)
  assert.equal(existsSync(resolve(target, 'docs', 'PSDM_ADOPTION.md')), false)
  assert.equal(report.aiGovernance.adoptionMode, 'initialize')
  assert.deepEqual(report.aiGovernance.existing, [])
}

function testInitDryRunDoesNotWrite() {
  const target = existingProject()
  const output = run(['init', target, '--dry-run'])

  assert.match(output, /Before/)
  assert.match(output, /After riscala init/)
  assert.match(output, /AGENTS\.md: create/)
  assert.equal(existsSync(resolve(target, 'AGENTS.md')), false)
}

function testAdrCreatesDecisionRecord() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-adr-'))
  const report = runJson([
    'adr',
    'Adopt CI change level enforcement',
    '--target',
    target,
    '--date',
    '2026-07-08',
    '--json',
  ])
  const second = runJson([
    'adr',
    'Adopt CI change level enforcement',
    '--target',
    target,
    '--date',
    '2026-07-08',
    '--json',
  ])

  assert.equal(report.command, 'adr')
  assert.equal(report.status, 'created')
  assert.equal(report.relativePath, 'ADRs/2026-07-08-adopt-ci-change-level-enforcement.md')
  assert.equal(second.status, 'exists')
  assert.equal(existsSync(resolve(target, report.relativePath)), true)
  const content = readFileSync(resolve(target, report.relativePath), 'utf8')
  assert.match(content, /# ADR-2026-07-08-adopt-ci-change-level-enforcement/)
  assert.match(content, /Status: `Proposed`/)
  assert.match(content, /## 1\. Decision/)
}

function testAdrRejectsInvalidDate() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-adr-invalid-date-'))
  const output = run([
    'adr',
    'Invalid date path',
    '--target',
    target,
    '--date',
    '../bad',
    '--json',
  ], {
    allowFailure: true,
  })

  assert.equal(output, '')
  assert.equal(existsSync(resolve(target, 'ADRs')), false)
}

function testClassifyRiskPathJson() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-classify-'))
  const report = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--file',
    'backend/auth/session.py',
    '--json',
  ])

  assert.equal(report.command, 'classify')
  assert.equal(report.estimatedLevel, 'Level 3')
  assert.equal(report.classificationReason, 'Configured risk path raised the estimated level.')
  assert.equal(report.pathMatches[0].pattern, 'backend/auth/**')
}

function testClassifyAgentInstructionsAsLevelThree() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-agent-policy-classify-'))
  const report = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--file',
    'AGENTS.md',
    '--json',
  ])

  assert.equal(report.estimatedLevel, 'Level 3')
  assert.equal(report.pathMatches[0].pattern, 'AGENTS.md')
  assert.ok(report.requiredArtifacts.includes('docs/SECURITY.md'))
  assert.ok(report.requiredArtifacts.includes('docs/ARCHITECTURE.md'))
}

function testClassifyApprovalEnforcementAsLevelThree() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-approval-policy-classify-'))
  const report = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--file',
    'src/lib/approval-enforcement.mjs',
    '--json',
  ])

  assert.equal(report.estimatedLevel, 'Level 3')
  assert.equal(report.pathMatches[0].pattern, 'src/lib/*approval*.mjs')
  assert.ok(report.requiredArtifacts.includes('docs/SECURITY.md'))
  assert.ok(report.requiredArtifacts.includes('docs/ARCHITECTURE.md'))
}

function testInspectStagedRiskPathJson() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-inspect-'))
  mkdirSync(resolve(target, 'backend', 'auth'), { recursive: true })
  writeFileSync(resolve(target, 'backend', 'auth', 'session.py'), 'def validate_session():\n    return True\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'backend/auth/session.py'])

  const report = runJson([
    'inspect',
    '--staged',
    '--target',
    target,
    '--json',
  ])
  const output = run([
    'inspect',
    '--staged',
    '--target',
    target,
  ])

  assert.equal(report.command, 'inspect')
  assert.equal(report.source, 'staged')
  assert.equal(report.decision, 'CHANGE_REVIEW_REQUIRED')
  assert.deepEqual(report.files, ['backend/auth/session.py'])
  assert.equal(report.git.changes[0].type, 'added')
  assert.equal(report.classification.estimatedLevel, 'Level 3')
  assert.equal(report.classification.pathMatches[0].pattern, 'backend/auth/**')
  assert.ok(report.evidence.some((item) => item.kind === 'staged-file'))
  assert.ok(report.evidence.some((item) => item.kind === 'risk-path' && item.level === 'Level 3'))
  assert.match(output, /Riscala Staged Change Inspection/)
  assert.match(output, /backend\/auth\/session\.py matches backend\/auth\/\*\*/)
}

function testInspectStagedUsesLevelOneFloor() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-inspect-floor-'))
  writeFileSync(resolve(target, 'notes.txt'), 'local change\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'notes.txt'])

  const report = runJson(['inspect', '--staged', '--target', target, '--json'])

  assert.equal(report.classification.estimatedLevel, 'Level 1')
  assert.equal(
    report.classification.classificationReason,
    'Staged file changes require at least Level 1 governance.',
  )
}

function testInspectReportsNoStagedChanges() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-inspect-empty-'))
  git(target, ['init', '--quiet'])

  const report = runJson(['inspect', '--staged', '--target', target, '--json'])

  assert.equal(report.decision, 'NO_STAGED_CHANGES')
  assert.deepEqual(report.files, [])
  assert.equal(report.classification, null)
}

function testInspectRejectsNonGitTarget() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-inspect-non-git-'))

  const report = runJson(['inspect', '--staged', '--target', target, '--json'], {
    allowFailure: true,
  })

  assert.equal(report.decision, 'NOT_A_GIT_REPOSITORY')
  assert.equal(report.git.isRepository, false)
  assert.equal(report.classification, null)
}

function testInspectParsesStagedRename() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-inspect-rename-'))
  mkdirSync(resolve(target, 'src'), { recursive: true })
  writeFileSync(resolve(target, 'src', 'old.mjs'), 'export const value = 1\n')
  git(target, ['init', '--quiet'])
  git(target, ['add', 'src/old.mjs'])
  git(target, [
    '-c',
    'user.name=PSDM Test',
    '-c',
    'user.email=psdm-test@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'baseline',
  ])
  git(target, ['mv', 'src/old.mjs', 'src/new.mjs'])

  const report = runJson(['inspect', '--staged', '--target', target, '--json'])

  assert.equal(report.git.changes[0].type, 'renamed')
  assert.equal(report.git.changes[0].previousPath, 'src/old.mjs')
  assert.equal(report.git.changes[0].path, 'src/new.mjs')
  assert.deepEqual(report.files, ['src/old.mjs', 'src/new.mjs'])
}

function testPrChecklistJson() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-checklist-json-'))
  const report = runJson([
    'pr-checklist',
    'small cleanup',
    '--target',
    target,
    '--file',
    'backend/auth/session.py',
    '--json',
  ])

  assert.equal(report.command, 'pr-checklist')
  assert.equal(report.classification.estimatedLevel, 'Level 3')
  assert.ok(report.requiredArtifacts.includes('docs/SECURITY.md'))
  assert.ok(report.requiredArtifacts.includes('docs/ARCHITECTURE.md'))
  assert.ok(report.checks.some((item) => item.includes('Risk path backend/auth/**')))
}

function testPrChecklistMarkdownLevel4() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-checklist-md-'))
  const output = run([
    'pr-checklist',
    'deploy migration',
    '--target',
    target,
    '--files',
    'backend/migrations/001.sql,.github/workflows/deploy.yml',
  ])

  assert.match(output, /# PSDM PR Checklist/)
  assert.match(output, /Estimated level: Level 4/)
  assert.match(output, /Rollback or recovery plan is documented/)
  assert.match(output, /backend\/migrations\/001\.sql matches backend\/migrations\/\*\*/)
  assert.match(output, /\.github\/workflows\/deploy\.yml matches \.github\/workflows\/\*\*/)
}

function testEnforceAllowsConfiguredLevel() {
  const report = runJson([
    'enforce',
    'small cleanup',
    '--target',
    repoRoot,
    '--file',
    'src/index.mjs',
    '--max-level',
    'Level 2',
    '--json',
  ])

  assert.equal(report.command, 'enforce')
  assert.equal(report.decision, 'CHANGE_LEVEL_APPROVED')
  assert.equal(report.allowed, true)
  assert.equal(report.classification.estimatedLevel, 'Level 2')
}

function testEnforceBlocksExceededLevel() {
  const report = runJson([
    'enforce',
    'deployment pipeline change',
    '--target',
    repoRoot,
    '--file',
    '.github/workflows/deploy.yml',
    '--max-level',
    'Level 2',
    '--json',
  ], {
    allowFailure: true,
  })

  assert.equal(report.command, 'enforce')
  assert.equal(report.decision, 'CHANGE_LEVEL_BLOCKED')
  assert.equal(report.allowed, false)
  assert.equal(report.classification.estimatedLevel, 'Level 4')
  assert.ok(report.violations.some((item) => item.includes('exceeds allowed Level 2')))
}

function testValidateInitializedProject() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-validate-'))
  run(['init', target])
  const report = runJson(['validate', target, '--json'])

  assert.equal(report.decision, 'METHOD_BASELINE_REVIEW_REQUIRED')
  assert.equal(report.failures, 0)
  assert.ok(report.warnings > 0)
  assert.equal(report.config.exists, true)
  assert.equal(report.config.ai.pii.allowedInPrompts, false)
  assert.equal(report.config.ai.tools.registryRequired, true)
  assert.deepEqual(report.config.approval.requiredLevels, ['Level 3', 'Level 4'])
  assert.deepEqual(report.config.approval.trustedApprovers, [])
  assert.equal(existsSync(resolve(target, 'ADRs', 'README.md')), true)
  assert.ok(report.results.some((item) => item.artifact === 'AGENTS.md' && item.status === 'PASS'))
  const agentRules = readFileSync(resolve(target, 'AGENTS.md'), 'utf8')
  assert.match(agentRules, /## 8\. Agent Decision Protocol/)
  assert.match(agentRules, /must never approve its own action/)
  assert.match(agentRules, /why that action should come next/)
}

function testCustomConfigArtifact() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-config-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'custom.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['docs/CUSTOM.md'],
    features: {
      root: 'features',
      requiredArtifacts: ['SPEC.md'],
    },
    git: {
      warnOnDirty: false,
    },
    ai: {
      pii: {
        allowedInPrompts: false,
        redactionRequired: true,
      },
      cost: {
        maxUsdPerRequest: 0.05,
        monthlyBudgetUsd: 100,
      },
      latency: {
        p95Ms: 3000,
      },
      tools: {
        registryRequired: true,
        humanApprovalForExternalActions: true,
      },
      evals: {
        required: true,
      },
      security: {
        promptInjectionTestsRequired: true,
      },
    },
    riskPaths: [
      {
        pattern: 'secure/**',
        minimumLevel: 'Level 3',
        requiredArtifacts: ['docs/CUSTOM.md'],
        reason: 'Custom secure path.',
      },
    ],
  }))

  run(['init', target, '--config', configPath])
  const check = runJson(['check', target, '--config', configPath, '--json'])
  const validate = runJson(['validate', target, '--config', configPath, '--json'])
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'secure/token.js',
    '--json',
  ])

  assert.equal(check.status, 'complete')
  assert.deepEqual(check.results.map((item) => item.artifact), ['docs/CUSTOM.md'])
  assert.equal(validate.config.ai.pii.allowedInPrompts, false)
  assert.equal(validate.config.ai.cost.maxUsdPerRequest, 0.05)
  assert.equal(validate.config.ai.latency.p95Ms, 3000)
  assert.equal(validate.config.ai.tools.registryRequired, true)
  assert.equal(classified.estimatedLevel, 'Level 3')
  assert.equal(classified.pathMatches[0].pattern, 'secure/**')
}

function testInvalidAiPolicyFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-ai-policy-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-ai.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    ai: {
      pii: {
        allowedInPrompts: 'no',
      },
      cost: {
        maxUsdPerRequest: -1,
      },
      latency: {
        p95Ms: 'fast',
      },
      tools: {
        registryRequired: 'yes',
      },
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message === 'ai.pii.allowedInPrompts must be a boolean or null.'
  )))
  assert.ok(validation.results.some((item) => item.message === 'ai.cost.maxUsdPerRequest must be a positive number or null.'))
  assert.ok(validation.results.some((item) => item.message === 'ai.latency.p95Ms must be a positive number or null.'))
  assert.ok(validation.results.some((item) => item.message === 'ai.tools.registryRequired must be a boolean or null.'))
}

function testAiAgentProfileCreatesGuardrailArtifacts() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-ai-agent-profile-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'ai-agent.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    profile: 'ai-agent',
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
  }))

  run(['init', target, '--config', configPath])
  const validation = runJson(['validate', target, '--config', configPath, '--json'])
  const artifacts = validation.results.map((item) => item.artifact)

  assert.equal(validation.failures, 0)
  assert.ok(artifacts.includes('docs/AI_GUARDRAILS.md'))
  assert.ok(artifacts.includes('docs/DATA_CLASSIFICATION.md'))
  assert.ok(artifacts.includes('docs/COST_LATENCY_BUDGET.md'))
  assert.ok(artifacts.includes('docs/PROMPT_INJECTION_TESTS.md'))
  assert.ok(artifacts.includes('docs/AI_EVALS.md'))
  assert.match(readFileSync(resolve(target, 'docs', 'AI_GUARDRAILS.md'), 'utf8'), /Evidence Contract/)
  assert.match(readFileSync(resolve(target, 'docs', 'COST_LATENCY_BUDGET.md'), 'utf8'), /does not collect runtime traces/)
}

function testValidationProfileFramework() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-profile-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'framework.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    profile: 'framework',
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'src/index.mjs',
    '--json',
  ])

  assert.equal(validation.config.profile.name, 'framework')
  assert.equal(validation.config.profile.recognized, true)
  assert.ok(validation.results.some((item) => item.artifact === 'ROADMAP.md' && item.status === 'FAIL'))
  assert.ok(validation.results.some((item) => item.artifact === 'TODO.md' && item.status === 'FAIL'))
  assert.equal(classified.estimatedLevel, 'Level 2')
  assert.equal(classified.pathMatches[0].pattern, 'src/**')
}

function testUnsupportedProfileFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-profile-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    profile: 'unknown-profile',
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.equal(validation.config.profile.name, 'unknown-profile')
  assert.equal(validation.config.profile.recognized, false)
  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message.includes('Unsupported profile: unknown-profile')
  )))
}

function testInvalidRiskPathFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-riskpath-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-risk.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    riskPaths: [
      {
        pattern: 'secure/**',
        minimumLevel: 'Level 5',
        requiredArtifacts: 'docs/SECURITY.md',
        reason: '',
      },
    ],
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })
  const classified = runJson([
    'classify',
    'small cleanup',
    '--target',
    target,
    '--config',
    configPath,
    '--file',
    'secure/token.js',
    '--json',
  ])

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message.includes('riskPaths[0].minimumLevel')
  )))
  assert.ok(validation.results.some((item) => item.message.includes('riskPaths[0].requiredArtifacts')))
  assert.ok(validation.results.some((item) => item.message.includes('riskPaths[0].reason')))
  assert.equal(classified.estimatedLevel, 'Level 1')
  assert.deepEqual(classified.pathMatches, [])
}

function testInvalidRiskPathCollectionFailsValidation() {
  const root = mkdtempSync(resolve(tmpdir(), 'psdm-riskpath-type-invalid-'))
  const target = resolve(root, 'project')
  const configPath = resolve(root, 'bad-risk-type.psdm.json')
  writeFileSync(configPath, JSON.stringify({
    version: 1,
    requiredArtifacts: ['AGENTS.md'],
    git: {
      warnOnDirty: false,
    },
    riskPaths: {
      pattern: 'secure/**',
      minimumLevel: 'Level 3',
    },
  }))

  const validation = runJson(['validate', target, '--config', configPath, '--json'], {
    allowFailure: true,
  })

  assert.ok(validation.results.some((item) => (
    item.artifact === 'psdm.config.json'
    && item.status === 'FAIL'
    && item.message === 'riskPaths must be an array.'
  )))
}

function testFeatureArtifacts() {
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-feature-'))
  run(['init', target])
  run(['init', target, '--feature', 'billing'])

  const check = runJson(['check', target, '--feature', 'billing', '--json'])
  const validate = runJson(['validate', target, '--feature', 'billing', '--json'])

  assert.equal(check.status, 'complete')
  assert.ok(check.results.some((item) => item.artifact === 'docs/features/billing/SPEC.md'))
  assert.equal(validate.failures, 0)
  assert.ok(validate.results.some((item) => item.artifact === 'docs/features/billing/SECURITY.md'))
}

function testExampleProjectCoverage() {
  const source = resolve(repoRoot, 'examples', 'nextjs-saas')
  const target = mkdtempSync(resolve(tmpdir(), 'psdm-example-nextjs-'))
  cpSync(source, target, { recursive: true })

  const shellAudit = runShell([target], '/audit\n/validate\n/exit\n')
  assert.match(shellAudit, /AI\s+\d+ surfaces · Gaps detected/)
  assert.match(shellAudit, /Gaps\s+6 governance gaps/)
  assert.match(shellAudit, /Focus\s+guardrails · data classification · \+4 more/)
  assert.match(shellAudit, /Run riscala init only after reviewing/)
  assert.match(shellAudit, /psdm\.config\.json policy/)
  assert.doesNotMatch(shellAudit, /riscala\.config\.json/)
  assert.match(shellAudit, /╭─ VALIDATE /)
  assert.match(shellAudit, /Decision\s+Needs correction/)
  assert.match(shellAudit, /Focus\s+AGENTS\.md · docs\/PROJECT_BRIEF\.md · \+\d+ more/)

  const audit = runJson(['audit', target, '--json'])
  assert.equal(audit.projectSignals.packageManager, true)
  assert.equal(audit.aiGovernance.adoptionMode, 'integrate')
  assert.ok(audit.aiGovernance.existing.includes('prompts'))
  assert.ok(audit.aiReadiness.surfaces.some((item) => (
    item.kind === 'provider-sdks'
    && item.detected.includes('package.json:openai')
  )))
  assert.ok(audit.aiReadiness.gaps.some((item) => item.key === 'guardrails'))

  run(['init', target])
  const validation = runJson(['validate', target, '--json'])
  assert.equal(validation.failures, 0)
  assert.equal(existsSync(resolve(target, 'docs', 'PSDM_ADOPTION.md')), true)
  assert.equal(existsSync(resolve(target, 'ADRs', 'README.md')), true)
}

const tests = [
  testRiscalaExecutableAliasContract,
  testActiveWorkCreatesReadsAndPreservesBoundary,
  testImpactLowRiskWithoutInitStaysLightweight,
  testImpactAuthTeachesDecisionWithoutTakingAuthority,
  testImpactUnknownGreenfieldExposesUncertaintyWithoutMutation,
  testImpactDoesNotMatchAiInsideOrdinaryWords,
  testImpactLegacyUsesTargetMetadataAndLeadContext,
  testImpactRejectsUnsupportedGuidance,
  testDecisionReviewAlignedScopeRemainsAdvisory,
  testDecisionReviewDetectsScopeAndDeliveryDrift,
  testDecisionReviewReportsDependencyDeltaWithoutReadingSource,
  testDecisionReviewReportsMissingExpectedScope,
  testDecisionReviewNoStagedChangesIsReadOnlyNoOp,
  testDecisionReviewGuidanceChangesDensityNotAuthority,
  testReadOnlyShellRoutesCommandsAndReportsContext,
  testShellUsesPtechCyanOnlyForInteractiveTerminals,
  testShellMenuFiltersNavigatesAndPreservesLayout,
  testInteractiveShellOpensSlashMenuAndNavigates,
  testActionRecordAndApprovalReceiptVerification,
  testApprovalEnforcementConsumesReceiptOnce,
  testManagedPreCommitHookAllowsLowRiskAndBlocksHighRisk,
  testHookInstallerPreservesUnmanagedHook,
  testHookInstallerRespectsConfiguredHooksPath,
  testActionRecordFailsClosedWithoutTrustedApprover,
  testInvalidApprovalPolicyFailsClosed,
  testApprovalPolicyMayDisableSignedLevelRequirements,
  testAuditExistingProject,
  testAuditDetectsExistingAiGovernance,
  testAuditDetectsAiRuntimeSurfaces,
  testInitCreatesAdoptionPlanForExistingAiGovernance,
  testInitIsIdempotentForPsdmManagedGovernance,
  testInitDryRunDoesNotWrite,
  testAdrCreatesDecisionRecord,
  testAdrRejectsInvalidDate,
  testClassifyRiskPathJson,
  testClassifyAgentInstructionsAsLevelThree,
  testClassifyApprovalEnforcementAsLevelThree,
  testInspectStagedRiskPathJson,
  testInspectStagedUsesLevelOneFloor,
  testInspectReportsNoStagedChanges,
  testInspectRejectsNonGitTarget,
  testInspectParsesStagedRename,
  testPrChecklistJson,
  testPrChecklistMarkdownLevel4,
  testEnforceAllowsConfiguredLevel,
  testEnforceBlocksExceededLevel,
  testValidateInitializedProject,
  testCustomConfigArtifact,
  testInvalidAiPolicyFailsValidation,
  testAiAgentProfileCreatesGuardrailArtifacts,
  testValidationProfileFramework,
  testUnsupportedProfileFailsValidation,
  testInvalidRiskPathFailsValidation,
  testInvalidRiskPathCollectionFailsValidation,
  testFeatureArtifacts,
  testExampleProjectCoverage,
]

for (const test of tests) {
  await test()
  console.log(`PASS ${test.name}`)
}
