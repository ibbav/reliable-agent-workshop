# The method

This page answers one question: how does organized challenge improve an agent?

Start with a written contract, then separate four kinds of evidence:

1. Inspection asks whether the instructions are clear, bounded, and internally consistent.
2. Deterministic checks ask whether fixed requirements were met, such as exact keys or forbidden actions.
3. Behavioral cases ask whether the same inputs lead to the expected decisions under a pinned setup.
4. Human review asks whether the evidence is sufficient for the intended use.

Keep development cases separate from held-out cases. Once a held-out result guides another edit, that case has become development evidence. Keep protected rules separate from average quality: one prohibited payment action is a veto even if most ordinary cases pass.

The included replay is deliberately limited. Eight scenarios are repeated three times for two prompt versions: `8 × 3 × 2 = 48` authored fixture attempts. Repetition demonstrates the reporting workflow; because the fixtures are fixed, it does not measure model variability.
