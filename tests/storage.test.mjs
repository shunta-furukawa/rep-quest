import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacter, emptyStore, migrateLegacy, newActive, creditAmount, commitActive, validateStore, monthCells } from '../public/storage.js';
import { localDate } from '../public/engine.js';

const make = () => createCharacter('俊太', '#302824', new Date('2026-09-26T10:00:00+09:00'));
function workout(slot, mode, amount, at) { slot.active = newActive(mode, at); creditAmount(slot.active, amount, at); return commitActive(slot); }

test('three slots isolate identity, progress and calendars', () => {
  const store = emptyStore(); store.slots[0] = make(); store.slots[1] = createCharacter('勇者', '#dfb763'); store.selected = 0;
  workout(store.slots[0], 'pushup', 10, new Date(2026, 8, 26, 12));
  assert.equal(store.slots[0].xp, 100); assert.equal(store.slots[1].xp, 0); assert.deepEqual(store.slots[1].daily, {}); assert.equal(store.slots[2], null);
  assert.deepEqual(validateStore(JSON.parse(JSON.stringify(store))), store);
});
test('legacy migration retains total XP and backfills only known dates', () => {
  const store = migrateLegacy({ version: 1, xp: 120, sets: 3, sound: false, history: [{ mode: 'pushup', amount: 2, xp: 20, date: '2026-09-25T12:00:00Z' }] });
  assert.equal(store.slots[0].xp, 120); assert.equal(store.slots[0].undatedXp, 100);
  assert.equal(Object.values(store.slots[0].daily)[0].xp, 20); assert.equal(store.slots[0].configured, false); assert.equal(store.sound, false);
  validateStore(store);
});
test('interrupted legacy set is retained without inventing its date', () => {
  const store = migrateLegacy({ version: 1, xp: 0, sets: 0, history: [], active: { mode: 'squat', amount: 3 } });
  assert.equal(store.slots[0].xp, 30); assert.equal(store.slots[0].undatedXp, 30); assert.deepEqual(store.slots[0].daily, {}); validateStore(store);
});
test('midnight reps and plank seconds are split into actual local dates', () => {
  const slot = make(); const before = new Date(2026, 8, 26, 23, 59, 59), after = new Date(2026, 8, 27, 0, 0, 1);
  slot.active = newActive('pushup', before); creditAmount(slot.active, 1, before); creditAmount(slot.active, 2, after); commitActive(slot);
  assert.equal(slot.daily[localDate(before)].xp, 10); assert.equal(slot.daily[localDate(after)].xp, 10);
  slot.active = newActive('plank', before); creditAmount(slot.active, 4, after); commitActive(slot);
  assert.equal(slot.daily[localDate(before)].byMode.plank.amount, 2); assert.equal(slot.daily[localDate(after)].byMode.plank.amount, 2);
});
test('recovery credits the original date once, not the restart date', () => {
  const store = emptyStore(); const slot = make(); store.slots[0] = slot;
  slot.active = newActive('squat'); creditAmount(slot.active, 5, new Date(2026, 7, 1, 15));
  const restored = validateStore(JSON.parse(JSON.stringify(store))); const s = restored.slots[0];
  assert.equal(commitActive(s), 50); assert.equal(commitActive(s), 0); assert.equal(s.xp, 50); assert.equal(s.daily['2026-08-01'].xp, 50); validateStore(restored);
});
test('daily XP survives the bounded recent-history list', () => {
  const slot = make(); for (let i = 0; i < 150; i++) workout(slot, 'pushup', 1, new Date(2026, 0, i + 1, 12));
  assert.equal(slot.history.length, 100); assert.equal(Object.keys(slot.daily).length, 150); assert.equal(slot.daily['2026-01-01'].xp, 10); assert.equal(slot.xp, 1500);
});
test('calendar handles leap years, month length and weekday padding', () => {
  const feb = monthCells(2028, 1); assert.equal(feb.filter(Boolean).length, 29); assert.equal(feb[2], '2028-02-01');
  assert.equal(monthCells(2026, 8).filter(Boolean).length, 30); assert.equal(monthCells(2026, 11).at(-1), null);
});
test('invalid backup totals and invalid color are rejected', () => {
  const store = emptyStore(); store.slots[0] = make(); store.slots[0].xp = 100; assert.throws(() => validateStore(store));
  assert.throws(() => createCharacter(' ', '#302824')); assert.throws(() => createCharacter('勇者', 'invalid'));
  store.slots[0] = make(); store.slots[0].active = { ...newActive('pushup'), amount: 1 }; assert.throws(() => validateStore(store));
});
