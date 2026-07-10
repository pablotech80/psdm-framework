# Risk Paths

Risk paths let PSDM classify a change by the files it touches, not only by the words in the change description.

This is the main backend and platform governance mechanism. Small frontend copy edits can stay lightweight, while changes under authentication, payments, migrations, infrastructure, AI agents, RAG, and CI/CD receive stronger controls.

Root `AGENTS.md` is a default Level 3 risk path because instruction changes can alter autonomous behavior, approval boundaries, and tool use even when no application source file changes.

Riscala approval commands, action records, receipt verification, replay enforcement, and Git hook modules are also default Level 3 paths because changes there can weaken human authority or alter what content an approval authorizes.

## Configuration

Define rules in `psdm.config.json`:

```json
{
  "riskPaths": [
    {
      "pattern": "backend/auth/**",
      "minimumLevel": "Level 3",
      "requiredArtifacts": ["docs/SECURITY.md", "docs/TESTING.md"],
      "reason": "Authentication and authorization changes can expose private data or bypass access control."
    },
    {
      "pattern": "backend/migrations/**",
      "minimumLevel": "Level 4",
      "requiredArtifacts": ["docs/DEPLOYMENT.md", "docs/OPERATIONS.md"],
      "reason": "Database migrations can require rollback and production operations planning."
    }
  ]
}
```

Patterns support `*` for one path segment and `**` for any nested path.

Validation requirements:

- `pattern` must be a non-empty string.
- `minimumLevel` must be `Level 1`, `Level 2`, `Level 3`, or `Level 4`.
- `requiredArtifacts` must be an array of non-empty strings.
- `reason` must be a non-empty string.

Malformed rules fail `psdm validate` and are ignored by path matching.

## CLI

Classify a change with touched files:

```bash
psdm classify "small cleanup" --file backend/auth/session.py
```

Multiple files:

```bash
psdm classify "refactor service layer" --files backend/auth/session.py,backend/migrations/001_add_index.sql
```

JSON output:

```bash
psdm classify "refactor service layer" --files backend/auth/session.py,backend/migrations/001_add_index.sql --json
```

Inspect files already staged in Git without repeating the path list:

```bash
psdm inspect --staged --json
```

Staged inspection assigns at least Level 1 when the index contains file changes. Matching risk paths then raise that minimum using the same rules as `psdm classify`. Unstaged and untracked files are outside this command's explicit scope.

## Decision Model

PSDM calculates the highest level from:

- description keyword signals;
- configured risk path matches.

For `psdm inspect --staged`, the existence of staged file changes also provides a Level 1 minimum.

The final classification still requires human confirmation because file paths do not capture full business impact.
