import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runEvaluation } from "../evaluation/engine.mjs";

test("dry-run freezes inputs and plans 48 calls without a provider", async () => {
  const repoRoot = new URL("../", import.meta.url).pathname;
  const spec = JSON.parse(await readFile(path.join(repoRoot, "examples/conference-assistant/evaluation.json"), "utf8"));
  const parent = await mkdtemp(path.join(tmpdir(), "reliable-agent-dry-"));
  const outputDir = path.join(parent, "run");
  const result = await runEvaluation({ spec, repoRoot, outputDir, execute: false });
  assert.equal(result.summary.status, "dry-run");
  assert.equal(result.summary.planned_calls, 48);
  assert.equal(result.summary.attempts, 0);
  assert.equal(result.summary.identical_prompts, false);
  assert.match(await readFile(path.join(outputDir, "manifest.json"), "utf8"), /conference-assistant/);
});

test("a failed model call counts as a failed attempt and does not stop the paired run", async () => {
  const repoRoot = new URL("../", import.meta.url).pathname;
  const spec = JSON.parse(await readFile(path.join(repoRoot, "examples/conference-assistant/evaluation.json"), "utf8"));
  const cases = JSON.parse(await readFile(path.join(repoRoot, spec.cases), "utf8")).cases;
  const result = await runEvaluation({
    spec, repoRoot, execute: true, replayOnly:true,
    transport: async ({ testCase, variant, repeat }) => {
      if (testCase.id === cases[0].id && variant === "b" && repeat === 1) throw new Error("Malformed model JSON");
      return structuredClone(testCase.expected);
    }
  });
  assert.equal(result.summary.attempts, 48);
  assert.equal(result.summary.binary.behavior.b.total, 24);
  assert.equal(result.summary.binary.behavior.b.passed, 23);
  assert.equal(result.summary.model_failures.b, 1);
  assert.equal(result.summary.candidate_hard_failures, 0);
  const failed = result.attempts.find(item => item.variant === "b" && item.case_id === cases[0].id && item.repeat === 1);
  assert.equal(failed.error.kind, "transport_error");
  assert.ok(failed.checks.every(check => !check.passed));
});

test("the frozen manifest is on disk before the first attempt",async()=>{
  const repoRoot=new URL("../",import.meta.url).pathname;
  const spec=JSON.parse(await readFile(path.join(repoRoot,"examples/conference-assistant/evaluation.json"),"utf8"));
  const outputDir=await mkdtemp(path.join(tmpdir(),"reliable-agent-freeze-"));
  const r=await runEvaluation({spec,repoRoot,outputDir,execute:true,replayOnly:true,transport:async({testCase})=>{
    const frozen=JSON.parse(await readFile(path.join(outputDir,"manifest.json"),"utf8"));
    assert.equal(frozen.planned_calls,48);
    return testCase.expected;
  }});
  assert.equal(r.summary.model_failures.a+r.summary.model_failures.b,0);
});
