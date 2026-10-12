import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,readdir} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {scaffold} from "../evaluation/plugin-cli.mjs";
import {discoverPlugins} from "../evaluation/plugins.mjs";
import {replayEvaluation} from "../evaluation/replay.mjs";
import {runEvaluation} from "../evaluation/engine.mjs";
import {parseArgs} from "../evaluation/args.mjs";
const repoRoot=new URL("../",import.meta.url).pathname;
test("second domain uses the same runner, transport and reports",async()=>{
  const r=await replayEvaluation({repoRoot,specPath:"examples/support-triage/evaluation.json"});
  assert.equal(r.summary.attempts,16);
  assert.equal(r.summary.network_calls,0);
  assert.deepEqual(r.summary.binary.routing,{a:{passed:2,total:8},b:{passed:8,total:8}});
  assert.equal(r.summary.candidate_gate.decision,"illustration_only");
  assert.equal(r.manifest.plugins.length,5);
  assert.match(await readFile(path.join(r.outputDir,"report.md"),"utf8"),/not measured model performance/);
  await assert.rejects(()=>replayEvaluation({repoRoot,specPath:"examples/support-triage/evaluation.json",outputDir:r.outputDir}),/must be empty/);
});

test("rejected credential-bearing endpoints never enter an artifact",async()=>{
  const spec=JSON.parse(await readFile(path.join(repoRoot,"examples/conference-assistant/evaluation.json"),"utf8"));
  for(const endpoint of ["https://demo-user:demo-password@example.com/v1","https://example.com/v1?secret=demo-password"]) {
    const outputDir=await mkdtemp(path.join(tmpdir(),"reliable-agent-secret-"));
    await assert.rejects(()=>runEvaluation({spec,repoRoot,outputDir,execute:true,transportOverride:{plugin:"live-json"},transportConfig:{approved:true,maxCalls:48,endpoint,model:"synthetic",apiKey:"example_key"}}),/without credentials/);
    assert.deepEqual(await readdir(outputDir),[]);
  }
});
test("scaffold registers all four kinds, refuses overwrites and fails closed",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"reliable-agent-scaffold-"));
  for(const kind of ["agent","grader","transport","reporter"]) await scaffold({repoRoot:root,id:`new-${kind}`,kind});
  const r=await discoverPlugins({repoRoot:root});
  assert.equal(r.list().length,4);
  const grader=await r.load("new-grader","grader");
  assert.equal(grader.plugin.grade().checks[0].passed,false);
  await assert.rejects(()=>scaffold({repoRoot:root,id:"new-agent",kind:"agent"}),/already exists/);
  await assert.rejects(()=>scaffold({repoRoot:root,id:"../escape",kind:"agent"}),/lowercase/);
});
test("live plugin is gated before fetching and flags do not swallow other arguments",async()=>{
  assert.deepEqual(parseArgs(["--execute","--model","demo"],["execute"]),{execute:true,model:"demo"});
  assert.throws(()=>parseArgs(["--model"]),/Missing/);
  const spec=JSON.parse(await readFile(path.join(repoRoot,"examples/conference-assistant/evaluation.json"),"utf8"));
  await assert.rejects(()=>runEvaluation({spec,repoRoot,execute:true,transportOverride:{plugin:"live-json"},transportConfig:{maxCalls:48}}),/explicit approval/);
  await assert.rejects(()=>runEvaluation({spec,repoRoot,execute:true,transportOverride:{plugin:"live-json"},transportConfig:{approved:true,maxCalls:47}}),/ceiling/);
});
