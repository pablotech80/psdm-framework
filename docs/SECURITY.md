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

Relevant sensitive surfaces:

- `src/validator/**`
- `src/lib/config.mjs`
- `src/lib/classifier.mjs`
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
- the interactive shell routes an explicit read-only command allowlist, rejects arbitrary terminal input, and blocks mutating slash commands;
- no production mutation commands;
- simple secret-like pattern detection in validator;
- explicit production confirmation policy in generated governance docs;
- GitHub secret scanning and push protection enabled on the public repository;
- CodeQL workflow for JavaScript analysis;
- dependency review workflow for pull requests;
- Dependabot update configuration for npm and GitHub Actions.

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
- changes approval receipt, human-presence, content-binding, or agent decision semantics.

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
