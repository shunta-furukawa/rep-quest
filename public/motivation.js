import { MODES, localDate } from './engine.js';
import { grantJobXp, validJob } from './progression.js';

// Per-mode bosses, personal bests, rested XP, a daily request and drops.
// Bonus XP is recorded per day as `bonus`, so daily and job totals stay consistent.
// Never expand this migration list: pre-v0.9 saves used count % 3.
const LEGACY_FAMILIES = ['slime', 'bat', 'golem'];
export const FAMILIES = [...LEGACY_FAMILIES, 'mushroom', 'wolf', 'skeleton', 'wisp', 'mimic', 'dragon'];
// Native species have weight 8, visiting species weight 1 (80% / 20%).
// Every variant remains obtainable; adding a family does not strand dex entries.
const NATIVES = [
  ['slime', 'mushroom', 'bat'], ['wolf', 'bat', 'golem'],
  ['wisp', 'wolf', 'golem'], ['skeleton', 'mimic', 'wisp'],
  ['dragon', 'golem', 'skeleton'], ['dragon', 'wisp', 'mimic'],
];
export const REGION_POOLS = NATIVES.map(native => [
  ...native.map(family => ({ family, weight: 8 })),
  ...FAMILIES.filter(f => !native.includes(f)).map(family => ({ family, weight: 1 })),
]);
export function chooseFamily(region, rng = Math.random) {
  const pool = REGION_POOLS[region], total = pool.reduce((n, e) => n + e.weight, 0);
  let roll = Math.max(0, Math.min(1, rng())) * total;
  for (const entry of pool) { roll -= entry.weight; if (roll < 0) return entry.family; }
  return pool.at(-1).family; // deterministic test RNGs may return exactly 1
}
// Each region has its own variant of every family: [name, drop, CSS filter].
// Filters differ per family because the base sprites start from different hues.
const VARIANTS = [
  { slime: ['ルーンスライム', 'ルーンゼリー', ''], bat: ['夜羽のコウモリ', '夜羽の羽根', ''], golem: ['苔石のゴーレム', '苔むした核', ''], mushroom: ['藍傘のマタンゴ', '藍傘の胞子', ''], wolf: ['青鬣の狼', '青鬣の毛束', ''], skeleton: ['朽鎧の骸骨兵', '朽鎧の留め具', ''], wisp: ['迷い灯のウィスプ', '迷い灯の芯', ''], mimic: ['古箱のミミック', '古箱の錠前', ''], dragon: ['碧鱗の幼竜', '碧鱗のうろこ', ''] },
  { slime: ['そよ風スライム', '翠のゼリー', 'hue-rotate(-75deg) saturate(1.2)'], bat: ['疾風のコウモリ', '疾風の羽根', 'hue-rotate(190deg) saturate(1.2)'], golem: ['翠玉のゴーレム', '翠玉のかけら', 'hue-rotate(70deg) saturate(1.3)'], mushroom: ['風踊りマタンゴ', '風踊りの菌糸', 'hue-rotate(-85deg) saturate(1.25)'], wolf: ['草原の疾走狼', '疾走狼の爪', 'hue-rotate(-85deg) saturate(1.45)'], skeleton: ['草笛の骸骨兵', '草笛の骨笛', 'hue-rotate(-85deg) saturate(1.2)'], wisp: ['風灯のウィスプ', '風灯の燐粉', 'hue-rotate(-80deg) saturate(1.1)'], mimic: ['旅箱のミミック', '旅箱の金具', 'hue-rotate(-85deg) saturate(1.45)'], dragon: ['疾風の幼竜', '疾風竜の翼膜', 'hue-rotate(-85deg) saturate(1.25)'] },
  { slime: ['氷霧スライム', '氷霧のしずく', 'hue-rotate(25deg) saturate(.55) brightness(1.25)'], bat: ['霧氷のコウモリ', '霧氷の羽根', 'hue-rotate(-60deg) saturate(.6) brightness(1.35)'], golem: ['氷河のゴーレム', '氷河の核', 'hue-rotate(150deg) saturate(.6) brightness(1.2)'], mushroom: ['霜傘のマタンゴ', '霜傘の薄片', 'hue-rotate(15deg) saturate(.5) brightness(1.35)'], wolf: ['氷牙の狼', '氷牙の牙片', 'hue-rotate(15deg) saturate(.55) brightness(1.4)'], skeleton: ['凍冑の骸骨兵', '凍冑の破片', 'hue-rotate(15deg) saturate(.55) brightness(1.35)'], wisp: ['霧灯のウィスプ', '霧灯の結晶', 'hue-rotate(20deg) saturate(.4) brightness(1.25)'], mimic: ['氷櫃のミミック', '氷櫃の蝶番', 'hue-rotate(15deg) saturate(.55) brightness(1.5)'], dragon: ['氷晶の幼竜', '氷晶竜の小角', 'hue-rotate(15deg) saturate(.5) brightness(1.4)'] },
  { slime: ['星屑スライム', '星屑のゼリー', 'hue-rotate(80deg) saturate(1.3)'], bat: ['遺跡のコウモリ', '古びた羽根', 'hue-rotate(-15deg) saturate(1.15) brightness(1.2)'], golem: ['紫晶のゴーレム', '紫晶の核', 'hue-rotate(210deg) saturate(1.3)'], mushroom: ['夢見のマタンゴ', '夢見の胞子粉', 'hue-rotate(85deg) saturate(1.3)'], wolf: ['月影の狼', '月影の毛皮', 'hue-rotate(85deg) saturate(1.5)'], skeleton: ['星墓の骸骨兵', '星墓の紋章', 'hue-rotate(85deg) saturate(1.35)'], wisp: ['星魂のウィスプ', '星魂の残光', 'hue-rotate(90deg) saturate(1.25)'], mimic: ['魔書箱のミミック', '魔書箱の封蝋', 'hue-rotate(85deg) saturate(1.5)'], dragon: ['星詠みの幼竜', '星詠竜の鱗片', 'hue-rotate(85deg) saturate(1.4)'] },
  { slime: ['溶岩スライム', '溶岩のしずく', 'hue-rotate(170deg) saturate(2)'], bat: ['火焔のコウモリ', '火焔の羽根', 'hue-rotate(75deg) saturate(1.6)'], golem: ['紅玉のゴーレム', '紅玉の核', 'hue-rotate(-75deg) saturate(2)'], mushroom: ['熾火のマタンゴ', '熾火の菌核', 'hue-rotate(165deg) saturate(1.8)'], wolf: ['業火の狼', '業火の牙', 'hue-rotate(165deg) saturate(2)'], skeleton: ['灼刃の骸骨兵', '灼刃の柄', 'hue-rotate(165deg) saturate(1.8)'], wisp: ['獄灯のウィスプ', '獄灯の火種', 'hue-rotate(170deg) saturate(1.8)'], mimic: ['炉箱のミミック', '炉箱の鋲', 'hue-rotate(165deg) saturate(2)'], dragon: ['火口の幼竜', '火口竜の炎袋', 'hue-rotate(165deg) saturate(1.9)'] },
  { slime: ['暁のスライム', '暁のゼリー', 'hue-rotate(200deg) saturate(1.1) brightness(1.2)'], bat: ['暁翼のコウモリ', '暁の羽根', 'hue-rotate(130deg) saturate(1.2) brightness(1.4)'], golem: ['曙光のゴーレム', '曙光の核', 'hue-rotate(-30deg) saturate(1.6) brightness(1.1)'], mushroom: ['朝露のマタンゴ', '朝露の傘皮', 'hue-rotate(200deg) saturate(1.4) brightness(1.15)'], wolf: ['朝焼けの狼', '朝焼けの鬣', 'hue-rotate(200deg) saturate(1.6) brightness(1.2)'], skeleton: ['曙の近衛骨兵', '近衛の徽章', 'hue-rotate(200deg) saturate(1.4) brightness(1.15)'], wisp: ['黎明のウィスプ', '黎明の灯心', 'hue-rotate(200deg) saturate(1.2) brightness(1.1)'], mimic: ['日輪のミミック', '日輪の鍵', 'hue-rotate(200deg) saturate(1.6) brightness(1.25)'], dragon: ['天光の幼竜', '天光竜の尾棘', 'hue-rotate(200deg) saturate(1.4) brightness(1.2)'] },
];
const GOLDEN = { slime: ['黄金スライム', '黄金のゼリー'], bat: ['黄金のコウモリ', '黄金の羽根'], golem: ['黄金のゴーレム', '黄金の核'], mushroom: ['黄金のマタンゴ', '黄金の胞子'], wolf: ['黄金の狼', '黄金の牙'], skeleton: ['黄金の骸骨兵', '黄金の骨章'], wisp: ['黄金のウィスプ', '黄金の灯心'], mimic: ['黄金のミミック', '黄金の錠前'], dragon: ['黄金の幼竜', '黄金の竜鱗'] };
const GOLD_FILTER = 'sepia(1) saturate(3.5) hue-rotate(-12deg) brightness(1.15) drop-shadow(0 0 6px #ffd76a)';
export function monster(family, element = 0, rare = false) {
  const [name, drop, filter] = rare ? [...GOLDEN[family], GOLD_FILTER] : VARIANTS[element][family];
  return { id: `${family}-${rare ? 'rare' : element}`, sprite: family, name, drop, filter, rare };
}
export const BESTIARY = [...VARIANTS.flatMap((_, e) => FAMILIES.map(f => monster(f, e))), ...FAMILIES.map(f => monster(f, 0, true))];
export const RARE_DROP = '星のかけら';
export const TUNING = { pushup: { min: 5, step: 1, quest: 10 }, squat: { min: 8, step: 1, quest: 15 }, plank: { min: 20, step: 5, quest: 30 }, superman: { min: 15, step: 5, quest: 30 } };
export const BONUS = { boss: 50, best: 30, quest: 100, fullBody: 100, rare: 100, restPerDay: 100, restCap: 300, rareChance: 0.03, rareBoss: 0.1 };
export const CHAPTER_BOSSES = 3;
export const REGIONS = [
  ['はじまりの森', '森の奥へ、一歩ずつ。'], ['風渡りの高原', '風を背に、次の場所へ。'], ['霧の湖畔', '見えない先も、進めば晴れる。'],
  ['星灯りの遺跡', '積み重ねが、扉を開く。'], ['紅玉の火山', '熱は、力に変わる。'], ['夜明けの頂', 'ここから、また冒険が始まる。'],
];
const KEYS = Object.keys(MODES);
const DAY_MS = 86400000;
const integer = (v, max = 1e9) => Number.isSafeInteger(v) && v >= 0 && v <= max;
const dateKey = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const dayNumber = key => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / DAY_MS); };
const keyOf = n => new Date(n * DAY_MS).toISOString().slice(0, 10);
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; }
const previous = (slot, mode, except) => slot.history.find(r => r !== except && r.mode === mode);

export function bossOf(slot, mode) {
  const b = slot.bosses[mode], foe = monster(b.family ?? LEGACY_FAMILIES[b.count % 3], b.element, b.rare);
  return { ...foe, level: b.count + 1, hp: b.hp, max: b.max, isNew: !slot.dex?.[foe.id] };
}
export function makeQuest(slot, day) {
  const mode = KEYS[hash(day + slot.createdAt) % KEYS.length], t = TUNING[mode];
  const target = Math.max(t.quest, Math.round((slot.best[mode] || 0) * 1.2 / t.step) * t.step);
  return { day, mode, target, done: false };
}
// A rest day is any fully elapsed local day without XP; the pool pays out as doubled XP.
function accrueRest(slot, today) {
  const from = dayNumber(slot.rest.day), to = dayNumber(today);
  if (to <= from) return;
  let idle = 0;
  for (let n = Math.max(from, to - 7); n < to; n++) if (!slot.daily[keyOf(n)]?.xp) idle++;
  slot.rest.pool = Math.min(BONUS.restCap, slot.rest.pool + idle * BONUS.restPerDay);
  slot.rest.day = today;
}
// `except` is a just-committed row that must not count as past effort.
export function ensureMotivation(slot, today = localDate(), except = null) {
  // Exercises added later are filled in per mode, so older saves gain them without losing their records.
  slot.best ??= {};
  for (const m of KEYS) slot.best[m] ??= Math.max(0, ...slot.history.filter(r => r !== except && r.mode === m).map(r => r.amount));
  slot.bosses ??= {};
  for (const m of KEYS) if (!slot.bosses[m]) {
    const hp = Math.max(TUNING[m].min, (previous(slot, m, except)?.amount || 0) + TUNING[m].step);
    slot.bosses[m] = { max: hp, hp, count: 0 };
  }
  // Earlier saves only knew the forest variants; a missing element means the boss was spawned there.
  for (const m of KEYS) { slot.bosses[m].family ??= LEGACY_FAMILIES[slot.bosses[m].count % 3]; slot.bosses[m].element ??= chapterOf(slot).region; slot.bosses[m].rare ??= false; }
  if (!slot.dex) {
    slot.dex = {};
    for (const m of KEYS) LEGACY_FAMILIES.forEach((family, index) => {
      const wins = Math.floor((slot.bosses[m].count + 2 - index) / 3);
      if (wins) { const id = monster(family).id; slot.dex[id] = (slot.dex[id] || 0) + wins; }
    });
  }
  slot.items ??= {};
  slot.rest ??= { pool: 0, day: Object.keys(slot.daily).filter(k => k <= today).sort().at(-1) ?? today };
  accrueRest(slot, today);
  if (!slot.quest || slot.quest.day < today) slot.quest = makeQuest(slot, today);
  return slot;
}
// Every exercise done at least once on a day completes the full-body round, rewarded once per day.
export function fullBodyProgress(slot, day) {
  const done = KEYS.filter(m => (slot.daily[day]?.byMode[m]?.amount || 0) > 0);
  return { done, total: KEYS.length, complete: done.length === KEYS.length, awarded: slot.fullBody === day };
}
export function grantBonus(slot, xp, job, key) {
  if (!xp) return;
  grantJobXp(slot, xp, job);
  slot.xp += xp;
  const day = slot.daily[key] ??= { xp: 0, byMode: {} };
  day.bonus = (day.bonus || 0) + xp;
  day.xp += xp;
}
export const bossDefeats = slot => KEYS.reduce((n, m) => n + (slot.bosses?.[m]?.count || 0), 0);
export function chapterOf(slot) {
  const total = bossDefeats(slot), chapter = Math.floor(total / CHAPTER_BOSSES), depth = Math.floor(chapter / REGIONS.length);
  const [name, line] = REGIONS[chapter % REGIONS.length];
  return { chapter, region: chapter % REGIONS.length, progress: total % CHAPTER_BOSSES, name: depth ? `${name} · 深層${depth}` : name, line };
}
// Settle a committed history row: boss damage, bests, rested XP, daily request and drops.
export function resolveSet(slot, row, rng = Math.random) {
  const { mode, amount } = row, key = localDate(new Date(row.date)), unit = MODES[mode].unit, t = TUNING[mode];
  ensureMotivation(slot, key, row);
  const job = validJob(row.job) ? row.job : slot.job;
  const report = { mode, amount, lines: [], bonus: 0, drops: [], chapterUp: false };
  const add = (xp, text) => { report.bonus += xp; report.lines.push({ text, xp }); };
  const before = chapterOf(slot).chapter, prev = previous(slot, mode, row)?.amount;

  const boss = slot.bosses[mode], foe = bossOf(slot, mode);
  report.boss = { id: foe.id, name: foe.name, sprite: foe.sprite, rare: foe.rare, level: foe.level, max: boss.max, hp: boss.hp };
  if (amount >= boss.hp) {
    const over = amount - boss.hp, next = Math.max(boss.max, amount) + t.step;
    Object.assign(boss, { max: next, hp: next, count: boss.count + 1 });
    report.boss.defeated = true; row.boss = true;
    add(BONUS.boss, `${foe.name} Lv.${foe.level}を撃破！`);
    if (foe.rare) { add(BONUS.rare, 'レア個体の撃破ボーナス'); report.drops.push(RARE_DROP); }
    if (over) add(Math.floor(over * MODES[mode].xp / 2), `オーバーキル +${over}${unit}`);
    report.drops.push(foe.drop);
    if (!slot.dex[foe.id]) { report.boss.discovered = true; add(0, `図鑑に登録：${foe.name}（${Object.keys(slot.dex).length + 1}/${BESTIARY.length}）`); }
    slot.dex[foe.id] = (slot.dex[foe.id] || 0) + 1;
    // The next boss comes from the region reached after this defeat; a few are golden.
    const element = chapterOf(slot).region, rare = rng() < BONUS.rareBoss;
    Object.assign(boss, { element, rare, family: chooseFamily(element, rng) });
    const upcoming = bossOf(slot, mode);
    report.next = upcoming;
    if (upcoming.rare) add(0, `次の相手はレア個体：${upcoming.name}が現れた！`);
  } else {
    boss.hp -= amount;
    report.boss.remaining = boss.hp;
    add(0, `${foe.name}は逃げ出した。残りHP ${boss.hp} を次回に持ち越し`);
  }

  const best = slot.best[mode] || 0;
  if (amount > best) {
    slot.best[mode] = amount;
    if (best) add(BONUS.best, `自己ベスト更新！ ${best} → ${amount}${unit}`);
    else add(0, `はじめての記録：${amount}${unit}`);
  }
  report.best = slot.best[mode];
  if (prev !== undefined) {
    report.previous = prev;
    if (amount > prev) add(0, `前回比 +${amount - prev}${unit}`);
    else if (amount === prev) add(0, '前回と同じだけ、しっかり継続');
    else if (amount < best) add(0, `自己ベスト ${best}${unit} まで、あと ${best - amount}${unit}`);
  }

  const rested = Math.min(slot.rest.pool, row.xp);
  if (rested) { slot.rest.pool -= rested; add(rested, '休息ボーナス（経験値2倍）'); }

  const q = slot.quest;
  if (q.day === key && q.mode === mode && !q.done && (slot.daily[key]?.byMode[mode]?.amount || 0) >= q.target) {
    q.done = true;
    add(BONUS.quest, `今日の依頼達成：${MODES[mode].name} ${q.target}${unit}`);
  }

  const body = fullBodyProgress(slot, key);
  if (body.complete && slot.fullBody !== key) {
    slot.fullBody = key;
    add(BONUS.fullBody, `全身制覇！ 今日は${KEYS.length}種目すべてこなした`);
  }

  if (rng() < BONUS.rareChance) report.drops.push(RARE_DROP);
  for (const item of report.drops) slot.items[item] = (slot.items[item] || 0) + 1;

  grantBonus(slot, report.bonus, job, key);
  row.xp += report.bonus;
  if (report.bonus) row.bonus = report.bonus;
  report.chapterUp = chapterOf(slot).chapter > before;
  return report;
}
export function validateMotivation(s) {
  const bad = () => { throw new Error('Invalid motivation data'); };
  const record = v => v && typeof v === 'object' && !Array.isArray(v);
  // A mode may be missing from saves made before it existed; ensureMotivation fills it in.
  if (s.best !== undefined && (!record(s.best) || !KEYS.every(m => s.best[m] === undefined || integer(s.best[m], 1e7)))) bad();
  if (s.bosses !== undefined) {
    if (!record(s.bosses)) bad();
    for (const m of KEYS) {
      const b = s.bosses[m];
      if (b === undefined) continue;
      if (!record(b) || !integer(b.max, 1e7) || !integer(b.hp, b.max) || b.hp < 1 || !integer(b.count, 1e7)) bad();
      if (b.family !== undefined && !FAMILIES.includes(b.family)) bad();
      if ((b.element !== undefined && !integer(b.element, REGIONS.length - 1)) || (b.rare !== undefined && typeof b.rare !== 'boolean')) bad();
    }
  }
  if (s.dex !== undefined && (!record(s.dex) || Object.entries(s.dex).some(([k, v]) => !BESTIARY.some(e => e.id === k) || !integer(v, 1e7)))) bad();
  if (s.rest !== undefined && (!record(s.rest) || !integer(s.rest.pool, BONUS.restCap) || !dateKey(s.rest.day))) bad();
  if (s.fullBody !== undefined && !dateKey(s.fullBody)) bad();
  if (s.quest !== undefined && (!record(s.quest) || !dateKey(s.quest.day) || !MODES[s.quest.mode] || !integer(s.quest.target, 1e7) || typeof s.quest.done !== 'boolean')) bad();
  if (s.items !== undefined && (!record(s.items) || Object.entries(s.items).some(([k, v]) => k.length > 20 || !integer(v, 1e7)))) bad();
}
