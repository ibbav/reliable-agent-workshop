import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { discoverPlugins, hash } from "./plugins.mjs";
import { loadInputs, metricDefinitions, validateChecks } from "./spec.mjs";
import { summarize } from "./summary.mjs";

export async function loadEvaluation({spec,repoRoot}) { return loadInputs(spec,repoRoot); }

export async function runEvaluation({spec,repoRoot,outputDir=null,execute=false,transport=null,replayOnly=false,transportConfig={},transportOverride=null}) {
  spec=structuredClone(spec);
  if(transportConfig.endpoint!==undefined) {
    const endpoint=new URL(transportConfig.endpoint);
    if(endpoint.protocol!=="https:"||endpoint.username||endpoint.password||endpoint.search||endpoint.hash) throw new Error("Endpoint metadata must use HTTPS without credentials or query parameters.");
  }
  const loaded=await loadInputs(spec,repoRoot);
  const registry=await discoverPlugins({repoRoot,directories:spec.plugin_directories||["plugins"],registrations:spec.plugin_manifests||[]});
  const agent=await registry.load(spec.agent,"agent");
  const graders=await Promise.all(spec.graders.map(id=>registry.load(id,"grader")));
  const reporters=await Promise.all((spec.reporters||[]).map(id=>registry.load(id,"reporter")));
  const metrics=metricDefinitions(graders),selected=[agent,...graders,...reporters];
  const descriptor=transport?null:(transportOverride||spec.transport);
  let sourceType=replayOnly?"offline_fixture":"live_model",network=!replayOnly,createTransport=null;
  if(!transport&&descriptor) {
    const selectedTransport=await registry.load(descriptor.plugin,"transport");
    selected.push(selectedTransport);
    sourceType=selectedTransport.plugin.sourceType; network=selectedTransport.plugin.network;
    if(!["offline_fixture","live_model"].includes(sourceType)||typeof network!=="boolean") throw new Error("Transport must declare its provenance and network capability.");
    if(sourceType==="offline_fixture"&&network) throw new Error("Offline fixture transport cannot use the network.");
    if(selectedTransport.plugin.validate) await selectedTransport.plugin.validate({resources:loaded.resources,options:descriptor.options||{},cases:loaded.cases});
    if(execute) {
      if(network && (!transportConfig.approved || !Number.isSafeInteger(transportConfig.maxCalls) || transportConfig.maxCalls<loaded.plannedCalls)) throw new Error("Live execution needs explicit approval and a sufficient call ceiling.");
      createTransport=()=>selectedTransport.plugin.create({repoRoot,resources:loaded.resources,options:descriptor.options||{},runtime:transportConfig});
    }
  }
  if(execute&&network&&(!transportConfig.approved||!Number.isSafeInteger(transportConfig.maxCalls)||transportConfig.maxCalls<loaded.plannedCalls)) throw new Error("Live execution needs explicit approval and a sufficient call ceiling.");
  if(execute&&!createTransport&&typeof transport!=="function") throw new Error("Execution requires a transport function.");
  if(outputDir) { await mkdir(outputDir,{recursive:true}); if((await readdir(outputDir)).length) throw new Error("Output directory must be empty; previous run evidence cannot be overwritten."); }
  const variants=[{id:"a",prompt:loaded.promptA},{id:"b",prompt:loaded.promptB}],prepared=new Map();
  for(const testCase of loaded.cases) {
    const {expected,...agentCase}=structuredClone(testCase);
    const input=await agent.plugin.prepare({testCase:agentCase,resources:{...loaded.resources}});
    if(typeof input!=="string"||!input.trim()) throw new Error(`Agent ${spec.agent} must prepare a nonempty input string for ${testCase.id}.`);
    prepared.set(testCase.id,input);
  }
  const manifest={schema_version:1,plugin_api_version:1,evaluation_id:spec.id,example:spec.example||spec.agent,
    created_at:new Date().toISOString(),spec_sha256:hash(JSON.stringify(spec)),repeats:spec.repeats,planned_calls:loaded.plannedCalls,
    cases:{path:spec.cases,sha256:hash(loaded.casesText)},dependencies:loaded.dependencies,coverage:loaded.coverage,metrics,
    plugins:selected.map(p=>p.descriptor),transport:{plugin:descriptor?.plugin||"injected",source_type:sourceType,network,
      settings:Object.fromEntries(["endpoint","model","maxCalls","timeoutMs","settings"].filter(k=>transportConfig[k]!==undefined).map(k=>[k,transportConfig[k]]))},
    prepared_inputs:Object.fromEntries([...prepared].map(([id,input])=>[id,hash(input)])),
    variants:Object.fromEntries(variants.map(v=>[v.id,{prompt:spec.variants[v.id].prompt,sha256:hash(v.prompt)}]))};
  if(outputDir) await writeFile(path.join(outputDir,"manifest.json"),JSON.stringify(manifest,null,2)+"\n",{flag:"wx"});
  if(createTransport) transport=await createTransport();
  if(execute&&typeof transport!=="function") throw new Error("Transport factory must return a function.");
  const attempts=[],failures=()=>metrics.map(m=>({id:m.id,passed:false,hard:m.hard,detail:"Attempt could not be graded."}));
  if(execute) for(const testCase of loaded.cases) for(const variant of variants) for(let repeat=1;repeat<=spec.repeats;repeat++) {
    const attempt={case_id:testCase.id,split:testCase.split,variant:variant.id,repeat,source_type:sourceType,output:null,checks:failures()};
    try { attempt.output=JSON.parse(JSON.stringify(await transport({testCase:structuredClone(testCase),variant:variant.id,repeat,prompt:variant.prompt,input:prepared.get(testCase.id)}))); }
    catch(error) { attempt.error={kind:"transport_error",name:error?.name||"Error"}; attempts.push(attempt); continue; }
    try {
      const checks=[];
      for(const {plugin,descriptor:grader} of graders) checks.push(...validateChecks(await plugin.grade({testCase:structuredClone(testCase),output:structuredClone(attempt.output),resources:{...loaded.resources},variant:variant.id,repeat}),metrics.filter(m=>m.grader===grader.id)));
      attempt.checks=checks;
    } catch(error) { attempt.error={kind:"grading_error",name:error?.name||"Error"}; }
    attempts.push(attempt);
  }
  const inputsUnchanged=await registry.unchanged(selected.map(p=>p.descriptor.id));
  const summary=summarize({plannedCalls:loaded.plannedCalls,attempts,variants,metrics,execute,sourceType,network,coverage:loaded.coverage,inputsUnchanged});
  const result={manifest,attempts,summary};
  if(outputDir) for(const {plugin} of reporters) await plugin.write({outputDir,result});
  return result;
}
