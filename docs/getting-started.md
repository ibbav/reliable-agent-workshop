# Make this workshop yours

This guide answers one question: how do you turn these examples into a working setup for your own task?

Explore first, then adapt. The conference assistant and support triage show the method; they are not the only tasks the framework supports. Your goal is to leave with your own task definition, prompts, cases, checks, and an honest account of what has and has not been tested. You can work manually or ask Claude or another coding assistant to guide you.

## Explore the examples

Open a terminal in the repository folder containing `package.json`. Use Node.js 20 or later and Python 3. The default examples need no API key or Node package installation.

```bash
npm test
npm run demo
npm run demo:triage
npm run dry-run
```

Read the [toolkit guide](../toolkit/guide.md) and compare the two example folders. Notice that their input and output formats differ, while they use the same evaluation runner. A grader is code that checks an output against your rules. A transport supplies the output, either from an authored offline example or a model call.

The conference replay has eight cases × three repeats × two versions = 48 authored attempts. Its repeated outputs are invented teaching material, not fresh model responses. A dry-run validates the setup and records the planned budget without making model attempts. Reports go to a new temporary folder; save evidence you want to keep separately.

If a command fails, resolve the reported error before adapting the project. Do not ask an assistant to bypass a failed test just to make the setup look complete.

## Start your own working copy

Keep a clean copy of this workshop and make a separate working copy for your project. Start with synthetic or explicitly public material, as required by the [data policy](../DATA_POLICY.md). Do not upload customer messages, credentials, confidential prompts, or traces to a chat just to get help with setup.

If your organization later approves a real-data evaluation, use a separately controlled private project and review the provider's data handling first. The runner uses project-relative case files, so protect that entire working project, not just its results folder. Do not distribute the private working copy as the original public workshop. Automated scans cannot enforce your organization's data permissions.

Choose one bounded task. For example: “Read a fictional library question, identify the department that should answer it, and ask for clarification when the request is unclear. Never change a member's account.” This is a starting scenario, not another required domain.

Write down who uses the answer, what information the agent receives, what it should return, what it may propose, and what it must never do. Identify the person or application that approves an action. Use the [intake skill](../toolkit/skills/intake/SKILL.md) and [architecture guide](../toolkit/references/four_layer_architecture.md) to check the brief before drafting.

## Ask Claude to guide you

If your assistant has permission to read local files, open your working copy with it and paste the prompt below. Check which folder it can access. If it cannot read files or run commands, supply only the relevant public documents and run the commands yourself; ask it to distinguish suggested steps from observed results. Ordinary chat is still useful for planning, but it must not claim to have inspected files you have not supplied.

```text
Help me make this Reliable Agent Workshop my own.

First explore the repository if you have file access. Read README.md,
docs/getting-started.md, and toolkit/guide.md. Use toolkit/SKILL.md to
find the references needed for my task. Tell me what you actually read
and what you cannot inspect or run. Do not edit anything yet.

Explain how the examples work, then ask me one question at a time about
my task, users, inputs, expected output, allowed actions, forbidden
actions, and success criteria. Do not assume I need conference fields.

Help me write a short brief. Propose the exact files and changes and
wait for my approval. Work only in my approved project folder. Preserve
the examples and a baseline. Reuse the runner rather than rewriting it.
Use the workflow: intake, draft, refine, simplify, validate, and evaluate.

Start with synthetic cases and independent expected answers. Help me
adapt the agent input, output contract, graders, fixtures, and evaluation
specification. Keep expected answers out of model inputs. Test the
graders with both correct and deliberately wrong outputs.

Run or explain tests, offline replay, and dry-run first. Separate planned
calls, authored attempts, and real model calls. Keep failures in totals.
Do not invent passing results or fit model-performance estimates to the
offline fixtures. Keep credentials and run evidence out of shared files.

Stop before any live evaluation, external data transfer, publication,
or deployment. Explain the data sent, model connection, call ceiling,
estimated cost, and unresolved risks; ask for explicit approval. If I
approve a live comparison, follow docs/bayesian.md for each binary
metric and report both the main and sensitivity diagnostics.

Finish with a plain-language wrap-up: what changed, what ran, baseline
and candidate results, protected-rule failures, uncertainty, remaining
limitations, evidence locations, and the decision I need to make.
```

You can paste the same brief and instructions into another assistant. This prompt is guidance, not a security boundary. Review proposed edits and executable plugins yourself. Giving an assistant permission to help edit files does not approve model evaluation calls or automatically connect the evaluator to that assistant's model provider.

## Replace the scenario, not the framework

In your working copy, create a new example folder and agent/grader plugins using the [extension guide](extending.md). Keep the bundled examples intact so you can compare your setup with a known example.

Your project needs baseline and candidate prompts, cases with independent expected outcomes, an output contract, authored offline outputs, and an `evaluation.json` specification. Adapt the agent plugin that prepares input and the grader plugin that checks results. Change all scenario-specific fields together; do not just swap the text while keeping conference-only checks.

Include clear requests, ambiguous requests, missing information, misleading instructions inside input, and forbidden actions. Define correctness and protected rules separately. Write expected outcomes before looking at candidate responses. Reserve fresh cases for final review; a public workshop's visible held-out cases are not an unseen test set for your project.

Check the grader against a correct output, a near miss, invalid output, and a forbidden action. It should fail for the right reasons. A generated plugin stub is deliberately unfinished and must be implemented and tested before use.

## Verify your setup offline

After you have created `examples/your-agent/evaluation.json` and its referenced files, run the following from your working repository root. Replace `your-agent` with your actual folder name; it is not supplied by this workshop.

```bash
npm test
node evaluation/run.mjs --spec examples/your-agent/evaluation.json
node evaluation/replay.mjs --spec examples/your-agent/evaluation.json
npm run audit
```

The dry-run checks declared coverage and records the planned attempts. Replay checks the machinery using your authored outputs. Neither shows how well a live model performs. Inspect the new reports and confirm the selected prompts, cases, plugins, splits, checks, and budget match your brief. Custom tests must also cover your own agent and grading rules; passing the bundled suite alone is not enough.

The audit requires the PDF parser `pypdf`; if missing, install the document-inspection dependencies described in the [sharing checklist](sharing-review.md) in an external environment and rerun. Do not skip a failed audit. Keep dependencies, caches, and reports out of the folder you intend to distribute. Read changed content and inspect any new documents as well as running the scan.

## Decide whether to make live calls

Using Claude for setup does not make the evaluator a Claude API client. The bundled live transport sends a JSON chat-completions request; a provider using another request format needs an appropriate reviewed transport plugin. Choose and verify the model connection independently. See the [extension guide](extending.md) and [evaluation runner](../evaluation/README.md).

Before approving execution, review the provider, endpoint, data sent, model settings, credentials handling, and cost estimate. For example, eight cases × three repeats × two prompt versions = a planned ceiling of 48 model calls, not a price quote. The price depends on the selected provider and input/output size. Do not copy this budget without checking your own case count.

Freeze the comparison before execution. Require explicit approval for the live run and keep keys in the runtime environment, not in prompts, case files, or chat. A successful test does not approve publication or deployment.

For approved live results, follow the [Bayesian guide](bayesian.md). Analyze each binary metric separately, retain failed attempts, and check both the main and doubled-prior fits. The optional `bayes:demo` uses invented data only. A passing diagnostic does not prove that your grading rules or statistical assumptions are appropriate.

## Leave with a useful wrap-up

Ask your assistant to summarize the task you built, files changed, commands actually run, and evidence locations. Report baseline and candidate totals, development and held-out results, model/transport/grading failures, and protected-rule checks. For an approved Bayesian comparison, include the estimated change, credible interval, probability of improvement, prior sensitivity, diagnostics, and limitations. Say explicitly when there was no live run or a result was inconclusive.

Finish by deciding what still needs work and what a human must approve next. Your deliverable is a reusable setup for your task with an honest verification record, not a promise that any prompt or dataset will work automatically.
