function fixtures(resources,options) {
  const value=JSON.parse(resources[options.resource||"replay"]);
  if (!value.outputs || typeof value.outputs!=="object") throw new Error("Replay needs authored outputs.");
  return value.outputs;
}
export default {apiVersion:1,sourceType:"offline_fixture",network:false,
  validate({resources,options,cases}) {
    const outputs=fixtures(resources,options);
    for(const c of cases) for(const v of ["a","b"]) {
      const d=outputs[c.id]?.[v];
      if(!d || !(Object.hasOwn(d,"output") || d.use_expected===true)) throw new Error(`Missing authored fixture: ${c.id}/${v}.`);
    }
  },
  create({resources,options}) {
    const outputs=fixtures(resources,options);
    return async ({testCase,variant})=>{
      const d=outputs[testCase.id]?.[variant];
      if(!d) throw new Error("Missing authored fixture.");
      return structuredClone(Object.hasOwn(d,"output")?d.output:{...(d.use_expected?testCase.expected:{}),...(d.overrides||{})});
    };
  }
};
