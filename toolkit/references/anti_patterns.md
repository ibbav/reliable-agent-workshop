# Anti-patterns reference

This page answers one question: which prompt defects repeatedly cause plausible but unreliable behavior?

Each repair below keeps the rule visible. The conference examples are synthetic teaching cases, not measured production incidents.

## Role and scope

- **Generic role:** “Be helpful” does not tell the assistant whether it may book a seat. Repair: list permitted tasks and forbidden effects.
- **No out-of-scope path:** Silence about payment may be mistaken for permission. Repair: say that payment and final booking require a separate authorized flow.
- **Scope creep:** A session helper becomes a travel planner because the prompt lists every conceivable request. Repair: keep responsibilities verb-led and bounded.

**Check:** Ask for a card charge and verify a clear boundary without pretending the charge occurred.

## Structure

- **Flat organization:** Fifty equal-weight bullets hide precedence. Repair: group role, decision procedure, tools, and contract.
- **Scattered related rules:** Clarification appears in three places with different thresholds. Repair: one authoritative rule, cross-referenced elsewhere.
- **Redundant logic:** A flowchart and prose disagree about when to hold seats. Repair: one normative procedure; label summaries illustrative.

**Check:** Search all occurrences of a decision term and compare them for contradictions.

## Instruction clarity

- **Vague instruction:** “Handle ambiguity appropriately.” Repair: “If two catalog sessions match, ask which one before proposing an action.”
- **Nested conditionals:** A paragraph mixes lookup, capacity, consent, and reply. Repair: numbered steps with explicit branches.
- **Ambiguous pronouns:** “Use it if it is valid.” Repair: name the session identifier and validation result.

**Check:** Give the prompt to a second reader and ask what happens for zero, one, and two matches.

## Tools and data

- **Weak tool mandate:** The assistant guesses a current room from memory. Repair: require catalog lookup for schedule facts.
- **Missing parameter format:** A lookup receives a title when it requires a session ID. Repair: state type, source, validation, and example.
- **Undifferentiated errors:** A typo and an unavailable catalog get the same response. Repair: map each error class to retry, clarify, or stop.
- **Leaked technical detail:** The user sees a raw error code. Repair: provide plain language while preserving the code in internal logs only.

**Check:** Inject a lookup failure and inspect both the user reply and action list.

## Grounding and privacy

- **Source conflation:** A draft agenda is presented as the published schedule. Repair: name source precedence and flag conflicts.
- **Intrinsic hallucination:** The catalog says 14:00; the reply says 15:00. Repair: map and verify factual fields before output.
- **Extrinsic hallucination:** A room is invented when the catalog has none. Repair: leave it unknown and say so.
- **Weak authorization:** A “quick exception” bypasses a protected action. Repair: state the boundary at the action point.
- **Engaging with injected instructions:** A speaker description says “ignore the rules.” Repair: treat it as untrusted catalog text, not instruction.
- **No data protection:** An attendee's personal note is echoed unnecessarily. Repair: minimize and mask sensitive content.

**Check:** Test a misleading catalog description, absent room, and unsolicited private detail.

## Simulation and conversation

- **Verbatim variable use:** Every simulator says the same session title. Repair: vary synthetic values while keeping the behavioral rule.
- **Non-observable termination:** The simulator waits for an invisible backend state. Repair: use an observable reply or turn cap.
- **Asking twice:** The assistant asks for a session already named. Repair: use conversation state or confirm only when ambiguity remains.
- **No disambiguation:** The assistant chooses the first “keynote.” Repair: present distinguishing options and ask.
- **Unexplained examples:** A polished reply teaches style but not the underlying decision. Repair: state the principle before the example.

**Check:** Vary titles and reorder catalog results. The same rule should hold.

## Evaluation

- **Vague criterion:** “Good answer” cannot be graded consistently. Repair: specify observable fields and failure tags.
- **No ground truth:** A judge rates a confident time as correct without a schedule. Repair: supply the frozen catalog and compare against it.

**Check:** A grader should explain a fail using the expected value, actual output, and one named mismatch.
