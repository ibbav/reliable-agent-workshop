# Reviewed learning cycle

This example answers one question: how should a failure change the next prompt version?

The generator produces an answer. A reflector proposes one narrow lesson from the output and the grader evidence. A curator turns that lesson into a small, traceable context change. A person reviews the proposal before any prompt changes. Held-out cases then test whether the change helps beyond the case that motivated it.

Never let the system rewrite its own active instructions or approve its own release. A plausible lesson is still a hypothesis.
