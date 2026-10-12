import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { auditTree } from "../scripts/audit-public.mjs";

test("public audit rejects internal paths and ticket identifiers", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "public-audit-"));
  const privatePath = ["", "Users", "example", "private"].join("/");
  const ticket = `${"CA"}-${1234}`;
  await writeFile(path.join(root, "bad.md"), `Internal source: ${privatePath} and ${ticket}`);
  const result = await auditTree(root);
  assert.equal(result.ok, false);
  assert.deepEqual(result.findings.map(item => item.rule).sort(), ["absolute-user-path", "internal-ticket"]);
});

test("folder sharing audit does not hide ignored runtime data, desktop metadata or symlinks",async()=>{
  const root=await mkdtemp(path.join(tmpdir(),"public-audit-folder-"));
  await mkdir(path.join(root,".workshop-runs"));
  await mkdir(path.join(root,"__pycache__"));
  await writeFile(path.join(root,".workshop-runs","attempts.json"),"{}");
  await writeFile(path.join(root,".DS_Store"),"metadata");
  await symlink(path.join(root,".DS_Store"),path.join(root,"linked"));
  const r=await auditTree(root);
  assert.equal(r.ok,false);
  assert.ok(r.findings.some(f=>f.rule==="runtime-artifact"));
  assert.ok(r.findings.some(f=>f.rule==="runtime-artifact"&&f.file==="__pycache__"));
  assert.ok(r.findings.some(f=>f.rule==="desktop-metadata"));
  assert.ok(r.findings.some(f=>f.rule==="symlink"));
});

test("public audit accepts a synthetic example address", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "public-audit-clean-"));
  await writeFile(path.join(root, "README.md"), "Contact workshop@example.com for the synthetic workshop.");
  const result = await auditTree(root);
  assert.equal(result.ok, true);
});
