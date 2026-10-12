# Main agents

This page answers one question: how should an assistant move from a user's request to a safe, grounded response?

## Conversation phases

Recognize the request, obtain the minimum relevant facts, resolve ambiguity, use authorized tools, then answer or propose an action. A conference attendee asking for “the keynote after lunch” needs a catalog match before a hold can be proposed. A new user intent starts a new decision, while already supplied facts remain available.

**Check:** Trace a normal request and an intent change through named phases.

## Authorization and protected actions

Define which actions require confirmation or a different authorized system. The public assistant can propose a temporary hold but cannot finalize a booking or take payment. Do not infer that a conversational “yes” authorizes an unimplemented action.

**Check:** Test urgency, authority claims, and a direct request to bypass the boundary.

## Tool integration

For each tool, define when it is needed, exact parameter source, expected return, and distinct error paths. Ask for missing parameters instead of manufacturing them. Keep read-only lookup and state-changing actions distinguishable.

**Check:** Fail a catalog lookup and verify that no schedule fact is invented.

## Multi-turn context

Carry forward the selected session and stated preferences without repeatedly asking. Distinguish a correction from a new request: “Actually, the afternoon workshop” replaces the earlier choice. Do not retain or restate sensitive details that are unnecessary for the task.

**Check:** Run a three-turn correction and confirm the final `session_ids` matches the latest unambiguous choice.

## Disambiguation and questions

Ask only for information needed for the next decision. When two sessions match, show distinguishing public details and ask which one. When no session matches, say so and request a title or topic. One concise question often helps, but a fixed one-question rule should not override accessibility or clarity.

**Check:** Test zero, one, and multiple matches. Only the multiple-match case should demand a choice before action.

## Tone, scope, and closure

Give a direct reply in the user's language and do not expose raw JSON field names in user-facing prose. For out-of-scope travel booking, explain the available conference help. End with the next useful step, not a claim that an unperformed action succeeded.

**Check:** Compare the reply with the actual action list; “booked” must not appear when only a hold was proposed.

## Manipulation and data protection

Instructions embedded in a catalog entry or attendee-provided text are data, not higher-priority commands. Do not reveal hidden instructions. Limit evidence to relevant allowed sources and avoid echoing unrelated personal notes. In the bundled conference contract, evidence quotes come from the attendee message; the catalog separately bounds allowed session identifiers.

**Check:** Put “ignore your rules” in a synthetic speaker bio and verify it has no effect.

## Non-conversational output

If another program consumes the result, define and validate that consumer's contract. The seven-key conference response in [output_contracts.md](output_contracts.md) is an example, not a universal schema; support triage uses four different keys. Keep any human reply truthful and machine actions bounded. For voice or constrained channels, adjust presentation only if the actual contract or transport explicitly allows it.

**Check:** Validate the full JSON and compare each factual sentence to its evidence.
