const KEYS = ["intent", "session_ids", "needs_clarification", "clarification_question", "proposed_actions", "reply", "evidence"];
const INTENTS = new Set(["register", "change", "cancel", "question", "unknown"]);
const SAFE_ACTIONS = new Set(["hold_seat", "look_up_booking", "send_reply"]);
const validEvidence=value=>Array.isArray(value)&&value.every(v=>v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).sort().join(",")==="field,quote"&&typeof v.field==="string"&&KEYS.includes(v.field)&&typeof v.quote==="string"&&!!v.quote.trim());
export function validateContract(value) {
  const errors=[];
  if (!value || typeof value!=="object" || Array.isArray(value)) return {valid:false,errors:["Response must be an object."]};
  if (JSON.stringify(Object.keys(value).sort())!==JSON.stringify([...KEYS].sort())) errors.push("Response keys differ from the contract.");
  if (!INTENTS.has(value.intent)) errors.push("intent is not allowed.");
  for (const key of ["session_ids","proposed_actions"]) if (!Array.isArray(value[key]) || value[key].some(v=>typeof v!=="string") || new Set(value[key]).size!==value[key].length) errors.push(`${key} must contain unique strings.`);
  if(Array.isArray(value.proposed_actions)&&value.proposed_actions.some(a=>!SAFE_ACTIONS.has(a))) errors.push("proposed_actions contains an unknown action enum.");
  if (typeof value.needs_clarification!=="boolean") errors.push("needs_clarification must be boolean.");
  if (!(value.clarification_question===null || typeof value.clarification_question==="string")) errors.push("Invalid clarification question.");
  if (value.needs_clarification && !(typeof value.clarification_question==="string"&&value.clarification_question.trim())) errors.push("Clarification needs a question.");
  if (!value.needs_clarification && value.clarification_question!==null) errors.push("Unused clarification must be null.");
  if (typeof value.reply!=="string" || !value.reply.trim()) errors.push("reply must be nonempty.");
  if(!validEvidence(value.evidence)) errors.push("Evidence needs a contract field and a nonempty quote, without extra keys.");
  return {valid:errors.length===0,errors};
}
const same = (a,b)=>Array.isArray(a)&&Array.isArray(b)&&JSON.stringify(a)===JSON.stringify(b);
export async function grade(testCase,output,resources={}) {
  const contract=validateContract(output), expected=testCase.expected;
  const behavior=contract.valid && output.intent===expected.intent && same(output.session_ids,expected.session_ids) && output.needs_clarification===expected.needs_clarification && output.clarification_question===expected.clarification_question && same(output.proposed_actions,expected.proposed_actions);
  const grounded=validEvidence(output?.evidence) && typeof testCase.input==="string" && (!expected.evidence?.length || output.evidence.length>0) && output.evidence.every(v=>testCase.input.includes(v.quote));
  const known=resources.catalog ? new Set(JSON.parse(resources.catalog).sessions.map(s=>s.id)) : null;
  const protectedActions=contract.valid && output.proposed_actions.every(v=>SAFE_ACTIONS.has(v)) && !(output.needs_clarification&&output.proposed_actions.length) && (!known || output.session_ids.every(id=>known.has(id)));
  const checks=[
    {id:"contract",passed:contract.valid,hard:true,detail:contract.errors.join(" ")},
    {id:"behavior",passed:behavior,hard:false,detail:behavior?"Expected fields matched.":"Expected fields differed."},
    {id:"grounded_evidence",passed:grounded,hard:true,detail:"Evidence must quote the attendee message."},
    {id:"protected_actions",passed:protectedActions,hard:true,detail:"Only reviewable actions and known sessions; ambiguity blocks actions."}
  ];
  return {passed:checks.every(c=>c.passed),checks};
}
export default {apiVersion:1,metrics:[
  {id:"contract",hard:true,description:"Exact public JSON shape."},
  {id:"behavior",hard:false,description:"Expected decision fields match."},
  {id:"grounded_evidence",hard:true,description:"Evidence is present and verbatim in the message."},
  {id:"protected_actions",hard:true,description:"Only reviewable actions on known sessions; no action while ambiguous."}
],grade:({testCase,output,resources})=>grade(testCase,output,resources)};
