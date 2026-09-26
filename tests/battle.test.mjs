import test from 'node:test';
import assert from 'node:assert/strict';
import { defeats } from '../public/battle.js';
import { progress } from '../public/engine.js';
import { createCharacter,newActive,creditAmount,commitActive } from '../public/storage.js';
test('new classes start at zero; returning classes keep their levels and total XP',()=>{
 const s=createCharacter('ルーン','#855037');s.active=newActive('pushup',new Date(),'sword');creditAmount(s.active,35);commitActive(s);
 assert.deepEqual(progress(s.jobs.sword),{level:2,current:50,needed:300});s.job='mage';assert.equal(progress(s.jobs.mage).level,0);
 s.active=newActive('plank',new Date(),'mage');creditAmount(s.active,7);commitActive(s);
 assert.equal(s.jobs.mage,14);assert.equal(s.xp,364);s.job='sword';assert.equal(progress(s.jobs.sword).level,2);
});
test('kills reflect reps and complete five-second holds, without losing partial XP or double credit',()=>{
 assert.equal(defeats('pushup',11),11);assert.equal(defeats('squat',5),5);
 for(const [seconds,kills] of [[0,0],[4,0],[5,1],[9,1],[10,2],[12,2]])assert.equal(defeats('plank',seconds),kills);
 const s=createCharacter('ルーン','#855037');s.active=newActive('plank');creditAmount(s.active,12);creditAmount(s.active,12);
 assert.equal(commitActive(s),24);assert.equal(commitActive(s),0);assert.equal(s.history[0].amount,12);assert.equal(s.xp,24);
 assert.equal(progress(99).level,0);assert.deepEqual(progress(100),{level:1,current:0,needed:200});
});
