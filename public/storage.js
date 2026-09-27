import { ensureJobs, grantJobXp, validJob } from './progression.js';
import { MODES, localDate, validateSave } from './engine.js';
import { validateMotivation } from './motivation.js';
import { techOf, xpOf } from './techniques.js';

export const STORAGE_KEY = 'rep-quest:v2';
export const LEGACY_KEY = 'rep-quest:v1';
export const HAIR_COLORS = [
  { value: '#302824', name: '黒曜' },
  { value: '#855037', name: '栗色' },
  { value: '#dfb763', name: '金色' },
  { value: '#ccd4db', name: '銀色' },
  { value: '#894555', name: '紅紫' },
  { value: '#426d80', name: '青藍' },
];
const hairValues = HAIR_COLORS.map(c => c.value);
const integer = (v, max = 1e9) => Number.isSafeInteger(v) && v >= 0 && v <= max;
const validDateKey = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
const validTimestamp = s => typeof s === 'string' && Number.isFinite(Date.parse(s));
const emptyDay = () => ({ xp: 0, byMode: {} });
export function emptyStore() {
  return { version: 2, revision: 0, selected: null, sound: true, slots: [null, null, null] };
}
export function createCharacter(name, hair, now = new Date()) {
  name = name.trim();
  if (!name || name.length > 16 || !hairValues.includes(hair)) throw new Error('Invalid character');
  return { job: 'sword', jobs: { sword: 0, mage: 0, rogue: 0 }, name, hair, configured: true, createdAt: now.toISOString(), xp: 0, sets: 0, history: [], daily: {}, undatedXp: 0 };
}
function addDaily(slot, mode, amount, key, tech = mode) {
  const day = slot.daily[key] ??= emptyDay();
  const entry = day.byMode[mode] ??= { amount: 0, xp: 0 };
  const xp = xpOf(tech, amount);
  entry.amount += amount;
  entry.xp += xp;
  day.xp += xp;
}
export function newActive(mode, now = new Date(), job = 'sword', tech = mode) {
  if (!MODES[mode] || techOf(tech)?.mode !== mode) throw new Error('Unknown mode');
  return { job, mode, tech, amount: 0, days: {}, startedAt: now.toISOString(), lastAt: now.toISOString() };
}
// Attribute each newly earned whole second/rep to its local date, even across midnight.
export function creditAmount(active, amount, now = new Date()) {
  const delta = amount - active.amount;
  if (!integer(delta, 1e7)) throw new Error('Invalid increment');
  if (MODES[active.mode].timer) {
    let remaining = delta;
    let end = now.getTime();
    while (remaining > 0) {
      const d = new Date(end), key = localDate(d);
      const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const n = Math.min(remaining, Math.floor((end - midnight) / 1000) + 1);
      active.days[key] = (active.days[key] || 0) + n;
      remaining -= n;
      end -= n * 1000;
    }
  } else if (delta) {
    const key = localDate(now);
    active.days[key] = (active.days[key] || 0) + delta;
  }
  active.amount = amount;
  active.lastAt = now.toISOString();
}
export function commitActive(slot) {
  const a = slot.active;
  if (!a) return 0;
  delete slot.active;
  if (!a.amount) return 0;
  // Older active sets have no technique; they were the standard one.
  const tech = a.tech || a.mode;
  // XP is weighted per day so the daily totals add up exactly to the set's XP.
  const xp = Object.values(a.days).reduce((sum, n) => sum + xpOf(tech, n), 0);
  grantJobXp(slot, xp, a.job || slot.job || 'sword');
  slot.xp += xp;
  slot.sets++;
  for (const [key, amount] of Object.entries(a.days)) addDaily(slot, a.mode, amount, key, tech);
  slot.history.unshift({ mode: a.mode, tech, amount: a.amount, xp, date: a.lastAt, job: a.job || slot.job || 'sword' });
  slot.history = slot.history.slice(0, 100); // Daily aggregates are never truncated.
  return xp;
}
// Removes one slot entirely. Other slots and their records are untouched.
export function deleteSlot(store, index) {
  if (!integer(index, 2) || !store.slots[index]) throw new Error('Invalid slot');
  store.slots[index] = null;
  if (store.selected === index) store.selected = null;
  return store;
}
export function migrateLegacy(value) {
  const legacy = validateSave(value);
  const store = emptyStore();
  const slot = createCharacter('冒険者', HAIR_COLORS[0].value);
  Object.assign(slot, { configured: false, xp: legacy.xp, sets: legacy.sets, history: legacy.history.slice(0, 100) });
  let dated = 0;
  for (const row of legacy.history) {
    const key = localDate(new Date(row.date));
    const day = slot.daily[key] ??= emptyDay();
    const entry = day.byMode[row.mode] ??= { amount: 0, xp: 0 };
    entry.amount += row.amount;
    entry.xp += row.xp;
    day.xp += row.xp;
    dated += row.xp;
  }
  if (dated > slot.xp) throw new Error('Inconsistent legacy XP');
  slot.undatedXp = slot.xp - dated;
  if (legacy.active && MODES[legacy.active.mode] && integer(legacy.active.amount, 1e7) && legacy.active.amount > 0) {
    // v1 did not record when an interrupted set was earned. Do not invent a day.
    const xp = legacy.active.amount * MODES[legacy.active.mode].xp;
    slot.xp += xp;
    slot.undatedXp += xp;
    slot.sets++;
  }
  slot.jobs = { sword: slot.xp, mage: 0, rogue: 0 };
  store.slots[0] = slot;
  store.selected = 0;
  store.sound = legacy.sound !== false;
  return store;
}
function validateCharacter(s) {
  if (!s || typeof s.name !== 'string' || !s.name.trim() || s.name.length > 16 || !hairValues.includes(s.hair) || typeof s.configured !== 'boolean' || !validTimestamp(s.createdAt) || !integer(s.xp) || !integer(s.sets) || !integer(s.undatedXp) || !Array.isArray(s.history) || s.history.length > 100 || !s.daily || typeof s.daily !== 'object' || Array.isArray(s.daily)) throw new Error('Invalid character');
  if (s.jobs !== undefined || s.job !== undefined) {
    if (!validJob(s.job) || !s.jobs || Object.keys(s.jobs).length !== 3 || !['sword','mage','rogue'].every(k => integer(s.jobs[k])) || Object.values(s.jobs).reduce((a,b) => a+b,0) !== s.xp) throw new Error('Invalid job progress');
  }
  ensureJobs(s);
  validateMotivation(s);
  for (const row of s.history) {
    if (!MODES[row.mode] || !integer(row.amount, 1e7) || !integer(row.xp) || !validTimestamp(row.date)) throw new Error('Invalid history');
    if (row.tech !== undefined && techOf(row.tech)?.mode !== row.mode) throw new Error('Invalid history technique');
  }
  let total = s.undatedXp;
  for (const [key, day] of Object.entries(s.daily)) {
    if (!validDateKey(key) || !day || !integer(day.xp) || !day.byMode || typeof day.byMode !== 'object') throw new Error('Invalid day');
    let sum = 0;
    for (const [mode, entry] of Object.entries(day.byMode)) {
      if (!MODES[mode] || !entry || !integer(entry.amount, 1e8) || !integer(entry.xp)) throw new Error('Invalid day details');
      sum += entry.xp;
    }
    if (day.bonus !== undefined && !integer(day.bonus)) throw new Error('Invalid day bonus');
    if (sum + (day.bonus || 0) !== day.xp) throw new Error('Invalid day sum');
    total += day.xp;
  }
  if (total !== s.xp) throw new Error('Invalid XP total');
  if (s.active) {
    const a = s.active;
    if (a.job !== undefined && !validJob(a.job)) throw new Error('Invalid active job');
    if (a.tech !== undefined && techOf(a.tech)?.mode !== a.mode) throw new Error('Invalid active technique');
    if (!MODES[a.mode] || !integer(a.amount, 1e7) || !validTimestamp(a.startedAt) || !validTimestamp(a.lastAt) || !a.days || typeof a.days !== 'object') throw new Error('Invalid active set');
    let amount = 0;
    for (const [key, n] of Object.entries(a.days)) {
      if (!validDateKey(key) || !integer(n, 1e7)) throw new Error('Invalid active day');
      amount += n;
    }
    if (amount !== a.amount) throw new Error('Invalid active total');
  }
}
export function validateStore(value) {
  if (!value || value.version !== 2 || !integer(value.revision) || typeof value.sound !== 'boolean' || !Array.isArray(value.slots) || value.slots.length !== 3 || !(value.selected === null || (integer(value.selected, 2) && value.slots[value.selected]))) throw new Error('Invalid backup');
  for (const s of value.slots) if (s !== null) validateCharacter(s);
  return value;
}
export function monthCells(year, month) {
  const offset = new Date(year, month, 1).getDay();
  const length = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: Math.ceil((offset + length) / 7) * 7 }, (_, i) => i < offset || i >= offset + length ? null : localDate(new Date(year, month, i - offset + 1)));
}
