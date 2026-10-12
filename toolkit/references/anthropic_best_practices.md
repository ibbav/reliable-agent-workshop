# Anthropic best practices

This page answers one question: which Claude-specific settings and prompt habits require a fresh check before use?

This is a design checklist, not a snapshot of available models or API defaults. Anthropic changes model support and parameter behavior; check the [current prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [effort guide](https://platform.claude.com/docs/en/build-with-claude/effort), and [tool-use guide](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) for the selected model and platform.

## Thinking and reasoning

Treat effort and thinking configuration as part of the tested model profile. More reasoning can change latency, cost, and behavior; it is not an unconditional improvement. For a conference assistant, compare the same ambiguous-session cases at selected settings rather than assuming a setting that helped a different agent will help this one.

**Check:** Record model identifier, endpoint, effort/thinking settings, output ceiling, and observed failure rates before comparing prompts.

## Prompt-level guidance

Ask for the needed behavior: resolve a session, cite catalog evidence, and stop before a protected action. Avoid blanket “think harder” or “use every tool” instructions. If a tool is mandatory for current facts, say exactly when it must be called. If a lookup is optional, explain when it adds value.

**Check:** Does each tool mandate correspond to a correctness requirement rather than a habit copied from another model?

## Agentic patterns

Split work only when the subtasks have clear inputs and outputs. Keep one owner for the final seven-key JSON. Bound autonomy: the assistant may suggest a temporary seat hold but may not execute final booking or payment. Preserve source identity when summarizing retrieved catalog entries.

**Check:** After any delegation or context compression, can the final answer still trace its session time to the source catalog field?

## Tool use and failure paths

Match tool schemas in the prompt to the actual API definitions. Do not assume a tool call occurred because the model described one. Inspect returned tool-use events, distinguish tool errors from model refusals, and validate the final response locally.

**Check:** A failed catalog lookup yields a truthful, schema-valid answer and no fabricated session ID.

## Migration checklist

When changing Claude model families or versions, recheck supported parameters and defaults, structured-output behavior, tool triggering, context limits, and token accounting. Freeze a new profile and rerun development plus held-out cases. Do not import historical pass rates or settings as evidence for the new model.

**Check:** The comparison changes one declared factor at a time, or clearly labels a combined migration as such.
