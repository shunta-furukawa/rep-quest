import test from 'node:test';
import assert from 'node:assert/strict';
import { BESTIARY, BONUS, CHAPTER_BOSSES, bossOf, chapterOf, ensureMotivation, resolveSet } from '../public/motivation.js';
import { bossState } from '../public/battle.js';
import { progress } from '../public/engine.js';
import { createCharacter, emptyStore, newActive, creditAmount, commitActive, validateStore } from '../public/storage.js';

const make = () => createCharacter('ルーン', '#855037', new Date(2026, 8, 1, 9));
const never = () => 1;
function workout(slot, mode, amount, at, rng = never) {
  slot.active = newActive(mode, at, slot.job); creditAmount(slot.active, amount, at);
  const base = commitActive(slot);
  return { base, report: resolveSet(slot, slot.history[0], rng) };
}
const check = slot => { const store = emptyStore(); store.slots[0] = slot; store.selected = 0; return validateStore(JSON.parse(JSON.stringify(store))); };

test('a boss that survives keeps its remaining HP for next time, then grows past the last effort', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  assert.deepEqual(s.bosses.pushup, { max: 5, hp: 5, count: 0, element: 0, rare: false });
  let { report } = workout(s, 'pushup', 3, new Date(2026, 8, 1, 10));
  assert.equal(report.boss.defeated, undefined); assert.equal(s.bosses.pushup.hp, 2); assert.equal(report.bonus, 0);
  ({ report } = workout(s, 'pushup', 6, new Date(2026, 8, 1, 11)));
  assert.equal(report.boss.defeated, true);
  assert.equal(report.bonus, BONUS.boss + 20 + BONUS.best); // 4 overkill reps at half XP and a new best (3 → 6)
  assert.deepEqual(s.bosses.pushup, { max: 7, hp: 7, count: 1, element: 0, rare: false });
  assert.equal(s.items['ルーンゼリー'], 1); assert.equal(s.history[0].boss, true);
  check(s);
});
test('live battle state matches the settled result', () => {
  assert.deepEqual(bossState({ hp: 4, max: 10 }, 3), { hp: 1, max: 10, defeated: false, overkill: 0 });
  assert.deepEqual(bossState({ hp: 4, max: 10 }, 7), { hp: 0, max: 10, defeated: true, overkill: 3 });
});
test('personal bests and previous-set comparison are reported per exercise', () => {
  const s = make();
  let { report } = workout(s, 'squat', 10, new Date(2026, 8, 1, 10));
  assert.equal(report.lines.some(l => l.text.includes('はじめての記録')), true); assert.equal(s.best.squat, 10);
  ({ report } = workout(s, 'squat', 8, new Date(2026, 8, 1, 11)));
  assert.equal(report.lines.some(l => l.text.includes('あと 2回')), true);
  ({ report } = workout(s, 'squat', 12, new Date(2026, 8, 1, 12)));
  assert.equal(report.lines.some(l => l.text === '前回比 +4回'), true);
  assert.equal(report.lines.some(l => l.xp === BONUS.best), true); assert.equal(s.best.squat, 12); assert.equal(s.best.pushup, 0);
});
test('rest days build a capped pool that doubles XP until spent, and training days add nothing', () => {
  const s = make();
  workout(s, 'pushup', 1, new Date(2026, 8, 1, 10));
  ensureMotivation(s, '2026-09-02'); assert.equal(s.rest.pool, 0);
  ensureMotivation(s, '2026-09-04'); assert.equal(s.rest.pool, 200); // 2nd and 3rd were idle
  ensureMotivation(s, '2026-09-04'); assert.equal(s.rest.pool, 200); // idempotent within a day
  ensureMotivation(s, '2026-09-20'); assert.equal(s.rest.pool, BONUS.restCap);
  const { base, report } = workout(s, 'squat', 20, new Date(2026, 8, 20, 10));
  assert.equal(base, 200); assert.equal(report.lines.find(l => l.text.startsWith('休息')).xp, 200); assert.equal(s.rest.pool, 100);
  check(s);
});
test('the daily request completes once from the day total and pays its bonus', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  const q = s.quest, [y, m, d] = q.day.split('-').map(Number), at = h => new Date(y, m - 1, d, h);
  assert.equal(q.done, false); assert.ok(q.target > 0);
  let { report } = workout(s, q.mode, q.target - 1, at(10));
  assert.equal(s.quest.done, false);
  ({ report } = workout(s, q.mode, 1, at(11)));
  assert.equal(s.quest.done, true); assert.equal(report.lines.some(l => l.xp === BONUS.quest), true);
  ({ report } = workout(s, q.mode, 5, at(12)));
  assert.equal(report.lines.some(l => l.xp === BONUS.quest), false);
  ensureMotivation(s, '2026-09-02'); assert.equal(s.quest.day, '2026-09-02'); assert.equal(s.quest.done, false);
});
test('bonus XP stays consistent across job, total, day and history, and backups validate it', () => {
  const s = make(); s.job = 'mage';
  const { base, report } = workout(s, 'pushup', 9, new Date(2026, 8, 1, 10), () => 0);
  assert.ok(report.drops.includes('星のかけら'));
  assert.equal(s.xp, base + report.bonus); assert.equal(s.jobs.mage, s.xp); assert.equal(s.history[0].xp, s.xp);
  assert.equal(s.daily['2026-09-01'].bonus, report.bonus);
  check(s);
  const broken = JSON.parse(JSON.stringify(s)); broken.daily['2026-09-01'].bonus += 1;
  assert.throws(() => check(broken));
  const badBoss = JSON.parse(JSON.stringify(s)); badBoss.bosses.pushup.hp = badBoss.bosses.pushup.max + 1;
  assert.throws(() => check(badBoss));
});
test('chapters advance by defeated bosses, not by splitting sets, and never simply loop', () => {
  const s = make();
  for (let i = 0; i < 5; i++) workout(s, 'pushup', 1, new Date(2026, 8, 1, 10 + i));
  assert.equal(chapterOf(s).chapter, 0);
  s.bosses.squat.count = CHAPTER_BOSSES * 6;
  assert.match(chapterOf(s).name, /深層1/);
});
test('existing saves gain bosses from their last set and keep valid totals', () => {
  const s = make(); s.history = [{ mode: 'plank', amount: 40, xp: 80, date: '2026-08-30T10:00:00Z' }]; s.daily = { '2026-08-30': { xp: 80, byMode: { plank: { amount: 40, xp: 80 } } } };
  s.xp = 80; s.jobs.sword = 80; s.sets = 1;
  ensureMotivation(s, '2026-09-01');
  assert.equal(s.best.plank, 40); assert.equal(s.bosses.plank.max, 45); assert.equal(s.rest.pool, 100); // the 31st was idle
  check(s);
});
test('level cost is capped so later levels remain reachable', () => {
  assert.equal(progress(1000).level, 4); assert.equal(progress(1500).needed, 500); assert.equal(progress(1500 + 500 * 10).level, 15);
});
test('each region brings its own variants, golden rares pay extra, and defeats fill the bestiary', () => {
  assert.equal(BESTIARY.length, 21); assert.equal(new Set(BESTIARY.map(m => m.id)).size, 21); assert.equal(new Set(BESTIARY.map(m => m.name)).size, 21);
  const s = make(); ensureMotivation(s, '2026-09-01');
  assert.equal(bossOf(s, 'squat').name, 'ルーンスライム'); assert.equal(bossOf(s, 'squat').isNew, true);
  let { report } = workout(s, 'squat', 8, new Date(2026, 8, 1, 10));
  assert.equal(s.dex['slime-0'], 1); assert.equal(report.boss.discovered, true); assert.equal(bossOf(s, 'squat').name, '夜羽のコウモリ');
  workout(s, 'squat', 30, new Date(2026, 8, 1, 11));
  ({ report } = workout(s, 'squat', 40, new Date(2026, 8, 1, 12), () => 0)); // third defeat opens the highland; the next boss is golden
  assert.equal(report.chapterUp, true); assert.equal(chapterOf(s).region, 1);
  assert.equal(s.bosses.squat.element, 1); assert.equal(s.bosses.squat.rare, true); assert.equal(bossOf(s, 'squat').name, '黄金スライム');
  assert.equal(bossOf(s, 'pushup').name, 'ルーンスライム'); // a waiting boss keeps the region it spawned in
  ({ report } = workout(s, 'squat', 50, new Date(2026, 8, 1, 13)));
  assert.ok(report.lines.some(l => l.xp === BONUS.rare)); assert.ok(report.drops.includes('星のかけら')); assert.equal(s.dex['slime-rare'], 1);
  assert.equal(bossOf(s, 'squat').name, '疾風のコウモリ'); assert.equal(bossOf(s, 'squat').rare, false);
  check(s);
  const bad = JSON.parse(JSON.stringify(s)); bad.dex['dragon-0'] = 1; assert.throws(() => check(bad));
  const badElement = JSON.parse(JSON.stringify(s)); badElement.bosses.squat.element = 9; assert.throws(() => check(badElement));
});
test('saves from before variants keep forest bosses and backfill the bestiary from defeat counts', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  for (const b of Object.values(s.bosses)) { delete b.element; delete b.rare; } delete s.dex;
  s.bosses.pushup.count = 2;
  ensureMotivation(s, '2026-09-01');
  assert.deepEqual(s.dex, { 'slime-0': 1, 'bat-0': 1 }); assert.equal(s.bosses.pushup.element, 0); assert.equal(bossOf(s, 'pushup').name, '苔石のゴーレム');
  check(s);
});
