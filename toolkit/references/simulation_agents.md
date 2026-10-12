# Simulation agents

This page answers one question: how do we create realistic, repeatable conversations that challenge an assistant?

## Purpose and architecture

A simulator plays the user; it does not grade the assistant or change the expected answer. Keep its persona, scenario facts, permitted disclosures, and stopping rules separate. In a conference case, the simulator might be an attendee seeking one of two similarly named keynotes.

**Check:** Can the same scenario be replayed with a different title without rewriting the simulator's core instructions?

## Persona and scenario

Give the simulated attendee a concise goal, conversational style, and facts they know. Use synthetic names and sessions only. Put the ground-truth catalog outside the user persona so the simulator cannot “help” the assistant by reciting hidden expected values.

**Check:** Is every detail the simulated user reveals something a real attendee could know?

## Gradual disclosure

The opening message should sound natural. Reveal a missing session detail after a clarification question, not all at once. If the assistant asks a sensible question, answer from the scenario. If it asks for an irrelevant private detail, resist naturally.

**Check:** Does the simulator respond to the assistant's actual question rather than following a fixed transcript?

## Conversation dynamics

Allow corrections and pivots: “I meant the afternoon session,” or “Before that, is the workshop full?” The simulator should not claim tool results, override the assistant's instructions, or invent a different catalog. Keep pressure cases separate from ordinary cases so coverage is visible.

**Check:** A correction should change the user's expressed intent without changing frozen ground truth.

## Observable termination

End when the assistant gives a final answer that addresses the stated goal, refuses the out-of-scope request, or the configured turn cap is reached. Record why the simulation ended. Do not wait for an internal state that the simulator cannot observe.

**Check:** Each scenario has a maximum turn count and a visible completion signal.

## Edge cases and variation

Cover missing title, two matches, schedule conflict, denied permission, tool failure, and an injected instruction in source text. Vary wording, titles, and order of choices without changing the rule under test. Separate development cases from held-out cases.

**Check:** Count which rule each scenario exercises; do not call many near-duplicates broad coverage.

## Scoring hooks

Record the user's intended outcome, the catalog facts, and observable checkpoints such as “clarification asked before hold.” The evaluator, not the simulator, judges whether those checkpoints passed.

**Check:** Can a grader decide the result from the transcript, outputs, and frozen catalog alone?
