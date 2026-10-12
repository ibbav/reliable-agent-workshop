---
name: reliable-agent-workflow
description: Build or improve an agent prompt through intake, draft, refine, simplify, validate, and evaluation.
---

# Reliable agent workflow

This workflow answers one question: what evidence is needed before a prompt change is trusted?

The method and structure were compiled and adapted by Valentina Ibba from her prompting techniques. This public edition teaches the reusable principles with synthetic conference examples; it contains no private agents or cases.

Use the six skills in order when creating an agent. For a focused change, begin at the earliest affected step.

1. `intake` confirms the task, boundaries, tools, output, and risks.
2. `draft` turns the brief into a testable prompt and contract.
3. `refine` makes approved, traceable changes.
4. `simplify` removes unnecessary context without removing safeguards.
5. `validate` inspects structure, clarity, completeness, and risk controls.
6. `eval` compares frozen versions on independent cases and reports uncertainty.

Keep inspection, behavioral evidence, and release approval separate. No skill authorizes a paid call, external action, or publication.

## Route to the needed reference

- Start with [core principles](references/core_principles.md) and [prompt structure](references/prompt_structure.md) when designing a new prompt.
- Use [main agents](references/main_agents.md), [simulation agents](references/simulation_agents.md), or [evaluation agents](references/evaluation_agents.md) for the relevant agent type.
- Use [skills and tools](references/skills_and_tools.md) and [output contracts](references/output_contracts.md) when a tool or downstream consumer is involved.
- Use [anti-patterns](references/anti_patterns.md) and the [quality checklist](references/quality_checklist.md) for inspection.
- Use the [regular process](references/regular_agent_process.md), [comparative evaluation](references/comparative_evaluation.md), and [model configuration](references/model_configuration.md) before interpreting behavioral evidence.
- If deploying on Claude, review [Anthropic best practices](references/anthropic_best_practices.md) and verify current provider documentation for the selected model.

Load only the references needed for the current decision. Their examples explain a rule; the actual JSON contract, tools, and limits must come from the project being worked on.
