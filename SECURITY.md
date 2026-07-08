# Security Policy

## Supported Versions

PSDM Framework is currently in beta. Security fixes target the latest published beta or main branch until a stable support policy is defined.

## Reporting a Vulnerability

Do not open a public issue for secrets, credential exposure, supply-chain concerns, or exploitable behavior.

Until a dedicated security contact is published, report privately through the repository owner's preferred private channel. Public release metadata must be updated with a dedicated security contact before stable `1.0.0`.

## Scope

Relevant security concerns include:

- secret or credential exposure in generated artifacts;
- unsafe package publication contents;
- CLI behavior that overwrites existing project files unexpectedly;
- validation bypasses that hide high-risk governance failures;
- prompt-injection, PII, tool-use, or AI governance templates that encourage unsafe handling.

PSDM is a governance tool. It does not replace application security review, dependency scanning, runtime authorization, or production incident response.
