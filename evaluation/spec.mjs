import { readFile } from "node:fs/promises";
import { hash, inside } from "./plugins.mjs";

export async function loadInputs(spec,repoRoot) {
  if (spec.schema_version !== 1) throw new Error("Evaluation schema_version must be 1.");
  if (typeof spec.id !== "string" || !spec.id.trim()) throw new Error("Evaluation needs an id.");
  if (!Number.isSafeInteger(spec.repeats) || spec.repeats < 1) throw new Error("repeats must be a positive integer.");
  if (typeof spec.agent !== "string" || !Array.isArray(spec.graders) || !spec.graders.length || new Set(spec.graders).size!==spec.graders.length) throw new Error("Declare one agent and unique grader plugin ids.");
  if (!Array.isArray(spec.reporters || []) || new Set(spec.reporters || []).size !== (spec.reporters || []).length) throw new Error("reporters must be unique plugin ids.");
  if (!spec.variants?.a?.prompt || !spec.variants?.b?.prompt || Object.keys(spec.variants).length!==2) throw new Error("Declare exactly variants a and b.");
  const read = async relative => readFile(await inside(repoRoot,relative),"utf8");
  const [promptA,promptB,casesText]=await Promise.all([read(spec.variants.a.prompt),read(spec.variants.b.prompt),read(spec.cases)]);
  const cases=JSON.parse(casesText).cases;
  if(!Array.isArray(cases)||!cases.length) throw new Error("Cases must be a nonempty array.");
  const ids=new Set();
  for(const c of cases) {
    if(!c || typeof c!=="object" || Array.isArray(c)) throw new Error("Each case must be an object.");
    if(typeof c.id!=="string" || !c.id.trim()) throw new Error("Each case needs an id.");
    if(ids.has(c.id)) throw new Error(`Duplicate case id: ${c.id}.`);
    ids.add(c.id);
    if(!["development","held-out"].includes(c.split)) throw new Error(`Invalid split for ${c.id}.`);
    if(c.tags!==undefined && (!Array.isArray(c.tags)||c.tags.some(t=>typeof t!=="string"))) throw new Error(`Invalid tags for ${c.id}.`);
  }
  const coverage={tags:Object.create(null),splits:Object.create(null)};
  for(const c of cases) {
    coverage.splits[c.split]=(coverage.splits[c.split]||0)+1;
    for(const tag of new Set(c.tags||[])) coverage.tags[tag]=(coverage.tags[tag]||0)+1;
  }
  for(const tag of spec.coverage?.required_tags || []) if(!coverage.tags[tag]) throw new Error(`Uncovered required tag: ${tag}.`);
  for(const split of spec.coverage?.required_splits || []) if(!coverage.splits[split]) throw new Error(`Uncovered required split: ${split}.`);
  const resources={},dependencies={};
  for(const [name,file] of Object.entries(spec.dependencies || {})) {
    if(!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error("Resource names must start with a lowercase letter and contain letters, digits or underscores.");
    resources[name]=await read(file);
    dependencies[name]={path:file,sha256:hash(resources[name])};
  }
  const plannedCalls=cases.length*spec.repeats*2;
  if(!Number.isSafeInteger(plannedCalls)) throw new Error("Attempt budget exceeds a safe integer.");
  return {promptA,promptB,cases,casesText,coverage,resources,dependencies,plannedCalls};
}

export function metricDefinitions(graders) {
  const metrics=[];
  for(const {plugin,descriptor} of graders) {
    if(!Array.isArray(plugin.metrics)||!plugin.metrics.length) throw new Error(`Grader ${descriptor.id} needs metrics.`);
    for(const m of plugin.metrics) {
      if(!/^[a-z][a-z0-9_]*$/.test(m.id||"") || typeof m.hard!=="boolean" || typeof m.description!=="string" || !m.description.trim()) throw new Error(`Invalid metric in ${descriptor.id}.`);
      if(metrics.some(x=>x.id===m.id)) throw new Error(`Duplicate metric: ${m.id}.`);
      metrics.push({...m,grader:descriptor.id});
    }
  }
  return metrics;
}

export function validateChecks(result,metrics) {
  if(!Array.isArray(result?.checks)||result.checks.length!==metrics.length) throw new Error("Grader must return every declared metric exactly once.");
  const ids=new Set();
  return result.checks.map(c=>{
    const definition=metrics.find(m=>m.id===c.id);
    if(!definition || ids.has(c.id)||typeof c.passed!=="boolean") throw new Error("Invalid or duplicate grader check.");
    ids.add(c.id);
    if(c.applicable===false) throw new Error("Binary release metrics cannot silently exclude attempts.");
    return {id:c.id,passed:c.passed,hard:definition.hard,detail:typeof c.detail==="string"?c.detail:""};
  });
}
