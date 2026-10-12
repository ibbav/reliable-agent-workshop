---
name: reliable-agent-workflow/intake
description: Gather the minimum complete brief for a new or changed agent prompt.
---

# Intake

This skill answers one question: what must the agent do, and what must it never do?

Harvest answers from the user's material before asking questions. Confirm only genuine gaps:

1. Name the agent type, domain, end user, and three to seven verb-led responsibilities.
2. List tools, parameter sources, returned data, and failure behavior.
3. Describe conversation or workflow phases.
4. Define the output format and exact contract when structured output is required.
5. Record security, privacy, permission, channel, and architecture constraints.
6. Identify source material, downstream consumers, and shared contracts.

Return a brief with those headings, unresolved questions, and explicit out-of-scope items. Ask the user to confirm the brief before drafting. Do not invent tools, rules, or permissions.

## Reference route and handoff

Read [core principles](../../references/core_principles.md) for role and scope, [main agents](../../references/main_agents.md) for conversational phases, and [skills and tools](../../references/skills_and_tools.md) for tool prerequisites. If the request is for a simulator or judge, read the matching agent-type reference instead.

For the synthetic conference assistant, distinguish “show sessions,” “propose a temporary hold,” and “finalize a booking.” Only the first two belong to this public example. The brief must say who supplies the catalog, which program consumes the seven-key output, and what happens when two sessions match.

Before handing off, check that every requested responsibility is paired with an input, authorized action, and observable success condition. Mark unresolved choices as questions rather than silently filling them in.
