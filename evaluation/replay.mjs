import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runEvaluation } from "./engine.mjs";
import { parseArgs } from "./args.mjs";

export async function replayEvaluation({ repoRoot, specPath, fixturePath, outputDir = null }) {
  const specText = await readFile(path.join(repoRoot, specPath), "utf8");
  const spec = JSON.parse(specText);
  if(fixturePath) spec.dependencies={...spec.dependencies,replay:fixturePath};
  const destination = outputDir || await mkdtemp(path.join(tmpdir(), "reliable-agent-replay-"));
  const result=await runEvaluation({ spec, repoRoot, outputDir: destination, execute: true, transportOverride:{plugin:"offline-replay"} });
  return {...result,outputDir:destination};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const result = await replayEvaluation({ repoRoot: process.cwd(), specPath: args.spec, fixturePath: args.fixtures, outputDir: args.output });
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`Reports: ${result.outputDir}`);
}
