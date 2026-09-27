import test from 'node:test';
import assert from 'node:assert/strict';
import { BESTIARY, BONUS, CHAPTER_BOSSES, FAMILIES, REGION_POOLS, chooseFamily, fullBodyProgress, validateMotivation, bossOf, chapterOf, ensureMotivation, resolveSet } from '../public/motivation.js';
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
  assert.deepEqual(s.bosses.pushup, { max: 5, hp: 5, count: 0, element: 0, rare: false, family: 'slime' });
  let { report } = workout(s, 'pushup', 3, new Date(2026, 8, 1, 10));
  assert.equal(report.boss.defeated, undefined); assert.equal(s.bosses.pushup.hp, 2); assert.equal(report.bonus, 0);
  ({ report } = workout(s, 'pushup', 6, new Date(2026, 8, 1, 11)));
  assert.equal(report.boss.defeated, true);
  assert.equal(report.bonus, BONUS.boss + 20 + BONUS.best); // 4 overkill reps at half XP and a new best (3 → 6)
  assert.deepEqual(s.bosses.pushup, { max: 7, hp: 7, count: 1, element: 0, rare: false, family: 'dragon' });
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
  assert.equal(BESTIARY.length, 63); assert.equal(new Set(BESTIARY.map(m => m.id)).size, 63); assert.equal(new Set(BESTIARY.map(m => m.name)).size, 63);
  const s = make(); ensureMotivation(s, '2026-09-01');
  assert.equal(bossOf(s, 'squat').name, 'ルーンスライム'); assert.equal(bossOf(s, 'squat').isNew, true);
  let { report } = workout(s, 'squat', 8, new Date(2026, 8, 1, 10));
  assert.equal(s.dex['slime-0'], 1); assert.equal(report.boss.discovered, true); assert.equal(bossOf(s, 'squat').name, '碧鱗の幼竜');
  workout(s, 'squat', 30, new Date(2026, 8, 1, 11));
  ({ report } = workout(s, 'squat', 40, new Date(2026, 8, 1, 12), () => 0)); // third defeat opens the highland; the next boss is golden
  assert.equal(report.chapterUp, true); assert.equal(chapterOf(s).region, 1);
  assert.equal(s.bosses.squat.element, 1); assert.equal(s.bosses.squat.rare, true); assert.equal(bossOf(s, 'squat').name, '黄金の狼');
  assert.equal(bossOf(s, 'pushup').name, 'ルーンスライム'); // a waiting boss keeps the region it spawned in
  ({ report } = workout(s, 'squat', 50, new Date(2026, 8, 1, 13)));
  assert.ok(report.lines.some(l => l.xp === BONUS.rare)); assert.ok(report.drops.includes('星のかけら')); assert.equal(s.dex['wolf-rare'], 1);
  assert.equal(bossOf(s, 'squat').name, '疾風の幼竜'); assert.equal(bossOf(s, 'squat').rare, false);
  check(s);
  const bad = JSON.parse(JSON.stringify(s)); bad.dex['unknown-0'] = 1; assert.throws(() => check(bad));
  const badElement = JSON.parse(JSON.stringify(s)); badElement.bosses.squat.element = 9; assert.throws(() => check(badElement));
});
test('saves from before variants keep forest bosses and backfill the bestiary from defeat counts', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  for (const b of Object.values(s.bosses)) { delete b.element; delete b.rare; delete b.family; } delete s.dex;
  s.bosses.pushup.count = 2;
  ensureMotivation(s, '2026-09-01');
  assert.deepEqual(s.dex, { 'slime-0': 1, 'bat-0': 1 }); assert.equal(s.bosses.pushup.element, 0); assert.equal(bossOf(s, 'pushup').name, '苔石のゴーレム');
  check(s);
});


test('legacy family migration uses the frozen count % 3 rotation and is idempotent', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  for (const [mode, count] of [['pushup', 4], ['squat', 8], ['plank', 9]]) {
    Object.assign(s.bosses[mode], { count, hp: 2, element: 3, rare: true });
    delete s.bosses[mode].family;
  }
  s.dex = { 'slime-0': 2, 'bat-rare': 1 };
  validateMotivation(s);ensureMotivation(s, '2026-09-01');
  assert.deepEqual(['pushup','squat','plank'].map(m => s.bosses[m].family), ['bat','golem','slime']);
  assert.deepEqual(s.dex, { 'slime-0': 2, 'bat-rare': 1 });
  const before=JSON.stringify(s);ensureMotivation(s, '2026-09-01');assert.equal(JSON.stringify(s),before);check(s);
});
test('carried bosses retain family, region, rarity and HP across reload and another mode changing region', () => {
  const s=make();ensureMotivation(s,'2026-09-01');
  Object.assign(s.bosses.pushup,{family:'mushroom',element:0,rare:true});
  workout(s,'pushup',2,new Date(2026,8,1,10));
  const before=bossOf(s,'pushup');assert.equal(before.hp,3);
  s.bosses.squat.count=2;workout(s,'squat',8,new Date(2026,8,1,11),()=>0);
  assert.equal(chapterOf(s).region,1);
  const restored=check(s).slots[0];ensureMotivation(restored,'2026-09-01');assert.deepEqual(bossOf(restored,'pushup'),before);
  const {report}=workout(restored,'pushup',1,new Date(2026,8,1,12));
  assert.equal(report.boss.id,'mushroom-rare');assert.equal(restored.bosses.pushup.family,'mushroom');assert.equal(restored.bosses.pushup.hp,2);
});
test('regional weighted pools select all native and visiting families using injected RNG', () => {
  assert.deepEqual(REGION_POOLS.map(pool=>pool.slice(0,3).map(e=>e.family)),[
    ['slime','mushroom','bat'],['wolf','bat','golem'],['wisp','wolf','golem'],
    ['skeleton','mimic','wisp'],['dragon','golem','skeleton'],['dragon','wisp','mimic'],
  ]);
  REGION_POOLS.forEach((pool,region)=>{
    const total=pool.reduce((n,e)=>n+e.weight,0);let offset=0;
    assert.equal(new Set(pool.map(e=>e.family)).size,FAMILIES.length);
    for(const e of pool){
      const roll=(offset+e.weight/2)/total;offset+=e.weight;
      assert.equal(chooseFamily(region,()=>roll),e.family);
      const s=make();ensureMotivation(s,'2026-09-01');s.bosses.squat.count=region*CHAPTER_BOSSES;
      const rolls=[1,roll,1];const {report}=workout(s,'pushup',5,new Date(2026,8,1,10),()=>rolls.shift());
      assert.equal(s.bosses.pushup.family,e.family);assert.equal(report.next.id,`${e.family}-${region}`);assert.equal(s.bosses.pushup.element,region);
    }
  });
});
test('all old and new dex IDs validate; corrupt IDs or saved families are rejected', () => {
  const s=make();ensureMotivation(s,'2026-09-01');
  s.dex=Object.fromEntries(BESTIARY.map(m=>[m.id,1]));validateMotivation(s);check(s);
  assert.equal(new Set(BESTIARY.map(m=>m.drop)).size,BESTIARY.length);
  for(const id of ['slime-0','bat-5','golem-rare','dragon-0','mushroom-rare'])assert.ok(s.dex[id]);
  for(const id of ['unknown-0','slime-6','wolf-gold','__proto__']){
    const bad=JSON.parse(JSON.stringify(s));Object.defineProperty(bad.dex,id,{value:1,enumerable:true});assert.throws(()=>validateMotivation(bad));
  }
  for(const family of ['unknown',null,4,{},'__proto__']){
    const bad=JSON.parse(JSON.stringify(s));bad.bosses.pushup.family=family;assert.throws(()=>check(bad));
  }
});
test('pre-dex backups backfill only the original three families even after many rotations', () => {
  const s=make();ensureMotivation(s,'2026-09-01');
  s.bosses.pushup.count=10;s.bosses.squat.count=5;s.bosses.plank.count=0;
  for(const b of Object.values(s.bosses))delete b.family;
  delete s.dex;ensureMotivation(s,'2026-09-01');
  assert.deepEqual(s.dex,{'slime-0':6,'bat-0':5,'golem-0':4});
  assert.equal(s.bosses.pushup.family,'bat');assert.equal(s.bosses.squat.family,'golem');
});
test('superman is a timed exercise with its own boss, best and credited seconds', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  assert.deepEqual(s.bosses.superman, { max: 15, hp: 15, count: 0, family: 'slime', element: 0, rare: false });
  const { base, report } = workout(s, 'superman', 20, new Date(2026, 8, 1, 10));
  assert.equal(base, 40); assert.equal(report.boss.defeated, true); assert.equal(s.best.superman, 20);
  assert.equal(s.daily['2026-09-01'].byMode.superman.amount, 20);
  check(s);
});
test('saves from before superman load, validate and gain the new exercise', () => {
  const s = make(); ensureMotivation(s, '2026-09-01');
  delete s.best.superman; delete s.bosses.superman;
  check(s); // restoring an older backup must not be rejected
  ensureMotivation(s, '2026-09-01');
  assert.equal(s.best.superman, 0); assert.equal(s.bosses.superman.hp, 15); assert.equal(s.best.pushup, 0);
  check(s);
});
test('doing every exercise on one day pays the full-body bonus once', () => {
  const s = make(); const at = h => new Date(2026, 8, 1, h);
  workout(s, 'pushup', 3, at(9)); workout(s, 'squat', 3, at(10)); workout(s, 'plank', 10, at(11));
  assert.deepEqual(fullBodyProgress(s, '2026-09-01').done, ['pushup', 'squat', 'plank']);
  let { report } = workout(s, 'superman', 10, at(12));
  assert.ok(report.lines.some(l => l.xp === BONUS.fullBody)); assert.equal(fullBodyProgress(s, '2026-09-01').awarded, true);
  ({ report } = workout(s, 'pushup', 3, at(13)));
  assert.equal(report.lines.some(l => l.xp === BONUS.fullBody), false);
  ({ report } = workout(s, 'superman', 5, new Date(2026, 8, 2, 9)));
  assert.equal(report.lines.some(l => l.xp === BONUS.fullBody), false); assert.equal(fullBodyProgress(s, '2026-09-02').done.length, 1);
  check(s);
  const bad = JSON.parse(JSON.stringify(s)); bad.fullBody = 'yesterday'; assert.throws(() => check(bad));
});
test('bestiary totals count discoveries, every defeat and golden rares', async () => {
  const { dexStats, REGIONS } = await import('../public/motivation.js');
  assert.deepEqual(dexStats({}), { found: 0, total: BESTIARY.length, defeats: 0, rares: 0 });
  assert.deepEqual(dexStats({ 'slime-0': 3, 'wolf-1': 1, 'bat-rare': 2 }), { found: 3, total: BESTIARY.length, defeats: 6, rares: 2 });
  assert.equal(BESTIARY.filter(m => m.region === 0).length, FAMILIES.length);
  assert.equal(BESTIARY.filter(m => m.rare).every(m => m.region === null), true);
  assert.equal(REGIONS.length, 6);
});
test('every region has a story and backdrop id, and the destination wraps into deeper strata', async () => {
  const { REGION_STORY, destinationOf } = await import('../public/story.js');
  const { REGIONS } = await import('../public/motivation.js');
  assert.equal(REGION_STORY.length, REGIONS.length);
  assert.equal(new Set(REGION_STORY.map(r => r.id)).size, REGIONS.length);
  assert.ok(REGION_STORY.every(r => /^[a-z]+$/.test(r.id) && r.arrival && r.cleared && r.title));
  assert.deepEqual(destinationOf(0), { region: 1, depth: 0 });
  assert.deepEqual(destinationOf(5), { region: 0, depth: 1 });
  assert.deepEqual(destinationOf(6), { region: 1, depth: 1 });
});
test('map regions report visited, cleared, current and next through the first loop and into the depths', async () => {
  const { regionState, MAP_POINTS, REGION_STORY } = await import('../public/story.js');
  assert.equal(MAP_POINTS.length, REGION_STORY.length);
  assert.ok(MAP_POINTS.every(([x, y]) => x > 0 && x < 100 && y > 0 && y < 100));
  assert.deepEqual(regionState(2, 1), { visited: true, cleared: true, current: false, next: false, depth: 0 });
  assert.deepEqual(regionState(2, 2), { visited: true, cleared: false, current: true, next: false, depth: 0 });
  assert.deepEqual(regionState(2, 3), { visited: false, cleared: false, current: false, next: true, depth: 0 });
  assert.equal(regionState(5, 0).next, true); // from the summit the road leads back into the depths
  assert.deepEqual(regionState(6, 3), { visited: true, cleared: true, current: false, next: false, depth: 1 });
});
