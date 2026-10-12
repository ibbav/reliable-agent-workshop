import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {discoverPlugins} from "./plugins.mjs";
import {parseArgs} from "./args.mjs";
export async function scaffold({repoRoot,id,kind}) {
  if(!/^[a-z][a-z0-9.-]*$/.test(id) || !["agent","grader","transport","reporter"].includes(kind)) throw new Error("Choose a lowercase ID and agent, grader, transport, or reporter kind.");
  const registry=await discoverPlugins({repoRoot});
  if(registry.list().some(p=>p.id===id)) throw new Error("Plugin ID already exists.");
  const directory=path.join(repoRoot,"plugins",id);
  await mkdir(path.dirname(directory),{recursive:true});
  await mkdir(directory); // No recursive option: an existing directory must never be overwritten.
  const bodies={
    agent:'prepare({testCase}) { return testCase.input; }',
    grader:'metrics:[{id:"replace_me",hard:true,description:"Replace with a domain-specific invariant."}],\n  grade() { return {checks:[{id:"replace_me",passed:false,detail:"Not implemented; fails closed."}]}; }',
    transport:'sourceType:"offline_fixture",network:false,\n  create() { throw new Error("Implement a trusted transport before use."); }',
    reporter:'write() { throw new Error("Implement a report writer before use."); }'
  };
  await writeFile(path.join(directory,"plugin.json"),JSON.stringify({id,kind,api_version:1,version:"0.1.0",module:"index.mjs"},null,2)+"\n",{flag:"wx"});
  await writeFile(path.join(directory,"index.mjs"),`export default {apiVersion:1,\n  ${bodies[kind]}\n};\n`,{flag:"wx"});
  return directory;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const [command,...rest]=process.argv.slice(2),args=parseArgs(rest);
  if(command==="new") console.log(await scaffold({repoRoot:process.cwd(),id:args.id,kind:args.kind}));
  else if(command==="list"||command==="inspect") {
    const registry=await discoverPlugins({repoRoot:process.cwd()});
    const list=registry.list().filter(p=>command==="list"||p.id===args.id);
    if(!list.length) throw new Error("No matching plugins.");
    console.log(JSON.stringify(list,null,2));
  } else throw new Error("Use list, inspect --id ID, or new --kind KIND --id ID.");
}
