# Security Policy

## Supported Versions

PSDM Framework is currently in beta. Security fixes target the latest published beta or main branch until a stable support policy is defined.

## Reporting a Vulnerability

Do not open a public issue for secrets, credential exposure, supply-chain concerns, or exploitable behavior.

Primary public reporting channel:

- Use GitHub's private vulnerability reporting flow from the repository Security tab when the repository is public.

Fallback public contact:

- If GitHub private vulnerability reporting is unavailable, contact Ptech through `https://ptechsolution.net` and request a private security disclosure channel.
- Do not include secrets, exploit payloads, private repository output, customer data, or production incident details in the first message.

For stable `1.0.0`, maintainers should verify that GitHub private vulnerability reporting is enabled and visible on the public repository.

## Scope

Relevant security concerns include:

- secret or credential exposure in generated artifacts;
- unsafe package publication contents;
- CLI behavior that overwrites existing project files unexpectedly;
- validation bypasses that hide high-risk governance failures;
- prompt-injection, PII, tool-use, or AI governance templates that encourage unsafe handling.

PSDM is a governance tool. It does not replace application security review, dependency scanning, runtime authorization, or production incident response.
