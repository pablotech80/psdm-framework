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

Relevant sensitive surfaces:

- `src/validator/**`
- `src/lib/config.mjs`
- `src/lib/risk-paths.mjs`
- `templates/**`
- `action.yml`
- `.github/workflows/**`
- `package.json`

Security posture:

- dependency-free CLI by default;
- local file inspection only;
- no production mutation commands;
- simple secret-like pattern detection in validator;
- explicit production confirmation policy in generated governance docs.

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
- introduces dependencies;
- affects AI-agent tool governance.
