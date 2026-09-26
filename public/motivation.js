import { MODES, localDate } from './engine.js';
import { grantJobXp, validJob } from './progression.js';

// Per-mode bosses, personal bests, rested XP, a daily request and drops.
// Bonus XP is recorded per day as `bonus`, so daily and job totals stay consistent.
export const BOSSES = [
  { sprite: 'slime', name: 'ルーンスライム', drop: 'ルーンゼリー' },
  { sprite: 'bat', name: '夜羽のコウモリ', drop: '夜羽の羽根' },
  { sprite: 'golem', name: '苔石のゴーレム', drop: '苔むした核' },
];
export const RARE_DROP = '星のかけら';
export const TUNING = { pushup: { min: 5, step: 1, quest: 10 }, squat: { min: 8, step: 1, quest: 15 }, plank: { min: 20, step: 5, quest: 30 } };
export const BONUS = { boss: 50, best: 30, quest: 100, restPerDay: 100, restCap: 300, rareChance: 0.03 };
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
  const b = slot.bosses[mode], foe = BOSSES[b.count % BOSSES.length];
  return { ...foe, level: b.count + 1, hp: b.hp, max: b.max };
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
  slot.best ??= Object.fromEntries(KEYS.map(m => [m, Math.max(0, ...slot.history.filter(r => r !== except && r.mode === m).map(r => r.amount))]));
  slot.bosses ??= {};
  for (const m of KEYS) if (!slot.bosses[m]) {
    const hp = Math.max(TUNING[m].min, (previous(slot, m, except)?.amount || 0) + TUNING[m].step);
    slot.bosses[m] = { max: hp, hp, count: 0 };
  }
  slot.items ??= {};
  slot.rest ??= { pool: 0, day: Object.keys(slot.daily).filter(k => k <= today).sort().at(-1) ?? today };
  accrueRest(slot, today);
  if (!slot.quest || slot.quest.day < today) slot.quest = makeQuest(slot, today);
  return slot;
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
  return { chapter, progress: total % CHAPTER_BOSSES, name: depth ? `${name} · 深層${depth}` : name, line };
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
  report.boss = { name: foe.name, sprite: foe.sprite, level: foe.level, max: boss.max, hp: boss.hp };
  if (amount >= boss.hp) {
    const over = amount - boss.hp, next = Math.max(boss.max, amount) + t.step;
    Object.assign(boss, { max: next, hp: next, count: boss.count + 1 });
    report.boss.defeated = true; row.boss = true;
    add(BONUS.boss, `${foe.name} Lv.${foe.level}を撃破！`);
    if (over) add(Math.floor(over * MODES[mode].xp / 2), `オーバーキル +${over}${unit}`);
    report.drops.push(foe.drop);
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
  if (s.best !== undefined && (!record(s.best) || !KEYS.every(m => integer(s.best[m], 1e7)))) bad();
  if (s.bosses !== undefined) {
    if (!record(s.bosses)) bad();
    for (const m of KEYS) { const b = s.bosses[m]; if (!record(b) || !integer(b.max, 1e7) || !integer(b.hp, b.max) || b.hp < 1 || !integer(b.count, 1e7)) bad(); }
  }
  if (s.rest !== undefined && (!record(s.rest) || !integer(s.rest.pool, BONUS.restCap) || !dateKey(s.rest.day))) bad();
  if (s.quest !== undefined && (!record(s.quest) || !dateKey(s.quest.day) || !MODES[s.quest.mode] || !integer(s.quest.target, 1e7) || typeof s.quest.done !== 'boolean')) bad();
  if (s.items !== undefined && (!record(s.items) || Object.entries(s.items).some(([k, v]) => k.length > 20 || !integer(v, 1e7)))) bad();
}
