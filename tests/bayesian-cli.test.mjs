import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,symlink,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {resolveEnvironment,runBayesian} from "../evaluation/bayesian.mjs";

test("Bayesian dependencies cannot be installed inside the shared repository",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"bayes-env-guard-"));
  for(const environment of [root,path.join(root,".venv")]) await assert.rejects(()=>resolveEnvironment(root,environment),/outside/);
});

test("setup refuses an existing unrelated directory",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"bayes-project-"));
  const environment=await mkdtemp(path.join(tmpdir(),"bayes-unrelated-"));
  await writeFile(path.join(environment,"keep.txt"),"user content");
  await assert.rejects(()=>runBayesian({command:"setup",repoRoot:root,args:{env:environment,python:process.execPath}}),/not a workshop environment/);
});

test("demo gives an actionable setup error without dependencies",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"bayes-project-"));
  const environment=path.join(await mkdtemp(path.join(tmpdir(),"bayes-absent-")),"env");
  await assert.rejects(()=>runBayesian({command:"demo",repoRoot:root,args:{env:environment}}),/bayes:setup/);
});

test("Bayesian environment cannot reach the repository through a symlink",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"bayes-project-"));
  const outside=await mkdtemp(path.join(tmpdir(),"bayes-links-"));
  await symlink(root,path.join(outside,"link"),"dir");
  await assert.rejects(()=>resolveEnvironment(root,path.join(outside,"link","env")),/outside/);
});
