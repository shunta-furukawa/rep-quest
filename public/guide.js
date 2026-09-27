import { techOf } from './techniques.js';

// Pre-set guidance: a setup card shown before starting, then one short cue per countdown second.
// Where the phone goes depends on the exercise; the form and the cues come from each technique.
// Art: /art/guide/<technique>.webp (and -2 for a second frame), falling back to the exercise's art.
export const PHONE = {
  pushup: '胸の真下の床に、画面を上にして置く',
  squat: '胸の前で両手で持ち、画面を自分に向ける',
  plank: '顔の前の床に置く',
  superman: '顔の前の床に置く',
};
export function guideFor(id) {
  const t = techOf(id);
  return { phone: PHONE[t.mode], form: t.form, cues: t.cues, name: t.name, mode: t.mode };
}
// The countdown lasts one second per cue: 3 for standing exercises, 5 for the floor holds.
export const countdownOf = id => techOf(id).cues.length;
export function cueAt(id, elapsedMs) {
  const cues = techOf(id).cues;
  return cues[Math.min(cues.length - 1, Math.max(0, Math.floor(elapsedMs / 1000)))];
}
