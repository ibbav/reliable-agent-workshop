# Extend the framework without editing the runner

This guide explains how another team can use its own agent, contract, checks, model transport, and reports. The bundled conference assistant and support triage are examples, not built-in assumptions of the evaluation engine.

## Four plugin jobs

An agent plugin prepares the model's input. A grader plugin declares metrics and checks the output. A transport plugin supplies an output, either from an authored offline fixture or a live model. A reporter plugin writes run evidence. A project can select several graders and reporters without changing the engine.

For example, support triage has a four-field contract and three metrics. The conference assistant has a seven-field contract and four metrics. Both use `offline-replay`, `json-report`, and `markdown-report`.

## Discover, inspect, and create

Run these commands from the repository root:

```bash
npm run plugins
node evaluation/plugin-cli.mjs inspect --id triage-grader
npm run plugin:new -- --kind grader --id example-grader
```

Discovery reads `plugins/*/plugin.json` without executing every plugin. Only selected plugins are imported by a run. The scaffold creates a new directory and refuses to overwrite an existing one. Its grader deliberately returns failure until implemented; a generated stub is not a finished check.

Use a manifest like this:

```json
{
  "id": "example-grader",
  "kind": "grader",
  "api_version": 1,
  "version": "0.1.0",
  "module": "index.mjs",
  "files": ["rubric.json"]
}
```

The optional `files` array lists helper modules, rubrics, and other plugin-owned files used at runtime. Every listed path and the module must stay inside the plugin directory. List all transitive local helpers so their hashes enter the run manifest. Do not use undeclared network resources or mutable external files in a grading rule.

For organization outside the default folder, set `plugin_directories` to repository-relative directories in the evaluation specification, or explicitly register manifests with `plugin_manifests`. Duplicate IDs, unsupported API versions, invalid versions, wrong kinds, and escaping paths are rejected. There is no fallback to whichever duplicate was discovered first.

## Versioning and compatibility

`api_version` is the engine contract version. Only version 1 is supported; an incompatible plugin is rejected before its code is imported. `version` is the plugin author's semantic version: use a patch for a compatible correction, a minor version for compatible new capability, and a major version for a breaking behavior or contract change. The engine validates the version format, not the truth of that promise.

Select one installed version of each unique plugin ID. There is no package resolver or automatic upgrade. Review upgrades locally and freeze file hashes in each run. Historical evidence must keep the exact source revision and files used; a version string alone is not reproducibility.

Start a new Node process after changing any imported plugin file, including declared helpers. The loader refuses hot reload because Node may otherwise keep an old helper in its module cache while recording a new file hash.

## Implement the contracts

Every module default-exports an object with `apiVersion: 1`.

An agent implements `prepare({testCase, resources})` and returns a nonempty string. `testCase` has the scenario input and metadata but not its `expected` answer. `resources` maps names to the frozen UTF-8 contents of declared dependencies. Do not inject expected answers or evaluator-only facts into this string.

A grader declares `metrics`, each with a unique lowercase ID, boolean `hard`, and description. It implements `grade({testCase, output, resources, variant, repeat})`:

```js
export default {
  apiVersion: 1,
  metrics: [{id: "example_check", hard: true, description: "The output is the independently expected value."}],
  grade({testCase, output}) {
    return {checks: [{id: "example_check", passed: output === testCase.expected, detail: "Exact comparison."}]};
  }
};
```

Return each declared metric exactly once, with a boolean `passed`. Missing, duplicate, unknown, or non-boolean checks fail the attempt's metrics and record a grading failure. A result cannot override the definition's `hard` flag. Every included attempt remains in every declared metric's denominator. Predeclare applicability before freezing the cases; do not silently drop difficult attempts.

A transport declares `sourceType` as `offline_fixture` or `live_model`, and `network` as a boolean. It implements `create({repoRoot, resources, options, runtime})`, returning an async function that receives `{testCase, variant, repeat, prompt, input}` and returns a JSON-serializable output. `input` is the prepared string. The offline transport uses expected answers only to materialize explicitly authored fixtures; live transports must never use them as model input.

A transport may implement `validate({resources, options, cases})` for dry-run preflight. A network transport is gated by explicit approval and a call ceiling before creation. The bundled live transport allows no automatic retries, enforces its ceiling and timeout, sends the prepared input, refuses redirects, and keeps credentials out of manifests. A custom transport must enforce actual provider-call limits too; one invocation can otherwise hide multiple paid requests. Default `network_calls` is zero offline; for custom network transports the reported value counts transport invocations, not a verified provider bill.

A reporter implements `write({outputDir, result})`. The result contains `manifest`, `attempts`, and `summary`. Use exclusive file creation and never overwrite evidence. The engine requires an empty output directory; two reporters must not claim the same filename. JSON and Markdown reporters are bundled.

The engine writes `manifest.json` before creating the transport or making any attempt. This filename is reserved; reporters write the final attempts, summary, or other views. If the process stops unexpectedly, preserve that manifest and treat the run as incomplete, not as a successful comparison.

For library tests, `runEvaluation` also accepts a trusted injected transport function. Set `replayOnly: true` explicitly for offline authored outputs; otherwise it is treated as live and requires `transportConfig.approved` plus a sufficient `maxCalls`. The manifest identifies it as `injected`, never as the unused transport in the spec. This provenance declaration, like plugin metadata, must be honest; it is not a network sandbox.

## Declare a reusable evaluation

Copy an example's `evaluation.json` and replace the agent, grader, resource paths, cases, and two prompt files. Its `schema_version` is 1. Both variants `a` and `b` must be present. Cases need unique IDs, a `development` or `held-out` split, domain input, and independent expected outcomes. Tags describe coverage; required tags and splits make dry-run fail when coverage is absent.

`dependencies` maps resource names to repository-relative UTF-8 files. `transport.options` carries nonsecret adapter options. Never put a key or private URL into the specification. Credentials come from the runtime environment for an explicitly approved live run.

```bash
node evaluation/run.mjs --spec examples/support-triage/evaluation.json
node evaluation/replay.mjs --spec examples/support-triage/evaluation.json
```

By default these write to a fresh temporary directory outside the shared folder and print its path. Preserve important evidence in a separately controlled location. Each manifest freezes prompt, case, resource, prepared-input, and selected plugin-file hashes. Editing a selected plugin during the run blocks the protected-review result. Grader inputs are cloned between attempts so an accidental mutation does not alter later expectations.

## Tests and review required for an extension

Test each new metric with passes, near misses, missing output, invalid types, fabricated evidence, and protected-rule failures. Test tool failures where the task has tools. Test a custom transport's timeout, response parsing, credential handling, and call limit without sending paid requests. Confirm the same frozen cases run for both variants and failures remain in the denominator.

Run `npm test`, your project's dry-run and offline replay, then `npm run audit`. Inspect the complete diff and output. For approved live observations, analyze each binary metric separately and review diagnostics, sensitivity, raw counts, focused results, broad results, and limitations before requesting release approval.

## Trust boundary and scale limits

Plugins are trusted local executable JavaScript. They can read files, access the network, and perform side effects with the process's permissions. Path checks, version checks, discovery, and hashes are not a sandbox or a security review. Review every selected plugin before importing it. Metadata cannot prove that a malicious plugin honestly declared its network behavior or dependencies.

This is a general local extension system, not a hosted multi-tenant service, marketplace, signed-package distribution system, or isolated job scheduler. Runs are sequential and retain attempts in memory. For large or untrusted workloads, add process isolation, restricted credentials, external storage, scheduling, and organizational access controls as separate reviewed work. Reuse the method and contracts first; do not claim production guarantees the workshop does not provide.
