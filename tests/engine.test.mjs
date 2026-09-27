import test from 'node:test';import assert from 'node:assert/strict';import {progress,validateSave,RepDetector} from '../public/engine.js';
test('XP thresholds carry over across multiple levels',()=>{assert.deepEqual(progress(0),{level:0,current:0,needed:100});assert.deepEqual(progress(350),{level:2,current:50,needed:300});});
test('rest and invalid sensor samples never count',()=>{const d=new RepDetector();for(let t=0;t<10000;t+=20)assert.equal(d.feed({x:0,y:9.81+Math.sin(t)*.05,z:0},t),false);assert.equal(d.feed({x:null,y:1,z:0},11000),false);});
test('full squat motion counts once, half motion does not',()=>{const d=new RepDetector(.9);let count=0,t=0;const feed=(a,n)=>{for(let i=0;i<n;i++){count+=+d.feed({x:0,y:9.81+a,z:0},t);t+=20;}};feed(0,70);feed(-2.8,20);feed(2.8,20);feed(0,15);assert.equal(count,0);feed(2.8,20);feed(-2.8,20);feed(0,50);assert.equal(count,1);feed(0,50);assert.equal(count,1);});
test('invalid restore is rejected',()=>{assert.throws(()=>validateSave({version:1,xp:-1,sets:0,history:[]}));assert.throws(()=>validateSave({version:1,xp:0,sets:0,history:[{mode:'bad'}]}));assert.equal(validateSave({version:1,xp:0,sets:0,history:[]}).xp,0);});
// A slow rep: gentle push down, a long glide, then the turn and the stop at the top.
function slowRep(d, amp, glideSamples) {
  let count = 0, t = 0; const feed = (a, n) => { for (let i = 0; i < n; i++) { count += +d.feed({ x: 0, y: 9.81 + a, z: 0 }, t); t += 20; } };
  feed(0, 70); feed(-amp, 20); feed(0, glideSamples); feed(amp, 40); feed(0, 15); feed(-amp, 20); feed(0, 60);
  return count;
}
test('slow squat technique counts gentle reps that the standard threshold ignores', () => {
  assert.equal(slowRep(new RepDetector(.9), .8, 130), 0);
  assert.equal(slowRep(new RepDetector(.9 * .6), .8, 130), 1);
});
test('longer rep windows count slow single-leg reps that the default window drops', () => {
  assert.equal(slowRep(new RepDetector(.9), 2, 330), 0); // about 8 seconds from start to stop
  assert.equal(slowRep(new RepDetector(.9, { maxMs: 9000 }), 2, 330), 1);
});
