import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const references = [
  "anthropic_best_practices", "anti_patterns", "comparative_evaluation",
  "core_principles", "evaluation_agents", "main_agents", "model_configuration",
  "output_contracts", "prompt_structure", "quality_checklist",
  "regular_agent_process", "simulation_agents", "skills_and_tools"
];
const skills = ["intake", "draft", "refine", "simplify", "validate", "eval"];

test("the public toolkit includes substantial, linked principle references", async () => {
  const root = new URL("../toolkit/", import.meta.url);
  const orchestrator = await readFile(new URL("SKILL.md", root), "utf8");
  assert.match(orchestrator, /Valentina Ibba/);
  for (const name of references) {
    const body = await readFile(new URL(`references/${name}.md`, root), "utf8");
    assert.ok(body.split("\n").length >= 25, `${name} is too thin to teach its method`);
    assert.match(body, /conference|session/i, `${name} needs a synthetic example`);
    assert.match(body, /check|test|verify|review/i, `${name} needs an application check`);
  }
  for (const skill of skills) {
    const body = await readFile(new URL(`skills/${skill}/SKILL.md`, root), "utf8");
    assert.match(body, /references\//, `${skill} does not route to its reference material`);
    for (const link of body.matchAll(/\]\((\.\.\/\.\.\/references\/[^)]+)\)/g)) {
      assert.ok((await stat(new URL(link[1], new URL(`skills/${skill}/SKILL.md`, root)))).isFile());
    }
  }
});
