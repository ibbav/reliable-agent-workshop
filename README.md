# Reliable Agent Workshop

This repository answers one question: how can you build and test an agent for your own work before trusting it with real tasks?

This workshop is yours to adapt. Explore the conference assistant and support-triage examples to understand the method, then use the toolkit and evaluation framework for your own task. You do not need to build a conference assistant or keep its fields, rules, or examples. Keep the process; replace the scenario.

The reusable prompting method and structure were compiled and adapted by Valentina Ibba. The public edition uses synthetic cases and does not reproduce private agents, data, or operational history.

It provides a reusable local plugin framework, two synthetic agents, a repeatable prompt workflow, deterministic checks, offline replay, and paired Bayesian analysis for approved live observations. The included replays are authored teaching evidence, not live-model performance.

## Start here

Begin with the [guided setup: make this workshop yours](docs/getting-started.md). It takes you from exploring the examples to defining your own agent, writing cases and checks, running an offline comparison, and deciding whether to try an approved live evaluation. It includes a starter prompt you can use with Claude or another coding assistant. You can also follow it manually.

Requirements: Node.js 20 or later and Python 3 for the complete test suite and audit. PDF inspection also needs `pypdf` from `talk/requirements.txt`. Optional Bayesian fitting uses a separate, pinned Python environment. Default examples need no API key or Node packages.

```bash
npm test
npm run demo
npm run dry-run
npm run audit
npm run demo:triage
npm run plugins
```

The demo performs `8 cases × 3 repeats × 2 prompt versions = 48` offline attempts. It makes zero network calls. The candidate result is `21 behavior passes ÷ 24 candidate attempts = 87.5%`, while its public contract passes `24 ÷ 24 = 100%`. These are fixture results, not a reliability estimate.

After exploring, make a separate working copy for your own project. Start with synthetic cases, keep a baseline, and write down what a good answer looks like before changing the prompt. Follow the guided setup to replace the example's inputs, output contract, grading rules, and model connection. Adding your data alone does not adapt those rules. Keep the clean workshop separate from any confidential project or run evidence.

## What is included

- `examples/conference-assistant/`: a public seven-key JSON contract, two prompt versions, four development cases, four held-out cases, and offline outputs.
- `examples/support-triage/`: a different four-field contract and grader, using the same runner.
- `plugins/`: discoverable, versioned local agents, graders, transports, and reporters.
- `evaluation/`: frozen run manifests, deterministic grading, offline replay, an optional live transport, and Bayesian analysis.
- `toolkit/`: six reusable workflow skills, thirteen principle references plus architecture and glossary, and full prompt, simulator, and evaluator templates.
- `talk/output/`: the English slide deck and printable speaker script.
- `docs/`: the method, evidence limits, data rules, and sources.

Read the [toolkit guide](toolkit/guide.md) to apply the method and [extension guide](docs/extending.md) to add your own agent or plugin. Demo and dry-run reports go to a new temporary directory whose path is printed; they do not fill the folder you plan to share. Preserve important evidence separately.

For the tested Bayesian software demo, run `npm run bayes:setup -- --python python3.11`, then `npm run bayes:demo`. Setup downloads optional packages outside this folder; the demo uses invented data and makes no model calls. Follow the [Bayesian guide](docs/bayesian.md) for approved live comparisons, diagnostic gates, and limitations.

## Safety boundary

In the conference example, the assistant may propose a temporary seat hold, a booking lookup, or a reply. It cannot finalize a booking, charge a card, or infer and store an accessibility need. For your own agent, define the equivalent allowed actions, forbidden actions, and approval requirements, then check them separately from correctness. Proposed actions remain subject to human or application review.

The public audit checks generic path, ticket, credential, address, and document-metadata patterns, including embedded Office workbooks. It cannot prove that prose or images contain no organization-specific detail. Follow the [sharing review](docs/sharing-review.md) on the exact folder before publication.

No live model call is made by any default command. A live run requires a separate `--execute` flag, an explicit endpoint and model, a shell-provided key, and a declared call ceiling. Review cost and data handling before using it.

Plugins run trusted local JavaScript; the framework is not a sandbox. There is no remote or publication step. It supports extension across domains, but it is not a hosted production platform.

See the [verification record](docs/verification.md) for full baseline/candidate counts, split results, checks run, and remaining evidence limits.
