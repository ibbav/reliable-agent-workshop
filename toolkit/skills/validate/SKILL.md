---
name: reliable-agent-workflow/validate
description: Inspect a prompt against seven quality gates without claiming behavioral reliability.
---

# Validate

This skill answers one question: is the prompt clear and complete enough to test?

Run every gate and report pass, warning, or fail with exact locations and fixes:

1. Structure: ordered sections, consistent headings, and no orphaned rules.
2. Language: concrete verbs, defined terms, calibrated mandates, and no vague thresholds.
3. Completeness: bounded responsibilities, out-of-scope paths, tool failures, and manipulation defense.
4. Efficiency: no accidental duplication or excessive examples.
5. Anti-patterns: no generic role, scattered logic, weak tool contracts, unsupported claims, or missing disambiguation.
6. Format compatibility: explicit delimiters, schemas, and provider-neutral boundaries where possible.
7. Readiness by inspection: vague input, missing data, multiple matches, pivots, and closure are addressed.

Passing inspection means the text is ready for behavioral evaluation. It does not prove correctness and does not authorize release.

## Reference route and handoff

Apply the full [quality checklist](../../references/quality_checklist.md), then inspect likely failures in [anti-patterns](../../references/anti_patterns.md). Use [output contracts](../../references/output_contracts.md) for schema paths and [model configuration](../../references/model_configuration.md) for provider-dependent assumptions.

For the conference example, inspect zero, one, and multiple session matches; missing schedule data; a failed catalog lookup; and a forbidden final-booking request. Quote the prompt location that handles each path. Missing text is a finding, not a pass inferred from a friendly example.

Return a seven-gate report with locations, severity, repair, and unresolved assumptions. Send the result to evaluation only when the prompt is inspectable.
