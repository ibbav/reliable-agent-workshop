# Contributing

This guide answers one question: what evidence should accompany a prompt change?

1. State the behavior being changed and its boundary.
2. Add or update an independently derived case.
3. Preserve the baseline and candidate as separate files.
4. Run both versions on the same cases and repeats.
5. Keep failures and parse errors in the denominator.
6. Run deterministic checks and protected-rule vetoes.
7. Report uncertainty and limitations before recommending a change.

For example, eight cases repeated three times for two versions produce `8 × 3 × 2 = 48` attempts. A candidate with 21 behavior passes has `21 ÷ 24 = 87.5%` on its 24 attempts. That describes this run only; it does not prove general reliability.

For code extensions, use the versioned plugin contracts in `docs/extending.md`. Add independent tests, declare every helper file used by the plugin, and test wrong types, missing checks, failures, and protected boundaries. Do not copy private agents or data as examples. Run tests, both offline examples, dry-run, and audit before handing over a change. Record affected consumers and intentionally unchanged mirrors explicitly.
