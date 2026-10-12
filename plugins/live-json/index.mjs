export function createLiveTransport({endpoint,model,apiKey,maxCalls,timeoutMs=60000,settings={temperature:0}}) {
  if(!endpoint||!model||!apiKey) throw new Error("Live transport requires an endpoint, model, and shell-provided key.");
  const url=new URL(endpoint);
  if(url.protocol!=="https:" || url.username || url.password || url.search || url.hash) throw new Error("Use an HTTPS endpoint without credentials or query parameters.");
  if(!Number.isSafeInteger(maxCalls)||maxCalls<1) throw new Error("Live transport requires a positive integer maximum call count.");
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0) throw new Error("Timeout must be positive.");
  if(Object.keys(settings).some(k=>!["temperature","top_p","max_tokens","seed"].includes(k))) throw new Error("Unsupported model setting.");
  let calls=0;
  return async ({testCase,prompt,input})=>{
    if(++calls>maxCalls) throw new Error("Maximum call count exceeded.");
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const response=await fetch(`${endpoint.replace(/\/$/,"")}/chat/completions`,{
        method:"POST",signal:controller.signal,redirect:"error",
        headers:{"content-type":"application/json",authorization:`Bearer ${apiKey}`},
        body:JSON.stringify({...settings,model,response_format:{type:"json_object"},messages:[{role:"system",content:prompt},{role:"user",content:input??testCase.input}]})
      });
      if(!response.ok) throw new Error(`Model endpoint returned HTTP ${response.status}.`);
      const body=await response.json();
      return JSON.parse(body.choices?.[0]?.message?.content||"null");
    } finally {clearTimeout(timer);}
  };
}
export default {apiVersion:1,sourceType:"live_model",network:true,create:({runtime})=>createLiveTransport(runtime)};
