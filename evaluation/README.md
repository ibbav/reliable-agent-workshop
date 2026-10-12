# Evaluation runner

This folder answers one question: how do we compare two prompt versions without hiding failures?

`run.mjs` creates a dry-run manifest and makes no calls. `replay.mjs` grades authored fixtures offline. `live.mjs` is optional and refuses to run without explicit execution, endpoint, model, key environment variable, and call ceiling.

Agent, grader, transport, and reporter plugins are discovered from versioned local manifests. Start with [make this workshop yours](../docs/getting-started.md) for your first adaptation, then read the [extension guide](../docs/extending.md) for registration, scaffolding, compatibility, and the trusted-code boundary. Default reports are written outside the repository to a fresh temporary directory; explicit output directories must be empty. Keep explicit run evidence outside the folder you will share. The runner reports raw totals, split totals, matched-pair outcomes, transport failures, grading failures, and protected-rule status. None is release approval.

The replay verifies the 48-attempt grading workflow. Its outputs are fixed by the author, so the export step rejects them: repeating a fixture does not create independent model observations. After an explicitly approved live-model run, export one binary metric and fit it separately:

```bash
node evaluation/export_observations.mjs --attempts ../evidence/live/attempts.json --output ../evidence/behavior-observations.json --metric behavior
npm run bayes -- --input ../evidence/behavior-observations.json --output ../evidence/behavior-posterior.json
```

Install the separate pinned environment first, following the [Bayesian guide](../docs/bayesian.md). The model uses scenario-level partial pooling. Interpret it only when both the primary and doubled-prior fits pass the documented diagnostics. Model-call and grading failures remain failed observations in the denominator and are reported separately in `summary.json`. The slide 6 probability is a separate, labeled teaching calculation using invented counts, not a posterior fitted to this replay.

Observations must include a positive `repeat_id` and exactly matching scenario/repeat pairs for `a` and `b`. Duplicates, unmatched repeats, and mixed metrics are rejected. Undefined diagnostic values fail diagnostic checks. Export and fit outputs refuse to overwrite existing evidence. No Bayesian fitting of the authored replay is performed or claimed.
