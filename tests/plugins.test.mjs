import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { discoverPlugins } from "../evaluation/plugins.mjs";
import { runEvaluation } from "../evaluation/engine.mjs";

async function plugin(root, name, kind, source, extra = {}) {
  const dir = path.join(root, "plugins", name);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "plugin.json"), JSON.stringify({ id: name, kind, api_version: 1, version: "1.0.0", module: "index.mjs", ...extra }));
  await writeFile(path.join(dir, "index.mjs"), source);
}

async function workspace(grader = 'return {checks:[{id:"exact",passed:output === testCase.expected}]};') {
  const root = await mkdtemp(path.join(tmpdir(), "agent-plugin-test-"));
  await plugin(root, "text-agent", "agent", 'export default {apiVersion:1, prepare:({testCase})=>testCase.input};');
  await plugin(root, "text-grader", "grader", `export default {apiVersion:1, metrics:[{id:"exact",hard:true,description:"Matches the independent answer."}], grade:({testCase,output})=>{${grader}}};`);
  await writeFile(path.join(root, "a.md"), "Baseline.");
  await writeFile(path.join(root, "b.md"), "Candidate.");
  await writeFile(path.join(root, "cases.json"), JSON.stringify({ cases: [
    { id: "one", split: "development", tags: ["normal"], input: "Return BLUE.", expected: "BLUE" },
    { id: "two", split: "held-out", tags: ["boundary"], input: "Return GREEN.", expected: "GREEN" }
  ] }));
  return { root, spec: { schema_version: 1, id: "text-test", cases: "cases.json", repeats: 2,
    variants: { a: {prompt:"a.md"}, b: {prompt:"b.md"} }, agent:"text-agent", graders:["text-grader"],
    coverage: {required_tags:["normal","boundary"], required_splits:["development","held-out"]}, reporters:[] } };
}

test("discovers local manifests and grades a new domain without conference check names", async () => {
  const {root,spec} = await workspace();
  const registry = await discoverPlugins({repoRoot:root});
  assert.deepEqual(registry.list().map(p=>p.id), ["text-agent","text-grader"]);
  const result = await runEvaluation({spec,repoRoot:root,execute:true,replayOnly:true,transport:async ({testCase})=>testCase.expected});
  assert.deepEqual(result.summary.binary, {exact:{a:{passed:4,total:4},b:{passed:4,total:4}}});
  assert.deepEqual(result.summary.paired.exact, {both_pass:4,a_only:0,b_only:0,both_fail:0});
  assert.equal(result.summary.by_split["held-out"].exact.b.total, 2);
  assert.equal(result.manifest.plugins.length, 2);
  assert.match(result.manifest.plugins[0].files["index.mjs"], /^[a-f0-9]{64}$/);
});

test("rejects incompatible APIs and module escapes during discovery", async () => {
  const {root} = await workspace();
  await plugin(root,"future","agent","throw new Error('must not import');",{api_version:2});
  await assert.rejects(discoverPlugins({repoRoot:root}), /API version/);
  await plugin(root,"future","agent","throw new Error('must not import');",{module:"../../outside.mjs"});
  await assert.rejects(discoverPlugins({repoRoot:root}), /inside the plugin directory/);
});

test("rejects duplicate registered IDs instead of choosing a plugin silently", async () => {
  const {root} = await workspace();
  await plugin(root,"copy","agent","export default {apiVersion:1,prepare:()=>''};",{id:"text-agent"});
  await assert.rejects(discoverPlugins({repoRoot:root}), /Duplicate plugin/);
});

test("plugin versions accept SemVer build metadata and reject leading zero numeric identifiers",async()=>{
  const {root}=await workspace();
  for(const version of ["1.0.0+build.1","1.0.0-alpha.1"]) {
    await plugin(root,"versioned","agent",'export default {apiVersion:1,prepare:()=>"input"};',{version});
    assert.ok((await discoverPlugins({repoRoot:root})).list().some(p=>p.version===version));
  }
  for(const version of ["01.0.0","1.0.0-01"]) {
    await plugin(root,"versioned","agent",'export default {apiVersion:1,prepare:()=>"input"};',{version});
    await assert.rejects(()=>discoverPlugins({repoRoot:root}),/semantic version/);
  }
});

test("missing or forged grader checks fail every declared metric and block protected review", async () => {
  for (const body of ['return {checks:[]};','return {checks:[{id:"exact",passed:"yes"}]};','return {checks:[{id:"extra",passed:true}]};']) {
    const {root,spec} = await workspace(body);
    const result=await runEvaluation({spec,repoRoot:root,execute:true,replayOnly:true,transport:async()=>"BLUE"});
    assert.equal(result.summary.binary.exact.b.passed,0);
    assert.equal(result.summary.binary.exact.b.total,4);
    assert.equal(result.summary.grading_failures.b,4);
    assert.equal(result.summary.candidate_gate.protected_passed,false);
    assert.ok(result.attempts.every(a=>a.checks[0].hard && !a.checks[0].passed));
  }
});

test("dry-run rejects uncovered requirements and duplicate cases before making calls", async () => {
  const {root,spec}=await workspace();
  spec.coverage.required_tags.push("tool_failure");
  await assert.rejects(runEvaluation({spec,repoRoot:root}),/tool_failure/);
  spec.coverage.required_tags.pop();
  await writeFile(path.join(root,"cases.json"),JSON.stringify({cases:[{id:"same",split:"development",tags:["normal"]},{id:"same",split:"held-out",tags:["boundary"]}]}));
  await assert.rejects(runEvaluation({spec,repoRoot:root}),/Duplicate case/);
});

test("protected failures cannot be softened by a grader result", async () => {
  const {root,spec}=await workspace('return {checks:[{id:"exact",passed:false,hard:false}]};');
  const result=await runEvaluation({spec,repoRoot:root,execute:true,replayOnly:true,transport:async()=>"wrong"});
  assert.equal(result.summary.candidate_hard_failures,4);
  assert.equal(result.summary.candidate_gate.protected_passed,false);
});

test("declared helper changes cannot be silently served from the module cache",async()=>{
  const {root}=await workspace();
  await plugin(root,"helper-agent","agent",'import {value} from "./helper.mjs"; export default {apiVersion:1,prepare:()=>value};',{files:["helper.mjs"]});
  await writeFile(path.join(root,"plugins/helper-agent/helper.mjs"),'export const value="old";');
  const before=await discoverPlugins({repoRoot:root});
  assert.equal((await before.load("helper-agent","agent")).plugin.prepare(),"old");
  await writeFile(path.join(root,"plugins/helper-agent/helper.mjs"),'export const value="new";');
  const after=await discoverPlugins({repoRoot:root});
  await assert.rejects(()=>after.load("helper-agent","agent"),/restart/i);
});

test("injected live transports require approval and a budget too",async()=>{
  const {root,spec}=await workspace();
  let calls=0;
  await assert.rejects(()=>runEvaluation({spec,repoRoot:root,execute:true,transport:async()=>{calls++;return "BLUE";}}),/explicit approval/);
  assert.equal(calls,0);
  const r=await runEvaluation({spec,repoRoot:root,execute:true,transport:async({testCase})=>testCase.expected,transportConfig:{approved:true,maxCalls:8,apiKey:"example_key"}});
  assert.equal(r.manifest.transport.plugin,"injected");
  assert.equal(r.manifest.transport.source_type,"live_model");
  assert.ok(!JSON.stringify(r.manifest).includes("example_key"));
});

test("explicit registrations and several graders work without default discovery",async()=>{
  const {root,spec}=await workspace();
  await plugin(root,"second-grader","grader",'export default {apiVersion:1,metrics:[{id:"second",hard:false,description:"Another concern."}],grade:()=>({checks:[{id:"second",passed:true}]})};');
  spec.plugin_directories=[];
  spec.plugin_manifests=["plugins/text-agent/plugin.json","plugins/text-grader/plugin.json","plugins/second-grader/plugin.json"];
  spec.graders.push("second-grader");
  const r=await runEvaluation({spec,repoRoot:root,execute:true,replayOnly:true,transport:async({testCase})=>testCase.expected});
  assert.equal(r.summary.binary.second.b.passed,4);
  assert.equal(r.summary.binary.exact.b.passed,4);
  const dir=path.join(root,"plugins","duplicate-metric");
  await plugin(root,"duplicate-metric","grader",'export default {apiVersion:1,metrics:[{id:"exact",hard:true,description:"Colliding concern."}],grade:()=>({checks:[]})};');
  spec.plugin_manifests.push(path.relative(root,path.join(dir,"plugin.json")));
  spec.graders.push("duplicate-metric");
  await assert.rejects(()=>runEvaluation({spec,repoRoot:root}),/Duplicate metric/);
});

test("agent input excludes the expected answer, symlink escapes reject, and changed code blocks review",async()=>{
  const {root,spec}=await workspace();
  await plugin(root,"text-agent","agent",'export default {apiVersion:1,prepare:({testCase})=>{if("expected" in testCase)throw new Error("answer leaked");return testCase.input;}};');
  const r=await runEvaluation({spec,repoRoot:root,execute:true,replayOnly:true,transport:async({testCase})=>{
    await writeFile(path.join(root,"plugins/text-agent/index.mjs"),"changed");
    return testCase.expected;
  }});
  assert.equal(r.summary.candidate_gate.inputs_unchanged,false);
  assert.equal(r.summary.candidate_gate.protected_passed,false);
  const outside=await mkdtemp(path.join(tmpdir(),"plugin-outside-"));
  await writeFile(path.join(outside,"other.mjs"),"export default {};");
  await symlink(path.join(outside,"other.mjs"),path.join(root,"plugins/text-agent/linked.mjs"));
  await plugin(root,"text-agent","agent","irrelevant",{module:"linked.mjs"});
  await assert.rejects(()=>discoverPlugins({repoRoot:root}),/inside the plugin directory/);
});
