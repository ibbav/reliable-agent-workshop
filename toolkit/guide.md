# Using the prompt toolkit

This guide explains how to build a bounded agent, test it, and share the reusable method without sharing private work. The principles and structure were compiled and adapted by Valentina Ibba. They are not a guarantee of model reliability.

New to the repository? Start with [make this workshop yours](../docs/getting-started.md) for a guided setup and an optional Claude starter prompt. Use the examples to learn the process, then adapt the inputs, contract, cases, and checks to your own task.

## Start with a concrete task

Imagine an attendee asks, “Please register me for Reliable Agents.” Two synthetic sessions have that title. The useful behavior is to ask which session is intended, not to choose one or take payment. Write that expectation before drafting the prompt.

Use the six workflow skills under `skills/`: intake, draft, refine, simplify, validate, and eval. The [workflow entry point](SKILL.md) routes to the thirteen detailed principle references. Use only the references needed for the current decision; loading everything is not automatically better.

The [architecture guide](references/four_layer_architecture.md) explains four concerns that every agent needs: identity, strategy, capabilities, and constraints. The [glossary](references/glossary.md) defines the shared terms. These are design aids, not mandatory headings for every prompt.

## Choose the right template

- A [main agent](templates/main_agent.md) performs the bounded task and owns a clear output contract.
- A [simulation agent](templates/simulation_agent.md) plays a synthetic user under a frozen scenario. Its hidden control state must not reach the tested agent.
- An [evaluation agent](templates/evaluation_agent.md) judges one concern against independent evidence. Exact checks belong in deterministic code when possible.

The simulator and evaluator are not interchangeable. A simulator may withhold a known booking preference until asked; the evaluator checks whether the clarification happened. Neither should rewrite the expected answer to agree with the candidate.

## Follow the learning cycle

1. Intake records the goal, input sources, output consumer, allowed tools, protected boundaries, and safe failure behavior.
2. Draft creates the prompt and contract together. Confirm exact field names, enums, nullability, units, and application-owned enforcement.
3. Refine changes a named behavior and records the reason. Preserve a baseline. List affected consumers and mirrors; record any intentionally lagging counterpart.
4. Simplify removes repetition and irrelevant context. Keep evidence rules, ambiguity handling, and safety boundaries intact.
5. Validate inspects the wording and checks the schema and tool contracts. Inspection is not behavioral evidence.
6. Evaluate freezes the comparison, runs both versions on the same cases, retains failures, and reports uncertainty. Human approval is a separate step.

## Run a real reusable framework

The runner in `evaluation/` does not hardcode conference fields. An agent plugin prepares input, grader plugins declare and check metrics, a transport plugin supplies outputs, and reporter plugins write evidence. Read [how to extend the framework](../docs/extending.md) for manifests, versioning, discovery, and scaffolding.

The conference example plans eight cases × three repeats × two versions = 48 attempts. Each version has eight cases × three repeats = 24 attempts. Its authored candidate behavior result is 21 passes divided by 24 attempts = 87.5%. That is a fixture count, not measured model reliability. The support-triage example uses a different contract and grader through the same runner.

Default commands stay offline. Dry-run validates the chosen setup and records the budget but makes no attempts. Replay tests the mechanics using authored outputs. A live run sends data to a chosen model and may incur cost; it requires explicit execution approval, a call ceiling, and a separate review of provider data handling.

## Decide what the evidence supports

Report contract compliance, behavioral correctness, grounding, and protected checks separately. Show development and held-out counts as well as the broad total. Include transport and grading failures in denominators. Do not choose whichever metric makes the change look best.

The included public held-out split is visible to everyone. It teaches the process; it is not a secret test set. Once a held-out case guides another edit, treat it as development evidence and reserve fresh unseen cases for final review.

For approved live-model comparisons, fit each binary metric separately with the paired Bayesian tool. A Bayesian model expresses uncertainty under stated assumptions; it is not automatic release authorization. Check both the primary fit and doubled-prior sensitivity diagnostics. A favorable estimate never cancels a failed protected rule. See [evaluation limits](../docs/evaluation.md).

## Share the method safely

Create public examples from scratch using synthetic records. Replacing a name in a real trace is not sufficient sanitization: wording, dates, identifiers, paths, and unusual combinations can still identify it.

Keep keys, provider responses, traces, and private evaluation output outside the folder being shared. Review every added plugin as executable code. Run the automated audit, then inspect prose, images, notes, embedded files, and metadata. The audit catches generic patterns; it cannot certify that every sentence is public. See [data policy](../DATA_POLICY.md) and [sharing review](../docs/sharing-review.md).
