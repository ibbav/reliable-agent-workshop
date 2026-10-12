# Data policy

This page answers one question: what information is safe to add to this workshop?

Add only synthetic or explicitly public material. Do not add customer messages, operational traces, credentials, private tickets, internal metrics, personal filesystem paths, hidden prompt contracts, or infrastructure details.

Use obvious fictional identifiers such as `A101`, `B204`, and `workshop@example.com`. Explain every generated result as synthetic. If a real failure inspires a case, rewrite the scenario from scratch and keep only the general lesson.

Before sharing, run `npm run audit`, inspect every changed file, and review document metadata. Automated scans reduce risk; they do not replace human review.
