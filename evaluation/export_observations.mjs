import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => index % 2 === 0 ? [...pairs, [value.replace(/^--/, ""), all[index + 1]]] : pairs, []));
if (!args.attempts || !args.output || !args.metric) throw new Error("Use --attempts PATH --output PATH --metric CHECK_ID.");
const attempts = JSON.parse(await readFile(args.attempts, "utf8"));
if (attempts.some(attempt => attempt.source_type === "offline_fixture")) {
  throw new Error("Fixed offline fixtures cannot be used to estimate model performance. Export observations from a live-model run.");
}
if (attempts.some(attempt => attempt.source_type !== "live_model")) {
  throw new Error("Every attempt needs live-model provenance before performance analysis.");
}
const observations = attempts.map(attempt => {
  const check = attempt.checks.find(item => item.id === args.metric);
  if (!check) throw new Error(`Missing check ${args.metric} for ${attempt.case_id}.`);
  return { metric: args.metric, scenario_id: attempt.case_id, case_id: attempt.case_id, repeat_id: attempt.repeat, variant: attempt.variant, value: check.passed ? 1 : 0 };
});
await mkdir(path.dirname(args.output), { recursive: true });
await writeFile(args.output, `${JSON.stringify({ provenance: "live_model", observations }, null, 2)}\n`,{flag:"wx"});
console.log(`Wrote ${observations.length} observations to ${args.output}.`);
