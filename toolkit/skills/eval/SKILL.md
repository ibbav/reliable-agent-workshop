---
name: reliable-agent-workflow/eval
description: Compare frozen prompt versions using independent cases, deterministic grading, protected rules, and uncertainty reporting.
---

# Eval

This skill answers one question: does the candidate improve the declared behavior without breaking a protected rule?

1. Derive expected results from approved requirements, not model answers.
2. Cover normal paths, boundaries, missing data, ambiguous matches, corrections, denied permissions, and tool failures.
3. Freeze prompt hashes, cases, grader, model settings, scenario groups, repeats, and maximum calls.
4. Run both versions on the same cases. Keep call, parse, and grading failures in the denominator.
5. Grade fixed contracts and protected rules deterministically. Use model evaluators only for qualities that cannot be checked in code.
6. Keep development and held-out evidence separate.
7. Fit each binary metric separately and check diagnostics before interpreting the posterior.
8. Report raw counts, pair outcomes, uncertainty, sensitivity, hard failures, and limitations.

Stop at the planned budget. An interval crossing zero is inconclusive, and a protected-rule failure vetoes an otherwise favorable result. Paid calls and publication require separate approval.

## Reference route and handoff

Read the [regular process](../../references/regular_agent_process.md), [comparative evaluation](../../references/comparative_evaluation.md), and [model configuration](../../references/model_configuration.md). Use [evaluation agents](../../references/evaluation_agents.md) only for judgment that deterministic code cannot express.

The conference replay illustrates 8 cases × 3 repeats × 2 versions = 48 offline attempts. State plainly that these are authored fixtures, not measured live-model reliability. Contract and protected-rule checks stay separate from behavioral quality.

The report must reconcile raw counts with the manifest, identify development and held-out results, name transport/parse/model failures, and include uncertainty plus diagnostic limitations when fitted. Stop for explicit approval before any paid or external step.
