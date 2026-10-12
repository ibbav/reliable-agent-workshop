---
name: reliable-agent-workflow/draft
description: Produce a first testable prompt from a confirmed brief and a matching template.
---

# Draft

This skill answers one question: how do we turn the approved brief into instructions that can be tested?

1. Select the main-agent, simulation-agent, or evaluation-agent template.
2. Fill role, purpose, context, instructions, tools, constraints, boundaries, and output contract.
3. Define every tool's parameters, parameter sources, return shape, and failure path.
4. Put fixed rules in one decision procedure instead of scattering copies.
5. State what happens when information is missing, ambiguous, conflicting, or outside scope.
6. Reinforce only the two or three highest-risk rules at the end.
7. Record open questions as visible TODO items.

Use strong mandate language only for genuine safety or correctness requirements. Present the draft, metrics, TODO items, and missing evidence. A draft is not a behavioral pass.

## Reference route and handoff

Read [prompt structure](../../references/prompt_structure.md), [output contracts](../../references/output_contracts.md), and the matching [main](../../references/main_agents.md), [simulation](../../references/simulation_agents.md), or [evaluation](../../references/evaluation_agents.md) agent reference. Consult [skills and tools](../../references/skills_and_tools.md) only when the brief includes callable operations.

In the conference example, a two-match request should lead to a clarification question and no proposed hold. Put that behavior in the decision procedure and test it as a branch; do not rely on a polished example reply to carry the rule.

The draft handoff names the template used, all assumptions, the output validator, and at least one case for each high-risk branch. Keep an unapproved assumption visible as a TODO.
