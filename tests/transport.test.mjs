import test from "node:test";
import assert from "node:assert/strict";
import { createLiveTransport } from "../evaluation/transport.mjs";

test("live transport requires explicit connection details and a call ceiling", () => {
  assert.throws(() => createLiveTransport({}), /endpoint, model, and shell-provided key/);
  const placeholder = `place${"holder"}`;
  assert.throws(() => createLiveTransport({ endpoint: "https://example.com/v1", model: "example", apiKey: placeholder, maxCalls: 0 }), /maximum call count/);
});

test("live transport sends prepared input, enforces ceiling and uses no automatic retry",async()=>{
  const original=globalThis.fetch,calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    return {ok:true,json:async()=>({choices:[{message:{content:'{"ok":true}'}}]})};
  };
  try {
    const transport=createLiveTransport({endpoint:"https://example.com/v1",model:"synthetic",apiKey:"example_key",maxCalls:1});
    assert.deepEqual(await transport({testCase:{input:"raw"},input:"prepared with catalog",prompt:"rules"}),{ok:true});
    assert.equal(JSON.parse(calls[0].options.body).messages[1].content,"prepared with catalog");
    assert.equal(calls[0].options.redirect,"error");
    await assert.rejects(()=>transport({testCase:{input:"raw"},prompt:"rules"}),/Maximum call count/);
    assert.equal(calls.length,1);
  } finally {globalThis.fetch=original;}
});

test("live transport rejects unsafe endpoints and aborts timeouts without a real request",async()=>{
  const options={model:"synthetic",apiKey:"example_key",maxCalls:1};
  for(const endpoint of ["http://example.com/v1","https://user:password@example.com/v1","https://example.com/v1?secret=value"]) assert.throws(()=>createLiveTransport({...options,endpoint}),/HTTPS endpoint/);
  const original=globalThis.fetch;
  globalThis.fetch=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener("abort",()=>reject(new Error("aborted")),{once:true}));
  try {
    await assert.rejects(()=>createLiveTransport({...options,endpoint:"https://example.com/v1",timeoutMs:5})({testCase:{input:"raw"},prompt:"rules"}),/aborted/);
  } finally {globalThis.fetch=original;}
});
