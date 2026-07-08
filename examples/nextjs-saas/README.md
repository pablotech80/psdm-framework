# Next.js SaaS Example

This example is a lightweight fixture for a PSDM-governed SaaS project.

It is intentionally not a runnable application. It gives the PSDM test suite a stable downstream-like project shape without installing Next.js, OpenAI SDKs, databases, or external services.

Represented surfaces:

- Public website.
- Private dashboard.
- Auth-sensitive area.
- AI-assisted feature.
- Deployment planning.

Coverage expectations:

- `psdm audit` detects a package-managed project.
- `psdm audit` detects AI runtime signals from `package.json` and `prompts/`.
- `psdm init` creates baseline PSDM artifacts without overwriting example files.
- `psdm validate` accepts the initialized copy with zero failures.

Do not add secrets, real API keys, customer data, production hostnames, or provider credentials to this example.
