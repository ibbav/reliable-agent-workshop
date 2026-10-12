---
name: reliable-agent-workflow/simplify
description: Reduce unnecessary prompt context while preserving behavior, safety rules, and testability.
---

# Simplify

This skill answers one question: which words can be removed without changing the contract or safeguards?

1. Measure the current prompt before editing.
2. Check role, structure, language, tools, examples, security, user experience, and token efficiency.
3. Remove duplicate rules, filler, stale comments, and near-identical examples.
4. Convert repeated mappings into a compact table when the table stays readable.
5. Keep rationale that helps resolve ambiguity; move it to role or context when misplaced.
6. Preserve hard constraints, failure paths, escalation, and protected actions word for word unless the user approves a behavioral change.
7. Show before-and-after metrics and request approval before applying the rewrite.

A shorter prompt can behave differently. Always validate and compare it after approval.

## Reference route and handoff

Use [prompt structure](../../references/prompt_structure.md) to find duplicated decisions, [core principles](../../references/core_principles.md) to distinguish useful rationale from filler, and [quality checklist](../../references/quality_checklist.md) to inspect the shortened draft.

For the conference assistant, a table of session-status mappings may replace repeated prose, but the rule forbidding final booking cannot disappear. Compare the exact contract and high-risk branches before celebrating a lower token count.

The proposal shows what is removed, what is retained, approximate token change, and the behavior that might change. Keep the original version intact for paired evaluation.
