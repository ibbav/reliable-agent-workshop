# Prompt structure

This page answers one question: where should each instruction live so people and models can find it?

## Standard section order

Use a predictable skeleton: role and scope; input and source authority; decision procedure; tools; output contract; constraints and failure handling; examples; short reminders. Omit sections that are irrelevant, but do not hide a required rule in an example.

For a conference assistant, place “do not finalize bookings” in constraints and repeat it beside the proposed-action step only if that boundary is at risk there.

**Check:** Can a reviewer locate the action boundary and output contract in under a minute?

## Three-level hierarchy

Use major sections for concerns, subsections for phases, and short numbered steps for decisions. A flat list of fifty instructions makes precedence invisible. Deep nesting makes conditions hard to follow.

Example: `# Decision procedure`, `## Resolve the session`, then `1. Match the requested title; 2. If two sessions match, ask which one; 3. Otherwise continue.`

**Check:** Read only headings. Do they describe the complete workflow without pretending to be a second workflow?

## Information placement and long context

Keep authoritative catalog data distinct from user text and tool output. Delimit quoted material and label its source. Do not let a speaker bio or attendee note instruct the assistant to ignore the booking boundary. For long catalogs, retrieve or attach only the relevant schedule entries and keep their identifiers.

**Check:** If a catalog description contains an imperative sentence, is it treated as data rather than instruction?

## Formatting conventions

Use exact names for JSON fields and tools. Mark examples as examples. Keep lists parallel and tables for compact mappings, not hidden reasoning. XML or other delimiters can clarify boundaries when the surrounding system supports them; delimiter syntax alone is not a security control.

**Check:** Could two maintainers independently write the same field names and action names from this prompt?

## Progressive disclosure

The entrypoint states when to load a specialized procedure. The detailed procedure contains its own prerequisites, branches, and output. The main prompt should not embed every edge case for every skill. Load the session-disambiguation procedure only when multiple catalog matches exist.

**Check:** Does the agent know when to open the detail without carrying all details in every turn?

## Output format and contracts

State the public seven-key JSON contract where output is produced. Specify required types, nullability, allowed actions, and how uncertainty is represented. A formatting example illustrates the contract; it does not replace the schema.

**Check:** Can a deterministic validator reject an extra key, a made-up session ID, or a final booking action?

## One source of truth for decisions

Give the ordered procedure precedence over non-normative summaries. Each branch must end in a next action or a terminal outcome. A clarification branch should stop before proposing a seat hold.

**Check:** Trace every possible branch to a defined outcome, including missing, conflicting, and failed lookup data.
