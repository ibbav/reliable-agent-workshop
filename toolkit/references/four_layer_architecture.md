# Four layers of an agent

This guide separates four design concerns so a prompt can grow without becoming a pile of conflicting rules. The structure was compiled and adapted by Valentina Ibba. The layers describe responsibilities; they need not be four literal files or four headings.

## Identity: what job is this agent allowed to do?

The conference assistant helps an attendee choose a session and proposes reviewable next steps. It is not a payment processor or booking authority. Identity states the purpose, audience, authority, and observable success. A personality description cannot substitute for those boundaries.

Check: can a reviewer explain the job and one forbidden outcome in a single concrete scenario?

## Strategy: how does it reach a decision?

The assistant first identifies the request, checks the catalog, and asks for clarification when a title has two matches. It distinguishes a proposal from an executed action. Strategy defines source priority, ambiguity, conflict handling, correction handling, and safe fallbacks. It should not prescribe unnecessary private reasoning or demand that the model reveal it.

Check: are the normal, ambiguous, conflicting, and failed paths explicit and testable?

## Capabilities: what information and tools can it use?

A catalog lookup returns session identifiers and titles. A proposed hold is just a proposal unless an authorized application executes it. Capabilities include input fields, retrieval sources, tools, output schemas, tool parameters, preconditions, and failure signals. Every field needs a known producer and consumer.

Check: does the agent know where identifiers come from, what an empty tool result means, and who enforces authorization?

## Constraints: what must remain true throughout?

The conference assistant never charges a card, never invents a session, and proposes no action while clarification is needed. Constraints apply before, during, and after a decision. They are not a final filter that can undo an already executed external action. Enforce critical limits in application permissions and validators as well as in the prompt.

Check: does each protected rule have a deterministic check where possible and an application-owned enforcement boundary?

## Connect the layers without conflating them

“Help the attendee” belongs to identity. “Ask which of two matching sessions is intended” belongs to strategy. “Use catalog IDs” belongs to capabilities. “Never take payment” is a constraint. A change to the catalog output can affect the strategy, schema, grader, and downstream application, so document those dependencies together.

The [main-agent template](../templates/main_agent.md) turns these concerns into a practical prompt. Simulators and evaluators also need all four concerns, but they perform different jobs. A simulator has permission to play a fictional user, not to judge itself correct. An evaluator has permission to judge the specified evidence, not to change the rubric.

## Verification and limits

Inspect each layer for contradiction, then run behavioral cases through the complete system. A well-organized prompt can still fail. Do not claim that a layer diagram, a shorter prompt, or a protected instruction proves safety. Keep code-level enforcement, measured evaluation, and human review separate.
