import {spawn} from "node:child_process";
import {access, mkdir, mkdtemp, readFile, realpath, stat, writeFile} from "node:fs/promises";
import {homedir, tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";

const owner = "reliable-agent-workshop-bayesian-v1";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pythonIn = environment => path.join(environment, process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const exists = async target => {try {await access(target); return true;} catch(error) {if(error.code === "ENOENT") return false; throw error;}};

async function canonical(target) {
  try {return await realpath(target);} catch(error) {
    if(error.code !== "ENOENT") throw error;
    const parent = path.dirname(target);
    if(parent === target) throw error;
    return path.join(await canonical(parent), path.basename(target));
  }
}

export async function resolveEnvironment(repoRoot, requested) {
  const resolvedRoot = await canonical(path.resolve(repoRoot));
  const environment = await canonical(path.resolve(requested));
  const relative = path.relative(resolvedRoot, environment);
  if(relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
    throw new Error("Keep the environment and generated reports outside the shared repository.");
  }
  return environment;
}

function execute(program, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {stdio:"inherit", ...options});
    child.on("error", reject);
    child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${path.basename(program)} exited with status ${code}. Review the report; diagnostic failure is not a pass.`)));
  });
}

export async function runBayesian({command, repoRoot = root, args = {}}) {
  if(!["setup", "demo", "fit"].includes(command)) throw new Error("Choose setup, demo, or fit.");
  const environment = await resolveEnvironment(repoRoot, args.env ?? path.join(homedir(), ".cache", "reliable-agent-workshop", "bayes"));
  const marker = path.join(environment, "workshop-environment.json");
  const python = pythonIn(environment);
  if(command === "setup") {
    if(await exists(environment)) {
      let owned = false;
      try {owned = JSON.parse(await readFile(marker, "utf8")).owner === owner;} catch {}
      if(!owned || !(await stat(environment)).isDirectory()) throw new Error("Existing directory is not a workshop environment. Choose a new --env path; nothing was overwritten.");
    } else {
      await mkdir(environment, {recursive:true});
      await writeFile(marker, `${JSON.stringify({owner})}\n`, {flag:"wx"});
    }
    const interpreter = args.python ?? "python3";
    await execute(interpreter, ["-c", "import sys; assert (3,11) <= sys.version_info[:2] <= (3,12), 'Use Python 3.11 or 3.12 for the pinned Bayesian environment.'"]);
    await execute(interpreter, ["-m", "venv", environment]);
    await execute(python, ["-m", "pip", "install", "--no-cache-dir", "--only-binary=:all:", "-r", path.join(repoRoot, "evaluation", "requirements.txt")]);
    console.log("Bayesian environment ready. Run npm run bayes:demo with the same --env if customized.");
    return;
  }
  if(!await exists(python)) throw new Error("Bayesian environment is missing. Run npm run bayes:setup -- --python python3.11 first.");
  if(command === "demo") {
    const output = await resolveEnvironment(repoRoot, args.output ?? path.join(await mkdtemp(path.join(tmpdir(), "workshop-bayes-")), "smoke"));
    await execute(python, ["-B", path.join(repoRoot, "evaluation", "bayesian_smoke.py"), "--output", output]);
    console.log(`Synthetic software-test report: ${path.join(output, "report.json")}`);
    return;
  }
  if(!args.input || !args.output) throw new Error("Use --input OBSERVATIONS.json --output NEW_REPORT.json.");
  const output = await resolveEnvironment(repoRoot, args.output);
  const fitArgs = ["-B", path.join(repoRoot, "evaluation", "hierarchical_binary.py"), args.input, "--out", output];
  for(const option of ["draws", "tune"]) if(args[option] !== undefined) fitArgs.push(`--${option}`, args[option]);
  await execute(python, fitArgs);
}

if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...tokens] = process.argv.slice(2);
    const allowed = {setup:["env","python"], demo:["env","output"], fit:["env","input","output","draws","tune"]}[command] ?? [];
    const args = {};
    for(let i=0; i<tokens.length; i+=2) {
      const key = tokens[i].replace(/^--/, "");
      if(!tokens[i].startsWith("--") || !allowed.includes(key) || !tokens[i+1] || tokens[i+1].startsWith("--") || key in args) throw new Error(`Invalid option ${tokens[i]}.`);
      args[key] = tokens[i+1];
    }
    await runBayesian({command, args});
  } catch(error) {console.error(error.message); process.exitCode = 1;}
}
