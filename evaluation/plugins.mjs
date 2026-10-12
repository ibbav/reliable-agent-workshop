import { createHash } from "node:crypto";
import { readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const API_VERSION = 1;
export const hash = value => createHash("sha256").update(value).digest("hex");
const kinds = new Set(["agent", "grader", "transport", "reporter"]);
const functions = { agent:"prepare", grader:"grade", transport:"create", reporter:"write" };
// Node caches transitive imports. Refuse hot reload rather than record new hashes for old code.
const loadedFiles = new Map();
const numeric="(?:0|[1-9]\\d*)", prerelease="(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)";
const semanticVersion=new RegExp(`^${numeric}\\.${numeric}\\.${numeric}(?:-${prerelease}(?:\\.${prerelease})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

export async function inside(root, relative, message = "Path must stay inside the repository.") {
  if (typeof relative !== "string" || !relative || path.isAbsolute(relative)) throw new Error(message);
  const base = await realpath(root), candidate = path.resolve(base, relative);
  if (!candidate.startsWith(`${base}${path.sep}`)) throw new Error(message);
  const resolved = await realpath(candidate);
  if (!resolved.startsWith(`${base}${path.sep}`)) throw new Error(message);
  return resolved;
}

export async function discoverPlugins({ repoRoot, directories = ["plugins"], registrations = [] }) {
  const root = await realpath(repoRoot), manifests = new Set();
  for (const directory of directories) {
    let dir;
    try { dir = await inside(root,directory); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    for (const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      try { manifests.add(await inside(root,path.relative(root,path.join(dir,entry.name,"plugin.json")))); }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    }
  }
  for (const registration of registrations) manifests.add(await inside(root,registration));
  const entries = new Map();
  for (const manifestPath of [...manifests].sort()) {
    const text = await readFile(manifestPath,"utf8"), manifest = JSON.parse(text);
    if (manifest.api_version !== API_VERSION) throw new Error(`Unsupported plugin API version for ${manifest.id || "unnamed plugin"}. Expected ${API_VERSION}.`);
    if (!/^[a-z][a-z0-9.-]*$/.test(manifest.id || "") || !kinds.has(manifest.kind)) throw new Error("Plugin needs a valid id and kind.");
    if (!semanticVersion.test(manifest.version || "")) throw new Error(`Plugin ${manifest.id} needs a semantic version.`);
    if (entries.has(manifest.id)) throw new Error(`Duplicate plugin id: ${manifest.id}.`);
    const dir = path.dirname(manifestPath);
    const modulePath = await inside(dir,manifest.module,"Module must stay inside the plugin directory.");
    if (path.extname(modulePath) !== ".mjs") throw new Error("Plugin modules must be .mjs files.");
    if (manifest.files !== undefined && (!Array.isArray(manifest.files) || manifest.files.some(f=>typeof f!=="string"))) throw new Error("Plugin files must be relative file names.");
    const files = {[path.basename(manifestPath)]:hash(text)};
    for (const file of new Set([manifest.module,...(manifest.files || [])])) files[file] = hash(await readFile(await inside(dir,file)));
    entries.set(manifest.id,{manifest,manifestPath,modulePath,dir,files,loaded:null});
  }
  return {
    list: () => [...entries.values()].map(({manifest,manifestPath,files})=>({...manifest,manifest:path.relative(root,manifestPath),files:{...files}})),
    async load(id,kind) {
      const entry = entries.get(id);
      if (!entry || entry.manifest.kind !== kind) throw new Error(`Unknown ${kind} plugin: ${id}.`);
      for(const [file,fingerprint] of Object.entries(entry.files)) {
        const full=await inside(entry.dir,file);
        if(loadedFiles.has(full)&&loadedFiles.get(full)!==fingerprint) throw new Error("Plugin files changed after import; restart the process before evaluating the new version.");
      }
      if (!entry.loaded) entry.loaded = (await import(`${pathToFileURL(entry.modulePath).href}?sha=${entry.files[entry.manifest.module]}`)).default;
      for(const [file,fingerprint] of Object.entries(entry.files)) loadedFiles.set(await inside(entry.dir,file),fingerprint);
      const plugin=entry.loaded;
      if (plugin?.apiVersion !== API_VERSION || typeof plugin[functions[kind]] !== "function") throw new Error(`Invalid ${kind} plugin contract: ${id}.`);
      return {plugin,descriptor:{...entry.manifest,manifest:path.relative(root,entry.manifestPath),files:{...entry.files}}};
    },
    async unchanged(ids) {
      for (const id of ids) for (const [file,expected] of Object.entries(entries.get(id).files)) {
        try { if(hash(await readFile(await inside(entries.get(id).dir,file))) !== expected) return false; }
        catch { return false; }
      }
      return true;
    }
  };
}
