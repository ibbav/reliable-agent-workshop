# Output formats and contracts

This page answers one question: how do we make an agent's response safe for another program to consume?

## Specify the complete contract

The synthetic conference assistant returns exactly `intent`, `session_ids`, `needs_clarification`, `clarification_question`, `proposed_actions`, `reply`, and `evidence`. These keys are one example, not a requirement for every agent. Define each project's field types and conditions in the application schema, then repeat the critical constraints in the prompt. An example is not a schema.

For example, when “the keynote” matches two sessions, `needs_clarification` is true, `clarification_question` names the choice, and `proposed_actions` is empty. The assistant must not invent a booking while asking which keynote the attendee means.

**Check:** Validate every key, type, conditional field, and allowed action with code.

## Conditional fields

Write the condition explicitly. If `needs_clarification` is false, `clarification_question` is null. If true, it contains a question the attendee can answer. If no session was identified, `session_ids` is empty rather than a guessed identifier.

**Check:** Test both sides of every condition and a contradictory combination.

## Uniform field shapes

An array should not alternate between strings and objects. If `proposed_actions` contains objects, each action has the same core keys and a bounded action kind. Represent “not known” with the declared null or empty value, not an invented placeholder.

**Check:** Run a case with zero, one, and multiple actions against the same validator.

## Evidence and source anchors

Evidence ties a claim to an allowed source. In the bundled conference contract, each `quote` must appear verbatim in the attendee message. The catalog separately verifies whether a session ID exists. A different application may need source IDs and catalog field anchors; define that contract explicitly instead of assuming the conference shape proves every reply fact. Evidence is not a license to leak private notes or quote unrelated content. If sources conflict, preserve the conflict and ask for clarification or decline to assert the fact.

**Check:** For every claimed time, room, or availability, can a reviewer find a matching public source field?

## Failure output

Define a valid response for missing data and tool failure. A session lookup error still produces schema-valid JSON, an honest reply, no fabricated `session_ids`, and no action that assumes availability.

**Check:** Simulate the tool failing and confirm both contract validity and truthful content.

## Provider portability

Prefer a provider-supported structured-output mode when available, but still validate locally. Some transports may return a refusal, truncation, or unparsable text; count those as failures instead of repairing them silently after the fact.

**Check:** Record parsing and validation failures separately from model behavior failures.
