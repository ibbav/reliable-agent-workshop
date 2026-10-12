# Quality checklist

This page answers one question: is a prompt ready for behavioral testing, and what remains unproven?

Inspect all seven gates. Record pass, warning, or fail with the exact location and a specific repair. Passing inspection does not prove that the agent behaves reliably.

## Gate 1: structure

Role, source authority, ordered decisions, tools, contract, boundaries, and examples are easy to locate. No two sections claim to be the source of truth for the same decision.

**Check:** Find the conference assistant's clarification rule and booking boundary without reading the entire prompt.

## Gate 2: language

Instructions name observable behavior and use mandate strength appropriate to the risk. Terms such as “session match” and “temporary hold” have unambiguous meanings.

**Check:** Replace “be helpful” with the exact action expected for two matching keynotes.

## Gate 3: completeness

Normal, missing, ambiguous, conflicting, tool-failure, correction, out-of-scope, and protected-action paths have outcomes. Simulation prompts also have observable endings; evaluator prompts have frozen ground truth and pass/fail/not-applicable rules.

**Check:** Walk each branch to an output or a clear stop.

## Gate 4: context efficiency

Repeated rules are intentional and risk-based, not competing copies. Examples cover different failure modes. Removing text must not erase a boundary or an error path.

**Check:** Compare tokens before and after a proposed simplification, then evaluate behavior.

## Gate 5: anti-patterns

Check for generic role, vague criteria, hidden dependencies, guessed tool parameters, unsupported facts, and missing disambiguation. Use [anti_patterns.md](anti_patterns.md) for the repair patterns.

**Check:** Turn each identified defect into a case that can fail.

## Gate 6: format and provider fit

The output schema is explicit and locally validated. Tool definitions agree with the actual transport. Model-specific settings are verified against the selected provider's current documentation, not inherited from another model.

**Check:** Run a parse failure, a truncated response, and an extra-key response through the validator.

## Gate 7: evaluation readiness

The baseline, candidate, case set, graders, protected rules, model settings, repeat count, and call ceiling can be frozen before execution. Separate development and held-out evidence. A structural pass is permission to test, not to publish.

**Check:** Can a colleague reproduce the planned comparison without asking which files or settings were used?
