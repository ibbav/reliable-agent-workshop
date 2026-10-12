# Model configuration

This page answers one question: what must be fixed before a prompt comparison is interpretable?

## Pin the execution profile

Record provider, endpoint, exact model identifier, prompt version, tool schemas, structured-output mode, reasoning or effort setting, sampling parameters, output ceiling, and retry policy. These settings may differ by provider and model. Verify allowed values in current provider documentation.

For the synthetic conference assistant, a baseline tested at one effort level and a candidate tested at another is a combined prompt-and-configuration comparison, not evidence that the prompt alone improved.

**Check:** The run manifest explains every setting and both versions receive the same profile unless the configuration itself is the planned intervention.

## Choose effort empirically

Test a small declared set of settings against representative cases, including ambiguity, correction, and tool failure. Select based on quality, latency, and cost constraints, then freeze the choice before the held-out run. No universal effort level or token number is reliable across tasks.

**Check:** The selected setting has a documented reason and did not use held-out outcomes for tuning.

## Sampling and repeats

If the transport supports sampling controls, set them explicitly and record them. Repeats reveal run-to-run variability but do not create independent scenarios. Keep case grouping in the analysis rather than treating repeated attempts as new cases.

**Check:** The report says both how many distinct cases and how many total attempts were run.

## Output ceiling and truncation

The response budget must allow the contract and any provider-required reasoning/tool behavior. Truncated or unparsable outputs count as failures; do not silently repair them and call them passes.

**Check:** Force a small ceiling in a dry test and confirm the failure is recorded distinctly.

## Structured output

Use the provider's supported mode when available, but always run local schema and protected-rule checks. A schema-valid response can still contain an unsupported time or forbidden action. Conversely, a plausible reply with malformed JSON cannot be consumed safely.

**Check:** Test an extra key, unknown session ID, and forbidden final-booking action.

## Porting across providers

Re-evaluate tool syntax, JSON behavior, refusals, prompt order, and cost assumptions when switching model families. Keep the semantic contract fixed, then adjust provider-specific wrapper instructions as necessary. Report the migration as a new evaluation rather than transferring old reliability claims.

**Check:** A reviewer can separate prompt edits from transport or model edits in the run record.
