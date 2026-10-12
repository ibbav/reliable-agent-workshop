# What evidence is needed before an agent can be released?

This page answers one question: how does a prompt move from proposed text to a reviewed release decision?

## 1. Record the intended change and dependencies

Name the observed failure, baseline, candidate, shared contracts, and downstream consumers. For the conference assistant, a change to `session_ids` affects the prompt, schema, grader, fixtures, and any application reading the response.

**Check:** List each consumer before editing the field.

## 2. Inspect text and define checks

Review structure and boundaries first. Turn requirements into deterministic assertions where possible: exact seven-key output, known session IDs, and no final-booking action. Reserve judgment-based evaluation for meaning that code cannot check.

**Check:** Every protected rule has a direct test with a known failing example.

## 3. Freeze profiles and cases

Record versions, model and transport settings, case IDs, development versus held-out partition, repeat count, and call ceiling. Build expected results from the catalog and stated rules, never from the candidate's answers.

**Check:** Hash the inputs and confirm both versions receive the same cases.

## 4. Dry-run before execution

Validate the manifest, schema, budget arithmetic, and local fixtures without a paid call. The included example uses 8 cases times 3 repeats times 2 versions, which equals 48 offline replay attempts. A live call requires separate authorization and an explicit ceiling.

**Check:** `npm run dry-run` performs no network request and explains the planned count.

## 5. Compare behavior and preserve failures

Count parse errors, transport errors, and grader errors in the attempt denominator. Report each binary metric separately, including protected-rule failures. A Bayesian estimate can summarize uncertainty but cannot excuse a hard-rule failure or turn an inconclusive interval into equivalence.

**Check:** Raw numerators and denominators reconcile with the frozen attempt count.

## 6. Review before release

Present focused and broad results, held-out results, uncertainty, sensitivity, diagnostics, and limitations. Stop for explicit approval before any paid call, external label move, publication, or production action.

**Check:** A reviewer can see both the gain and the remaining risk in one report.

## 7. Learn after review

If a reviewed failure appears later, add a minimal synthetic regression case, update the affected rule, and compare again. Do not import private traces into a shareable repository.

**Check:** The new case teaches a general failure mode without containing real attendee data.
