export function summarize({plannedCalls,attempts,variants,metrics,execute,sourceType,network,coverage,inputsUnchanged}) {
  function counts(rows) {
    return Object.fromEntries(metrics.map(m=>[m.id,Object.fromEntries(variants.map(v=>{
      const relevant=rows.filter(a=>a.variant===v.id);
      return [v.id,{passed:relevant.filter(a=>a.checks.find(c=>c.id===m.id)?.passed).length,total:relevant.length}];
    }))]));
  }
  const pairs=new Map();
  for(const a of attempts) {
    const key=JSON.stringify([a.case_id,a.repeat]),pair=pairs.get(key)||{};
    if(pair[a.variant]) throw new Error("Duplicate paired attempt.");
    pair[a.variant]=a;pairs.set(key,pair);
  }
  const paired=Object.fromEntries(metrics.map(m=>{
    const count={both_pass:0,a_only:0,b_only:0,both_fail:0};
    for(const {a,b} of pairs.values()) {
      if(!a||!b) throw new Error("Incomplete paired run.");
      const ap=a.checks.find(c=>c.id===m.id).passed,bp=b.checks.find(c=>c.id===m.id).passed;
      count[ap?(bp?"both_pass":"a_only"):(bp?"b_only":"both_fail")]+=1;
    }
    return [m.id,count];
  }));
  const candidate=attempts.filter(a=>a.variant==="b");
  const hardFailures=candidate.filter(a=>!a.error&&a.checks.some(c=>c.hard&&!c.passed)).length;
  const candidateErrors=candidate.filter(a=>a.error).length;
  const countErrors=kind=>Object.fromEntries(variants.map(v=>[v.id,attempts.filter(a=>a.variant===v.id&&a.error?.kind===kind).length]));
  const protectedPassed=execute&&inputsUnchanged&&hardFailures===0&&candidateErrors===0;
  return {status:execute?"complete":"dry-run",planned_calls:plannedCalls,attempts:attempts.length,
    identical_prompts:variants[0].prompt===variants[1].prompt,replay_only:sourceType==="offline_fixture",
    network_calls:network?attempts.length:0,coverage,binary:counts(attempts),
    by_split:Object.fromEntries(Object.keys(coverage.splits).map(s=>[s,counts(attempts.filter(a=>a.split===s))])),paired,
    model_failures:countErrors("transport_error"),grading_failures:countErrors("grading_error"),candidate_hard_failures:hardFailures,
    candidate_gate:{protected_passed:protectedPassed,unverified_attempts:candidateErrors,inputs_unchanged:inputsUnchanged,
      decision:!execute?"not_run":!protectedPassed?"blocked":sourceType==="offline_fixture"?"illustration_only":"human_and_statistical_review_required"}};
}
