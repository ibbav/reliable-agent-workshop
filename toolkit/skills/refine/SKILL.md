---
name: reliable-agent-workflow/refine
description: Improve a prompt from a validation report or specific user feedback while preserving safeguards.
---

# Refine

This skill answers one question: what is the smallest change that addresses the observed problem?

1. Preserve the current version as the comparison baseline.
2. Order findings by protected-rule failure, correctness failure, warning, then style preference.
3. Show the affected text, proposed replacement, and reason before editing.
4. Preserve authentication, privacy rules, error handling, escalation, and output compatibility.
5. Check shared contracts and downstream consumers.
6. Re-run inspection and the affected behavioral cases.

Do not weaken a hard rule to save tokens. Do not change expected outputs merely to match the candidate. After three unsuccessful refine-and-validate loops, revisit the brief.

## Reference route and handoff

Use [anti-patterns](../../references/anti_patterns.md) to classify the observed failure, [core principles](../../references/core_principles.md) to preserve the underlying rule, and [comparative evaluation](../../references/comparative_evaluation.md) to plan a fair comparison.

For example, if the assistant proposes a hold when “keynote” matches two sessions, repair the ambiguity branch, not the entire tone section. Check whether a shared JSON contract or grader also needs adjustment; do not make that adjustment merely to excuse the candidate.

Handoff includes the exact old and new text, the case that motivated the change, linked consumers, and the focused plus broad checks to rerun. If a counterpart is deliberately deferred, record the lag and owner.
