export const REQUIRED_ARTIFACTS = [
  'AGENTS.md',
  'docs/PROJECT_BRIEF.md',
  'docs/SPEC.md',
  'docs/ARCHITECTURE.md',
  'docs/CHANGE_GOVERNANCE.md',
  'docs/TASKS.md',
  'docs/TESTING.md',
  'docs/DEPLOYMENT.md',
  'docs/SECURITY.md',
  'docs/OPERATIONS.md',
  'ADRs',
]

export const TEMPLATE_MAP = {
  'AGENTS.md': 'AGENTS.md',
  'docs/PROJECT_BRIEF.md': 'PROJECT_BRIEF.md',
  'docs/SPEC.md': 'SPEC.md',
  'docs/ARCHITECTURE.md': 'ARCHITECTURE.md',
  'docs/CHANGE_GOVERNANCE.md': 'CHANGE_GOVERNANCE.md',
  'docs/TASKS.md': 'TASKS.md',
  'docs/TESTING.md': 'TESTING.md',
  'docs/DEPLOYMENT.md': 'DEPLOYMENT.md',
  'docs/SECURITY.md': 'SECURITY.md',
  'docs/OPERATIONS.md': 'OPERATIONS.md',
}

export const REQUIRED_SECTIONS = {
  'AGENTS.md': ['# AGENTS.md', 'Required Reading', 'Boundaries', 'Escalation'],
  'docs/PROJECT_BRIEF.md': ['# PROJECT_BRIEF.md', 'Problem Statement', 'Success Criteria', 'Open Questions'],
  'docs/SPEC.md': ['# SPEC.md', 'Functional Requirements', 'Acceptance Criteria', 'Out of Scope'],
  'docs/ARCHITECTURE.md': ['# ARCHITECTURE.md', 'System Overview', 'Architecture Decisions', 'Architecture Gate'],
  'docs/CHANGE_GOVERNANCE.md': ['# CHANGE_GOVERNANCE.md', 'Change Levels', 'Required Artifacts', 'Stop Conditions'],
  'docs/TASKS.md': ['# TASKS.md', 'Task Plan', 'Completion Criteria'],
  'docs/TESTING.md': ['# TESTING.md', 'Validation Commands', 'Testing Gate'],
  'docs/DEPLOYMENT.md': ['# DEPLOYMENT.md', 'Deployment Scope', 'Deployment Gate'],
  'docs/SECURITY.md': ['# SECURITY.md', 'Threat Model', 'Security Gate'],
  'docs/OPERATIONS.md': ['# OPERATIONS.md', 'Monitoring Strategy', 'Operations Gate'],
}
