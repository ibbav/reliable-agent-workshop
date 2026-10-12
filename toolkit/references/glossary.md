# Shared glossary

This glossary gives the workshop terms practical meanings. The definitions describe this framework, not universal industry standards. The public examples use a synthetic conference catalog.

- An **agent** is a bounded model-driven task performer with explicit inputs, outputs, and authority. Here it proposes a session hold but does not execute payment.
- A **prompt** is the instruction text supplied to a model. It is only one part of the system; tools, validators, data, and permissions also shape behavior.
- A **contract** defines the exact accepted input or output shape and meaning. A valid seven-key JSON response can still contain the wrong decision.
- A **consumer** is the code or person that uses an output. Displaying a field is different from using it to decide or execute an action.
- A **capability** is an available information source, tool, or permitted operation. Access to a tool is not permission to use it in every situation.
- A **constraint** is a rule that must remain true while deciding and acting. A protected constraint is a veto, not a score to average away.
- A **workflow skill** is reusable guidance for a stage such as intake or evaluation. The six toolkit skills organize work; they do not grant release authority.
- A **plugin** is trusted local executable code that implements an agent, grader, transport, or reporter contract. Installing a plugin does not sandbox it.
- A **manifest** records plugin identity and version, or the frozen inputs of an evaluation run. A hash is a content fingerprint, not proof that the content is safe.
- A **fixture** is a fixed authored input or output used to test mechanics. Replaying it three times does not measure model variability.
- A **scenario** is the situation being tested, such as an ambiguous session title. A **repeat** is another attempt on that same situation under the pinned setup.
- A **development case** can guide edits. A **held-out case** is reserved until final evaluation; once used to guide an edit, it is no longer held out for that edit.
- A **simulator** plays a synthetic user. Its scenario and hidden control state must not leak the expected answer to the agent.
- A **grader** checks an output against a stated rule. A **model judge** is a model-based grader whose judgments need calibration and evidence checks.
- A **binary metric** records pass or fail for one concern. Contract compliance, correctness, and protected actions are different metrics, not one combined success rate.
- **Grounding** means a claim or quote is supported by an allowed source. Finding the quote does not by itself prove the overall answer is correct.
- A **paired comparison** runs baseline and candidate on matching scenarios and repeat identifiers, with failures retained.
- A **denominator** is every included attempt being counted. For eight cases repeated three times, one version has eight × three = 24 attempts, even when a call fails.
- **Partial pooling** lets related scenarios share statistical information while retaining scenario differences. It does not turn a small test set into broad real-world coverage.
- A **prior** states assumptions before the observations. **Sensitivity analysis** checks how conclusions change under a different reasonable assumption.
- A **95% credible interval** contains 95% of the posterior probability under the chosen model and data. It is not a guarantee about future behavior.
- **R-hat** checks whether sampling chains agree. **Effective sample size** estimates how much independent information the correlated statistical draws provide. **Divergences** warn that the sampler struggled. These are fit diagnostics, not checks that the task or rubric is correct.
- A **release gate** is evidence and approval required before deployment. Passing deterministic checks is necessary where required, but it is not publication or production approval.
- **Sanitization** removes private substance, not just names. For public teaching, rebuild examples with synthetic facts rather than lightly redacting real traces.

For example, 21 behavior passes divided by 24 candidate fixture attempts equals 87.5% in that replay. It is not a live-model estimate, a safety probability, or evidence that every new conference request will work.
