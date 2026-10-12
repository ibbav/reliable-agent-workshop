import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { replayEvaluation } from "../evaluation/replay.mjs";

test("replays eight cases three times for two prompt versions", async () => {
  const result = await replayEvaluation({
    repoRoot: new URL("../", import.meta.url).pathname,
    specPath: "examples/conference-assistant/evaluation.json",
    fixturePath: "examples/conference-assistant/replay-outputs.json"
  });
  assert.equal(result.summary.planned_calls, 48);
  assert.equal(result.summary.attempts, 48);
  assert.equal(result.summary.replay_only, true);
  assert.equal(result.summary.binary.contract.b.passed, 24);
  assert.equal(result.summary.binary.behavior.b.passed, 21);
  assert.equal(result.summary.candidate_hard_failures, 0);
});

test("fixed replay fixtures cannot be exported as Bayesian performance observations", async () => {
  const repoRoot = new URL("../", import.meta.url).pathname;
  const outputDir = await mkdtemp(path.join(tmpdir(), "reliable-agent-replay-"));
  const result = await replayEvaluation({
    repoRoot,
    specPath: "examples/conference-assistant/evaluation.json",
    fixturePath: "examples/conference-assistant/replay-outputs.json",
    outputDir
  });
  assert.ok(result.attempts.every(item => item.source_type === "offline_fixture"));
  const exported = spawnSync(process.execPath, [
    path.join(repoRoot, "evaluation/export_observations.mjs"),
    "--attempts", path.join(outputDir, "attempts.json"),
    "--output", path.join(outputDir, "observations.json"),
    "--metric", "behavior"
  ], { encoding: "utf8" });
  assert.notEqual(exported.status, 0);
  assert.match(exported.stderr, /offline fixtures cannot be used to estimate model performance/i);
});

test("approved live-shaped observations retain failures and explicit provenance",async()=>{
  const folder=await mkdtemp(path.join(tmpdir(),"bayes-export-"));
  const attempts=["a","b"].map(variant=>({source_type:"live_model",case_id:"synthetic-test",repeat:1,variant,checks:[{id:"accuracy",passed:variant==="b"}]}));
  await writeFile(path.join(folder,"attempts.json"),JSON.stringify(attempts));
  const result=spawnSync(process.execPath,[new URL("../evaluation/export_observations.mjs",import.meta.url).pathname,
    "--attempts",path.join(folder,"attempts.json"),"--output",path.join(folder,"observations.json"),"--metric","accuracy"],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr);
  const exported=JSON.parse(await readFile(path.join(folder,"observations.json"),"utf8"));
  assert.equal(exported.provenance,"live_model");
  assert.deepEqual(exported.observations.map(row=>row.value),[0,1]);
});
