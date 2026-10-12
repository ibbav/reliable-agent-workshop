import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runEvaluation } from "./engine.mjs";
import { parseArgs } from "./args.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  const spec = JSON.parse(await readFile(path.join(process.cwd(), args.spec), "utf8"));
  const outputDir=args.output||await mkdtemp(path.join(tmpdir(),"reliable-agent-dry-"));
  const result = await runEvaluation({ spec, repoRoot: process.cwd(), outputDir, execute: false });
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`Reports: ${outputDir}`);
}
