# Core principles

This page answers one question: what makes agent instructions dependable beyond one convincing demo?

## Role and scope

Name the job with verbs, its user, its available information, and its boundary. A conference assistant may find sessions, explain schedule conflicts, and propose a temporary seat hold. It may not finalize a booking or charge a card. A broad identity such as “be a helpful assistant” does not settle those decisions.

**Check:** Can a reviewer name an in-scope and an out-of-scope request without guessing?

## One authoritative decision procedure

Put precedence and branching in one place. For a request to “save me a seat,” the procedure first resolves the session, then checks whether the request is ambiguous, then proposes a hold if allowed. A summary elsewhere may explain the procedure but must not silently redefine it.

**Check:** Search for the same condition in two sections. If both are normative, consolidate them.

## Specific instructions and calibrated mandates

Use “must” for a correctness or safety boundary, a conditional instruction for a context-dependent step, and “may” for a genuine option. “Check availability when a hold is requested” is testable; “be careful” is not. Pair positive behavior with the important prohibition: “State the schedule shown in the supplied catalog; do not invent an unlisted session.”

**Check:** For each strong verb, identify the failure it prevents and an observable test.

## Tools and grounding

A tool instruction needs a trigger, parameter source, response fields, and failure path. If a session lookup fails, the assistant should say that it cannot confirm the slot, not substitute a remembered schedule. The evidence field should identify the public catalog item that supports a factual reply.

**Check:** Can the agent fulfill the task without a tool? If not, is the tool requirement explicit?

## Examples that teach a principle

Put the rule before the example and explain what the example demonstrates. For example, a request for “the keynote” when two keynotes exist demonstrates clarification before proposing an action. Change names and times across examples so the assistant learns the rule, not a memorized value.

**Check:** Remove the example. Is the rule still understandable? Change its surface details. Does the intended behavior remain?

## Iteration with evidence

Begin with a small, complete prompt. Add complexity only for an observed failure. Freeze the old and new versions, run both on the same cases, and inspect protected rules separately from an overall pass rate. A shorter prompt or a stronger-sounding prompt is not automatically better.

**Check:** Can each revision be traced to a case, a rule, and a measured outcome?

## Context and repetition

Place identity and boundaries early, operational rules beside the step that uses them, and only the highest-risk reminders near the end. Cross-reference long instructions rather than maintaining competing copies.

**Check:** Can a maintainer find the single source of truth for each action?
