# Action Records And Approval Receipts

Status: `Verification Core Implemented`
Product: `Riscala`
Method: `PSDM`

## Purpose

Define and operate the dependency-free verification core that binds a human approval to the exact Git commit content proposed by an agent or developer.

The core is intentionally read-only. It prepares action records and verifies detached signatures, but it does not sign receipts, create commits, install hooks, or prove that a signing ceremony used real hardware. Those enforcement boundaries remain external.

## Prepare A Git Commit Action

Stage the intended files, then run:

```bash
riscala action prepare git.commit --json
```

The action record contains:

- a deterministic action ID;
- a hashed repository identity;
- the current branch;
- a SHA-256 hash of the full binary staged diff;
- the staged change classification;
- whether approval is required;
- trusted approver IDs, fingerprints, and permitted approval modes.

Repository credentials and public-key paths are not emitted in the public action record.

`APPROVAL_POLICY_INCOMPLETE` is returned when approval is required but no trusted approver exists. `APPROVAL_POLICY_INVALID` is returned when local policy is malformed. Both decisions fail closed.

## Configure Trust

Add public trust material to `psdm.config.json`:

```json
{
  "approval": {
    "requiredLevels": ["Level 3", "Level 4"],
    "requiredActions": ["git.commit"],
    "maxReceiptAgeSeconds": 600,
    "trustedApprovers": [
      {
        "id": "owner",
        "publicKeyPath": "governance/keys/owner-public.pem",
        "publicKeyFingerprint": "sha256:64-lowercase-hex-characters",
        "approvalModes": ["hardware-signature"]
      }
    ]
  }
}
```

Only public keys belong in project policy. Private keys, recovery material, secrets, confirmation phrases, and hardware credentials must never enter the repository.

The fingerprint is SHA-256 over the DER-encoded SubjectPublicKeyInfo public key. One way to calculate it is:

```bash
openssl pkey -pubin -in governance/keys/owner-public.pem -outform DER \
  | openssl dgst -sha256
```

Prefix the resulting lowercase hexadecimal digest with `sha256:`.

Project policy changes must themselves remain protected by review, hooks, and branch policy. A repository-writable trust root is not independently agent-resistant without those controls.

## Receipt Contract

The trusted external signer creates a receipt with these signed fields:

```json
{
  "version": 1,
  "approvalId": "approval_01J00000000000000000000000",
  "actionId": "action_content_bound_identifier",
  "action": "git.commit",
  "repository": "sha256:repository-identity",
  "branch": "feature/session-hardening",
  "contentHash": "sha256:staged-diff-hash",
  "approver": "owner",
  "approverKeyFingerprint": "sha256:trusted-key-fingerprint",
  "issuedAt": "2026-07-10T12:00:00.000Z",
  "expiresAt": "2026-07-10T12:05:00.000Z",
  "approvalMode": "hardware-signature",
  "signature": "base64-detached-signature"
}
```

The signature covers canonical JSON for every receipt field except `signature`. Object keys are recursively sorted, arrays retain order, and JSON scalar encoding is preserved.

Riscala deliberately provides no signing command. A hardware-backed application or separate authenticated service must create the signature outside the agent-controlled channel.

## Verify A Receipt

Verify against the current Git index:

```bash
riscala approval verify git.commit \
  --receipt /trusted/channel/approval-receipt.json \
  --json
```

Keep the receipt outside the staged change. Staging a receipt would change the content hash it is meant to approve and creates a circular binding.

## Enforce A Commit Locally

Place the signed receipt at `.git/riscala/approval-receipt.json`, or pass an explicit path, then enforce and consume it:

```bash
riscala approval enforce git.commit --json
```

Install the managed pre-commit hook:

```bash
riscala hook install pre-commit
riscala hook status pre-commit
```

Remove only the Riscala-managed hook:

```bash
riscala hook remove pre-commit
```

The installer respects Git's resolved hook path, including `core.hooksPath`, and refuses to overwrite an unmanaged `pre-commit` hook.

Consumed approval IDs are written atomically under `.git/riscala/consumed-approvals.json`. An exclusive lock prevents two local verification processes from consuming the same receipt concurrently. The ledger contains identifiers, action binding, and consumption time; it does not store signatures, keys, or receipt payloads.

This ledger and hook are local defense in depth. An agent with unrestricted Git or filesystem control can use `--no-verify`, replace a hook, or delete local state. Agent-resistant enforcement therefore also requires protected branches, trusted CI, or a remote approval service with durable replay state.

Verification rebuilds the live action record and denies the receipt when:

- repository, branch, action ID, action, or staged diff hash changed;
- the receipt is expired, future-dated, or lives longer than project policy permits;
- the approver is not trusted;
- the public key does not match its pinned fingerprint;
- the approval mode is `phrase` or is not permitted for that approver;
- the detached signature is invalid;
- policy is invalid or incomplete.

Supported detached public-key verification includes Ed25519/Ed448 and SHA-256 verification for key types supported by Node.js crypto.

## Remaining Enforcement Work

This core does not yet authorize `/commit` or other mutating slash commands.

Before mutation is enabled, Riscala still needs:

1. real owner public-key enrollment;
2. activation of the implemented pre-commit hook after trust enrollment;
3. a protected policy-change path;
4. remote replay protection and required-check enforcement that cannot be bypassed locally;
5. equivalent bindings for push, pull request, merge, publication, and deployment.
