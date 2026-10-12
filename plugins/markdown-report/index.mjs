import {writeFile} from "node:fs/promises";
import path from "node:path";
export default {apiVersion:1,async write({outputDir,result:{manifest:m,summary:s}}) {
  const lines=["# Evaluation report","",`This report compares two prompt versions for ${m.example}.`,"",
    `The plan is ${Object.keys(m.prepared_inputs).length} cases × ${m.repeats} repeats × 2 versions = ${m.planned_calls} attempts. Completed attempts: ${s.attempts}.`,"",
    s.replay_only?"These are authored offline fixtures, not measured model performance. Repeating them does not create independent evidence.":"These are live-model observations. Raw counts alone do not establish improvement; use the paired Bayesian analysis and sensitivity checks.","",
    "Read each count as passes divided by all attempts for that version, including failures.","",
    "| Check | Baseline | Candidate |","| --- | --- | --- |"];
  for(const [id,v] of Object.entries(s.binary)) lines.push(`| ${id} | ${v.a.passed}/${v.a.total} | ${v.b.passed}/${v.b.total} |`);
  for(const [split,metrics] of Object.entries(s.by_split)) {
    lines.push("",`## ${split}`,"");
    for(const [id,v] of Object.entries(metrics)) lines.push(`- ${id}: baseline ${v.a.passed}/${v.a.total}; candidate ${v.b.passed}/${v.b.total}.`);
  }
  lines.push("","## Honesty notes","",`Transport failures: baseline ${s.model_failures.a}; candidate ${s.model_failures.b}. Grading failures: baseline ${s.grading_failures.a}; candidate ${s.grading_failures.b}.`,"",
    `Candidate protected checks passed: ${s.candidate_gate.protected_passed}. Review state: ${s.candidate_gate.decision}. This is not release approval.`,"",
    "Held-out cases are a teaching split in these public examples; they are visible in the repository. A real project must freeze a separate unseen set.","",
    "The manifest records prompt, case, resource, and declared plugin-file hashes. Review raw attempts before sharing; model output can contain private input.");
  await writeFile(path.join(outputDir,"report.md"),lines.join("\n")+"\n",{flag:"wx"});
}};
