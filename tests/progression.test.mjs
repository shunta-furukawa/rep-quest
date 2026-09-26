import test from 'node:test';
import assert from 'node:assert/strict';
import { formVisibility,growth,STAGES } from '../public/progression.js';
import { createCharacter,emptyStore,validateStore,newActive,creditAmount,commitActive } from '../public/storage.js';
const make=()=>createCharacter('ルーン','#855037');
test('v2 migration assigns historical XP once to sword and retains active earned date',()=>{
 const s=make();delete s.jobs;delete s.job;s.xp=100;s.undatedXp=100;const store=emptyStore();store.slots[0]=s;store.selected=0;
 validateStore(store);assert.deepEqual(s.jobs,{sword:100,mage:0,rogue:0});validateStore(store);assert.equal(s.jobs.sword,100);
});
test('job switches retain separate XP and active set credits its original job exactly once',()=>{
 const s=make();s.job='mage';s.active=newActive('pushup',new Date('2026-09-26T10:00:00'),s.job);creditAmount(s.active,5);s.job='rogue';
 assert.equal(commitActive(s),50);assert.equal(commitActive(s),0);assert.deepEqual(s.jobs,{sword:0,mage:50,rogue:0});assert.equal(s.xp,50);
 const store=emptyStore();store.slots[0]=s;validateStore(store);
});
test('all five stages unlock at exact thresholds and medals reset for next rank',()=>{
 const s=make();STAGES.forEach((xp,i)=>{s.jobs.sword=xp;assert.equal(growth(s).stage,i);if(i){s.jobs.sword=xp-1;assert.equal(growth(s).stage,i-1);}});
 s.jobs.sword=9;assert.equal(growth(s).medals,0);s.jobs.sword=10;assert.equal(growth(s).medals,1);s.jobs.sword=400;assert.equal(growth(s).medals,0);
 s.jobs.sword=36000;assert.equal(growth(s).mastery,1);assert.ok(growth(s).reward.xp>36000);
});
test('backups reject missing, unknown or inconsistent job data',()=>{
 for(const bad of [{job:'warlock',jobs:{sword:0,mage:0,rogue:0}},{job:'mage',jobs:{sword:10,mage:0,rogue:0}},{job:'mage',jobs:{sword:0,mage:0}}]){
 const s=Object.assign(make(),bad),store=emptyStore();store.slots[0]=s;assert.throws(()=>validateStore(store));
 }
});
test('forms are revealed one step ahead: reached and next shown, later hidden', () => {
  assert.deepEqual([0,1,2,3,4].map(i => formVisibility(0, i)), ['reached', 'next', 'hidden', 'hidden', 'hidden']);
  assert.deepEqual([0,1,2,3,4].map(i => formVisibility(399, i)), ['reached', 'next', 'hidden', 'hidden', 'hidden']);
  assert.deepEqual([0,1,2,3,4].map(i => formVisibility(400, i)), ['reached', 'reached', 'next', 'hidden', 'hidden']);
  assert.deepEqual([0,1,2,3,4].map(i => formVisibility(24000, i)), ['reached', 'reached', 'reached', 'reached', 'reached']);
});
