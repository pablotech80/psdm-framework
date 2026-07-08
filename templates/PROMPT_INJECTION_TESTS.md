# PROMPT_INJECTION_TESTS.md

Status: `Draft`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Prompt Injection Test Governance`
Mode: `AI / Security Testing Mode`

## 1. Purpose

Define adversarial test expectations for prompt injection and related AI attack paths.

This artifact describes required scenarios and accepted evidence. PSDM does not provide a hosted eval runner.

## 2. Attack Scenarios

Document test scenarios for:

- direct prompt injection;
- indirect prompt injection from retrieved content;
- tool injection;
- context poisoning;
- memory poisoning;
- data exfiltration;
- policy override attempts;
- unsafe action requests.

## 3. Test Dataset

Document where test cases live, who owns them, and how they are reviewed.

Do not include secrets, private customer data, or production values in test cases.

## 4. Expected Behavior

Define expected refusal, sanitization, escalation, logging, and tool-denial behavior.

## 5. Execution Method

Document how tests are run:

- project-owned script;
- CI job;
- external eval tool;
- manual security review.

## 6. Evidence Contract

Accepted evidence may include:

- CI output;
- eval report;
- red-team notes;
- security review approval;
- sample sanitized failure cases.

PSDM validates that evidence exists when required; PSDM does not execute provider-specific adversarial suites by default.

## 7. Known Gaps

Document accepted gaps, owner, follow-up date, and mitigation.

## 8. Prompt Injection Gate

AI behavior is not ready when attack scenarios, expected behavior, execution method, or evidence are missing.
