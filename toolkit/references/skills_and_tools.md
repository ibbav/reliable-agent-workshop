# Skills and tools

This page answers one question: when should an agent load a procedure, and when should it call a function?

## Skill versus tool

A tool performs an operation with defined inputs and outputs. A skill tells the agent when and how to use tools, including prerequisites and error paths. A conference `lookup_session` tool retrieves catalog entries; a session-selection skill resolves ambiguous names and decides when clarification is needed.

**Check:** Can you identify the callable operation separately from the decision about calling it?

## Skill anatomy

Give each skill a purpose, trigger, prerequisites, ordered steps, output, constraints, and named tools. State what is excluded. A seat-hold proposal skill does not become a payment skill merely because a user asks urgently.

**Check:** Test one situation where the skill must trigger and one where it must not.

## Tool definition

Document the tool's input type, format, source, validation, returned fields, and error codes. For `lookup_session(session_id)`, the ID comes from the catalog match, not from a guessed title. State what a missing ID or unavailable catalog means.

**Check:** Can a developer implement the call and its error branch without inventing a parameter rule?

## Mandate levels

Use a mandatory instruction when correctness or safety depends on the tool, a conditional instruction when the need depends on the user request, and optional language only for convenience. “Use the catalog for a current room” is mandatory if the reply asserts a room. A general explanation of how to find a session may need no call.

**Check:** For every MUST, name the protected outcome. For every MAY, confirm skipping it is safe.

## Error handling and translation

Differentiate no match, multiple matches, temporary failure, and denied permission. Translate technical codes into a plain-language reply, but preserve the code in evaluation evidence. Never present a proposed hold as a confirmed booking.

**Check:** Each error type has a distinct next step and a truthful user response.

## Multi-tool workflows

Call dependent tools in order: resolve session, then check availability, then propose a permitted action. Independent lookups may run in parallel if the runtime supports it, but never guess a dependent parameter to save a call.

**Check:** Draw the dependency for each tool input; no edge may point from an unavailable result.

## Composition and data flow

Split a skill when triggers, owners, or output contracts differ. Keep the main entrypoint short and route to focused detail. State which downstream component consumes each output and check that a renamed field is updated there too.

**Check:** Change a field in a test branch and list all consumers that would break.
