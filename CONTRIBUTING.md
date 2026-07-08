# Contributing

Thanks for considering a contribution to PSDM Framework.

PSDM is a governance CLI and GitHub Action for AI-assisted software delivery. Contributions should preserve the project's main constraint: keep governance useful without turning small safe changes into heavyweight process.

## Local Setup

```bash
npm install
npm test
npm run release:check -- --allow-dirty
```

The project has no runtime dependencies. Avoid adding dependencies unless the benefit is clear and documented.

## Development Rules

- Keep CLI output stable unless the change explicitly updates the contract.
- Keep JSON output automation-friendly.
- Update docs when behavior, config, templates, or release process changes.
- Add focused fixture coverage for new CLI behavior.
- Do not include secrets, credentials, customer data, production URLs, or private runner output in examples, tests, docs, or prompts.

## Pull Request Expectations

Before opening a PR:

```bash
npm run release:check -- --allow-dirty
```

For release branches, run the same command on a clean working tree without `--allow-dirty`.
