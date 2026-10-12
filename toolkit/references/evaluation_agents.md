# Evaluation agents

This page answers one question: when a judgment needs interpretation, how do we make it inspectable?

## Purpose and scope

Use deterministic code for exact keys, types, allowed actions, and protected rules. Use a model-based evaluator only for a quality that code cannot reasonably decide, such as whether a clarification question distinguishes two sessions in natural language. Human review remains necessary for subjective or high-stakes conclusions.

**Check:** Before writing a judge prompt, ask whether an assertion would be simpler and more reproducible.

## Three-component architecture

Specify one criterion, its frozen ground truth, and a structured judgment. A criterion is not “helpful reply”; it might be “when two keynotes match, the reply asks the attendee to choose before a hold is proposed.” Ground truth names the two catalog entries. Judgment returns pass, fail, or not applicable, plus a reason and evidence.

**Check:** Can another reviewer reproduce the verdict from those three pieces?

## Pass, fail, and not applicable

Define each outcome before testing. Pass requires observable behavior. Fail has a specific tag such as `missing_clarification` or `unsupported_schedule_claim`. Not applicable applies only when the scenario genuinely lacks the condition. Do not silently exclude difficult cases or model failures from run accounting.

**Check:** Give one clear example of each outcome and one borderline example.

## Ground truth and evidence

Ground truth may be a direct catalog field, a derived schedule conflict, or a required action order. The judgment quotes the relevant source and response, then states the comparison. For a conflict, show the two session intervals and whether they overlap; do not say only “the schedule conflicts.”

**Check:** Every fail identifies expected evidence, observed evidence, and the mismatch.

## Independent dimensions

Grade contract validity, factual accuracy, protected actions, and conversational quality separately. A warm answer can still contain a wrong time. A valid JSON object can still propose a forbidden booking. Do not average a critical failure into a vague total score.

**Check:** Could one dimension pass while another fails? If not, they may be bundled.

## Calibration

Create a small set of human-reviewed examples with clear passes, clear failures, and borderline cases. Compare judge verdicts with human decisions, inspect disagreements, and revise the criterion rather than changing ground truth to flatter the candidate. Report calibration counts and uncertainty; no universal agreement threshold fits every task.

**Check:** Re-run the calibration cases after editing the judge prompt.

## Feedback loop

Aggregate specific failure tags, revise only the implicated instruction, then replay the same development cases and untouched held-out cases. Keep model/API failures in denominators, and report any unresolved ambiguity in the evaluator itself.

**Check:** A reader can distinguish assistant failures, evaluator mistakes, and transport failures.
