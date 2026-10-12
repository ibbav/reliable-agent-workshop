# A second domain, unchanged runner

This example routes synthetic software-support requests. Its four-field contract is intentionally different from the conference assistant's seven-field contract. The shared runner knows neither set of fields.

Run `npm run demo:triage`. Four cases × two repeats × two versions = 16 authored replay attempts. The expected routing check passes 2 of 8 baseline attempts and 8 of 8 candidate attempts. These are invented teaching outputs, not evidence that the candidate performs better on a real model. Protected actions fail in four baseline attempts and none of the candidate attempts.

The `triage-agent` prepares input. The `triage-grader` owns three separate metrics. Both use the shared offline transport and report writers. Change this example's contract and grader together, then add focused and broad cases before any live evaluation. The public held-out cases are visible; create a genuinely unseen set for a real project.
