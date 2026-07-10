# ADR-2026-07-10-adopt-riscala-product-identity

Status: `Accepted`
Date: `2026-07-10`
Method: `PTECH SPEC-DRIVEN METHOD`
Artifact Type: `Architecture Decision Record`

## 1. Decision

Adopt **Riscala** as the product-facing identity for the CLI, with **AI Code Governance for Software Delivery** as its category descriptor. Preserve **PSDM** as the underlying governance method and compatibility boundary.

## 2. Context

`PSDM Framework` accurately names the method and repository, but it is difficult to use as a memorable product identity or interactive terminal prompt. The planned terminal shell needs a concise name that can work as a command, package identity, visual header, and product brand.

The product already has published beta users through `@ptechsolution/psdm-framework`, the `psdm` executable, `psdm.config.json`, GitHub Action inputs, documentation links, and stable JSON contracts. A direct rename would create avoidable compatibility and release risk.

Naming research also found that the literal AI-code-governance space is crowded by active products using names such as CodeTrust, CodeSteward, CodeProof, CodeRail, and CodaiQ. `Riscala` provides a distinct identity derived from the product's core principle: governance scales with risk.

## 3. Options Considered

1. Adopt `Riscala` as the product and retain PSDM as the method.
2. Adopt the descriptive name `CodeGovern AI` for both product and executable.
3. Keep `PSDM Framework` as both method and product.

## 4. Chosen Option

Adopt this brand architecture:

```text
Riscala
AI Code Governance for Software Delivery
Powered by PSDM
```

The intended future executable is `riscala`. The existing `psdm` executable remains supported during the compatibility period.

## 5. Rationale

- `Riscala` is short enough for a terminal command and interactive prompt.
- The name reflects risk-scaled governance without limiting the product to security scanning or AI-code attribution.
- Keeping PSDM as the method preserves the meaning of existing governance files and documentation.
- A staged transition protects beta users and automation from a branding-only breaking change.
- The descriptive subtitle makes the product category explicit without choosing another generic `Code*` product name.

Preliminary availability checks found no npm package named `riscala` and no established developer-governance product using the exact name. This is not legal trademark clearance, domain ownership, or publication authorization.

## 6. Consequences

### Positive

- The product gains a distinct, pronounceable identity suitable for an interactive CLI.
- PSDM remains a portable method rather than becoming inseparable from one product executable.
- Existing users receive a compatibility path instead of a forced rename.

### Negative

- Documentation will temporarily contain both Riscala and PSDM.
- Package, executable, repository, assets, and website transitions require separate validation and release work.
- Name availability must be checked again before package publication, domain purchase, or trademark activity.

### Trade-offs

- This decision optimizes for product clarity and compatibility over an immediate, repository-wide rename.
- The first migration phase will introduce an alias and brand presentation while preserving existing machine contracts.

## 7. Validation

- Compared the name against the product purpose and risk-scaled governance principle.
- Searched current AI-code-governance products for naming conflicts and category saturation.
- Checked preliminary npm and GitHub usage for `Riscala`.
- Received explicit owner confirmation to proceed with Riscala on `2026-07-10`.

## 8. Related Artifacts

- `docs/RISCALA_BRAND_MIGRATION.md`
- `docs/PROJECT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/SPEC.md`
- `docs/CONFIG_SCHEMA.md`
- `docs/PUBLIC_PACKAGE_RELEASE_CHECKLIST.md`
- `docs/NPM_TRUSTED_PUBLISHING.md`

## 9. Review Notes

Accepted by the repository owner. This ADR authorizes planning and compatibility work; it does not authorize npm publication, domain purchase, repository rename, removal of the `psdm` executable, or breaking config/JSON changes.
