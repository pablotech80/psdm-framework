# SECURITY.md

Status: `Active`
Project: `psdm-framework`

## Threat Model

Primary security concerns:

- leaking secrets through docs, examples, generated reports, or logs;
- approving incomplete governance artifacts;
- weakening high-risk classification for security, data, payment, AI, deployment, operations, or CI/CD changes;
- allowing config changes to bypass required review;
- creating misleading JSON output that downstream automation trusts incorrectly;
- expanding dependencies and supply-chain surface without clear need.
- allowing an AI agent to satisfy or reuse its own human-approval gate.
- executing modified content after approval was issued for a different hash or target.
- presenting inferred technical impact as observed repository fact;
- presenting an advisory recommendation as developer authority;
- leaking sensitive repository contents through Judgment Brief evidence;
- creating false confidence when repository evidence is incomplete.

Relevant sensitive surfaces:

- `src/validator/**`
- `src/lib/config.mjs`
- `src/lib/classifier.mjs`
- `src/lib/judgment.mjs`
- `src/commands/impact.mjs`
- `src/lib/git.mjs`
- `src/lib/risk-paths.mjs`
- `templates/**`
- `action.yml`
- `.github/workflows/**`
- `package.json`

Security posture:

- dependency-free CLI by default;
- `riscala` and `psdm` resolve to the same reviewed entrypoint and do not create separate execution paths;
- agent instructions forbid self-approval, while future strong enforcement requires content-bound hardware or remote approval;
- local file inspection only;
- staged inspection invokes Git with fixed arguments through `execFileSync`, reads file-status metadata rather than file contents, and never mutates the index;
- Judgment Brief evidence exposes bounded metadata and repository-relative provenance rather than unrestricted source content;
- Judgment Brief results label repository evidence as deterministic and semantic impact as inferred with explicit confidence and uncertainty;
- `ownerDecision` remains unset and developer-only; Riscala cannot create, infer, approve, or simulate it;
- `riscala impact` is read-only, requires no initialization, and does not persist intent, evidence, or decisions in beta.6;
- `riscala review` treats CLI-declared expected scope as unverified advisory input and never describes alignment as approval;
- package dependency review compares bounded dependency names from `HEAD:package.json` and the staged index without logging package contents;
- Decision Review observes test-file presence but never infers that validation commands were executed;
- the interactive shell routes an explicit read-only command allowlist, rejects arbitrary terminal input, and blocks mutating slash commands;
- ANSI styling is limited to interactive presentation and never enters JSON or piped automation output;
- no npm lifecycle script is introduced for decorative installation behavior;
- the raw TTY palette contains only allowlisted read-only commands and delegates execution to the existing router rather than a system shell;
- non-TTY input never enters raw mode or receives terminal cursor-control output;
- Git commit action records hash the binary staged diff plus repository and branch binding without exposing remote credentials;
- receipt verification pins project-approved public-key fingerprints, strong approval modes, and short expiry windows;
- Riscala deliberately has no receipt-signing command, so an agent cannot obtain authority from the verifier itself;
- managed pre-commit enforcement consumes receipt IDs through an exclusive lock and atomic local ledger without persisting signatures;
- existing unmanaged hooks are never overwritten or removed;
- local hooks and `.git` replay state are bypassable by an agent with unrestricted Git/filesystem control, so protected remote checks remain required;
- no production mutation commands;
- simple secret-like pattern detection in validator;
- explicit production confirmation policy in generated governance docs;
- GitHub secret scanning and push protection enabled on the public repository;
- CodeQL workflow for JavaScript analysis;
- dependency review workflow for pull requests;
- Dependabot update configuration for npm and GitHub Actions.
- `main` branch protection currently runs in solo-maintainer mode with strict `validate-framework` and `Analyze JavaScript` checks, conversation resolution, admin enforcement, and blocked force pushes and deletions.

When additional maintainers join, team mode should add at least one required approving review from a maintainer with write access. The solo-maintainer mode avoids self-review theater while preserving CI and branch safety controls.

## Public Vulnerability Reporting

Primary channel:

- Use GitHub private vulnerability reporting from the repository Security tab when the repository is public.

Fallback channel:

- Use `https://ptechsolution.net` to request a private security disclosure channel if GitHub private vulnerability reporting is unavailable.

Do not open public issues for secrets, credential exposure, supply-chain concerns, exploitable behavior, private repository output, customer data, or production incident details.

Before stable `1.0.0`, maintainers must verify that the public repository exposes the intended private vulnerability reporting flow.

## Security Gate

Security review is required when a change:

- changes validator pass/fail decisions;
- changes secret detection;
- changes risk path classification;
- changes risk path validation;
- changes config loading or defaults;
- changes GitHub Action behavior;
- changes package distribution contents;
- changes either executable mapping or allows Riscala/PSDM behavior to diverge;
- introduces dependencies;
- affects AI-agent tool governance.
- changes Judgment Brief evidence collection, fact/inference boundaries, owner authority, uncertainty, or recommendation semantics;
- changes Change Envelope authority status, staged scope comparison, Git object reads, dependency deltas, Decision Review readiness, or approval wording;
- changes approval receipt, human-presence, content-binding, or agent decision semantics.
- changes trusted approver configuration, canonical receipt payloads, signature algorithms, or action-record hashes.
- changes hook installation, receipt consumption, replay state, lock handling, or remote-enforcement assumptions.

## Automated Security Checks

Repository-level checks:

- `.github/workflows/codeql.yml` runs CodeQL on pull requests, pushes to `main`, and a weekly schedule.
- `.github/workflows/dependency-review.yml` reviews dependency changes in pull requests and fails on high-severity findings.
- `.github/dependabot.yml` requests weekly updates for npm dependencies and GitHub Actions.

GitHub repository settings:

- secret scanning: enabled;
- secret scanning push protection: enabled;
- Dependabot security updates: enabled;
- private vulnerability reporting: enabled.
- branch protection on `main`: enabled with required checks and solo-maintainer review policy.
