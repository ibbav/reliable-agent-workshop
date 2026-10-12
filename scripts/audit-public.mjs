import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const RULES = [
  { rule: "absolute-user-path", pattern: /\/(?:Users|home)\/[^\s"')]+/g },
  { rule: "temporary-path", pattern: /\/private\/tmp\/[^\s"')]+/g },
  { rule: "internal-ticket", pattern: /\b[A-Z]{2}-\d{3,}\b/g },
  { rule: "credential", pattern: /\b(?:sk-[A-Za-z0-9_-]{16,}|(?:api[_-]?key|token)\s*[:=]\s*["'](?!YOUR_|example)[^"']{8,}["'])/gi },
  { rule: "non-example-email", pattern: /\b[A-Z0-9._%+-]+@(?!example\.com\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/gi }
];
const TEXT_EXTENSIONS = new Set([".md", ".mjs", ".js", ".json", ".py", ".txt", ".yml", ".yaml", ".toml", ".html", ".css"]);
const IGNORED = new Set([".git", "node_modules", "__pycache__"]);

async function filesUnder(root, findings, current = root) {
  const files = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute);
    if(entry.isSymbolicLink()) {findings.push({rule:"symlink",file:relative,match:"Review or remove linked content before sharing."});continue;}
    if(entry.name===".DS_Store") findings.push({rule:"desktop-metadata",file:relative,match:"Desktop metadata is not distributable."});
    if(entry.name===".workshop-runs" || entry.name==="__pycache__" || relative==="talk/build") findings.push({rule:"runtime-artifact",file:relative,match:"Move generated evidence and caches outside the shared folder."});
    if(entry.name===".env" || entry.name.startsWith(".env.")) findings.push({rule:"environment-file",file:relative,match:"Environment files are not distributable."});
    if ([...IGNORED].some(value => relative === value || relative.startsWith(`${value}${path.sep}`))) continue;
    if (entry.isDirectory()) files.push(...await filesUnder(root, findings, absolute));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || entry.name === "LICENSE") files.push(absolute);
  }
  return files;
}

export async function auditTree(root) {
  const findings = [];
  for (const file of await filesUnder(root,findings)) {
    const content = await readFile(file, "utf8");
    for (const { rule, pattern } of RULES) {
      pattern.lastIndex = 0;
      for (const match of content.matchAll(pattern)) findings.push({ rule, file: path.relative(root, file), match: match[0] });
    }
  }
  return { ok: findings.length === 0, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await auditTree(path.resolve(process.argv[2] || "."));
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
