import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppUpdates} from '../public/updates.js';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const worker=new EventTarget();worker.postMessage=message=>worker.message=message;
 const reg=new EventTarget();reg.waiting=worker;reg.update=async()=>{};
 const sw=new EventTarget();sw.controller={};sw.register=async()=>reg;
 const button={classList:{toggle(){}},setAttribute(){}};let busy=false,reloads=0;const notices=[];
 const app=createAppUpdates({serviceWorker:sw,button,notify:s=>notices.push(s),isBusy:()=>busy,reload:()=>reloads++});
 return{app,worker,reg,sw,button,notices,busy:v=>busy=v,reloads:()=>reloads};
}
test('waiting update activates only on tap and reloads after controller changes',async()=>{
 const x=setup();await flush();assert.equal(x.button.textContent,'更新する');assert.equal(x.reloads(),0);
 x.button.onclick();assert.deepEqual(x.worker.message,{type:'ACTIVATE_UPDATE'});assert.equal(x.reloads(),0);
 x.sw.dispatchEvent(new Event('controllerchange'));assert.equal(x.reloads(),1);
});
test('exercise and another tab updating never force a reload',async()=>{
 const x=setup();await flush();x.busy(true);x.app.refresh();assert.equal(x.button.disabled,true);x.button.onclick();assert.equal(x.worker.message,undefined);
 x.sw.dispatchEvent(new Event('controllerchange'));assert.equal(x.reloads(),0);
 x.busy(false);x.app.refresh();assert.equal(x.button.disabled,false);x.button.onclick();assert.equal(x.reloads(),1);
});
test('offline check is recoverable and a later install exposes the update',async()=>{
 const x=setup();await flush();x.reg.waiting=null;x.reg.update=async()=>{throw Error('offline');};await x.app.check(true);assert.match(x.notices.at(-1),/オンライン/);assert.equal(x.button.disabled,false);
 const worker=new EventTarget();worker.state='installing';x.reg.installing=worker;x.reg.dispatchEvent(new Event('updatefound'));
 x.reg.waiting=worker;worker.state='installed';worker.dispatchEvent(new Event('statechange'));assert.equal(x.button.textContent,'更新する');
});
