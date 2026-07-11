# Beta.6 Clean Install Validation

Status: `Passed`
Date: `2026-07-11`
Scope: `Public onboarding and installed-package judgment loop`

## Purpose

Prove that a developer can understand and use the beta.6 judgment loop from public documentation without relying on repository history or maintainer knowledge.

## Method

The validation followed `docs/GETTING_STARTED.md` against a package tarball created from the current checkout.

The tarball was installed into a temporary npm prefix. The test did not alter the user's global npm installation, publish to npm, or mutate an external repository.

Temporary scenarios covered:

- installed `riscala help`;
- greenfield `impact` from an empty directory;
- legacy `impact` against selected TypeScript/TSX paths;
- staged `review` inside a temporary Git repository;
- piped read-only shell use with `/impact` and `/review`.

## Evidence

The installed package produced:

- help copy centered on amplifying developer judgment;
- greenfield product-intake questions, including who experiences the problem;
- bounded legacy evidence including an exported `POST` handler;
- `scope_aligned_evidence_unverified` for an aligned staged file envelope;
- `IMPACT` and `REVIEW` result panels from the read-only shell.

All assertions passed.

## Boundaries

- The tarball still carried version `1.0.0-beta.5`; version preparation was intentionally excluded from this onboarding increment.
- npm `@beta` was not used because it still points to the published beta.5 implementation without `impact` and `review`.
- No claim was made that tests or runtime behavior of the temporary example were validated by Riscala.
- No human approval, commit, push, merge, deployment, or publication was performed by the installed CLI.

## Decision

The public onboarding gate for beta.6 passes.

The next release step is a separate beta.6 candidate preparation increment: version metadata, release notes, strict clean-tree release check, protected workflow dry-run, and explicit owner-controlled publication.
