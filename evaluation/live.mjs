import { readFile } from "node:fs/promises";
import path from "node:path";
import { runEvaluation } from "./engine.mjs";
import { parseArgs } from "./args.mjs";

const values = parseArgs(process.argv.slice(2),["execute"]);
if (values.execute !== true) throw new Error("Refusing live calls without the standalone --execute flag.");
for (const required of ["spec", "output", "endpoint", "model", "max-calls", "key-env"]) {
  if (!values[required]) throw new Error(`Missing --${required}.`);
}
const apiKey = process.env[values["key-env"]];
if (!apiKey) throw new Error(`The named key environment variable is not set.`);
const repoRoot = process.cwd();
const spec = JSON.parse(await readFile(path.join(repoRoot, values.spec), "utf8"));
const maxCalls = Number(values["max-calls"]);
const planned = JSON.parse(await readFile(path.join(repoRoot, spec.cases), "utf8")).cases.length * spec.repeats * 2;
if (maxCalls < planned) throw new Error(`The declared ceiling ${maxCalls} is below the planned ${planned} calls.`);
const result = await runEvaluation({ spec, repoRoot, outputDir: values.output, execute: true,
  transportOverride:{plugin:"live-json"},
  transportConfig:{approved:true,endpoint:values.endpoint,model:values.model,apiKey,maxCalls,settings:{temperature:0}}
});
console.log(JSON.stringify(result.summary, null, 2));
