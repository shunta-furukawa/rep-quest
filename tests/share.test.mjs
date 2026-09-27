import test from 'node:test';
import assert from 'node:assert/strict';
import { pickHighlight, shareText, weeklyHighlight, weeklySummary } from '../public/share.js';
import { createCharacter, newActive, creditAmount, commitActive } from '../public/storage.js';
import { resolveSet } from '../public/motivation.js';

const base = { mode: 'pushup', tech: { id: 'pushup', name: '腕立て伏せ' }, boss: { defeated: false } };
const stage = s => ({ stage: s, title: ['見習い剣士', '旅の剣士'][s] });
test('the biggest moment of a set is chosen in a fixed order, and ordinary sets share nothing', () => {
  assert.equal(pickHighlight({ report: base, before: stage(0), after: stage(0), amount: 8 }), null);
  const all = { ...base, unlocked: { id: 'pushup-wide', name: 'ワイド腕立て伏せ' }, chapterUp: true, fullBody: true, boss: { defeated: true, rare: true, name: '黄金スライム' }, personalBest: { name: '腕立て伏せ', amount: 16, previous: 15, unit: '回' } };
  assert.equal(pickHighlight({ report: all, before: stage(0), after: stage(1), amount: 16 }).kind, 'technique');
  assert.equal(pickHighlight({ report: { ...all, unlocked: undefined }, before: stage(0), after: stage(1), amount: 16 }).title, '旅の剣士に昇格！');
  const beacon = pickHighlight({ report: { ...all, unlocked: undefined }, before: stage(0), after: stage(0), amount: 16, cleared: 'はじまりの森', nextRegion: '風渡りの高原' });
  assert.deepEqual([beacon.kind, beacon.title, beacon.detail], ['beacon', 'はじまりの森の灯標を灯した', '次の地：風渡りの高原']);
  assert.equal(pickHighlight({ report: { ...base, boss: all.boss }, amount: 5 }).title, '黄金スライムを撃破！');
  assert.equal(pickHighlight({ report: { ...base, fullBody: true }, amount: 5 }).kind, 'fullbody');
  const best = pickHighlight({ report: { ...base, personalBest: all.personalBest }, amount: 16 });
  assert.equal(best.title, '腕立て伏せ 自己ベスト16回');
  assert.match(shareText(best), /^【REP QUEST】腕立て伏せ 自己ベスト16回\n.+\n#REPQUEST/);
});
test('a real personal-best set produces a shareable highlight', () => {
  const s = createCharacter('ルーン', '#855037');
  const set = (n, h) => { s.active = newActive('squat', new Date(2026, 8, 1, h), s.job, 'squat'); creditAmount(s.active, n, new Date(2026, 8, 1, h)); commitActive(s); return resolveSet(s, s.history[0], () => 1); };
  set(5, 9); const report = set(7, 10);
  assert.equal(pickHighlight({ report, amount: 7 }).kind, 'best');
});
test('the weekly recap covers the last seven local days only', () => {
  const s = createCharacter('ルーン', '#855037');
  const set = (mode, n, day) => { const at = new Date(2026, 8, day, 12); s.active = newActive(mode, at, s.job, mode); creditAmount(s.active, n, at); commitActive(s); s.history[0].boss = day > 21; };
  set('pushup', 10, 20); set('pushup', 12, 22); set('squat', 15, 25); set('plank', 40, 28);
  const week = weeklySummary(s, '2026-09-28');
  assert.deepEqual([week.from, week.to, week.days, week.defeats], ['2026-09-22', '2026-09-28', 3, 3]);
  assert.deepEqual(week.totals, { pushup: 12, squat: 15, plank: 40, superman: 0 });
  const h = weeklyHighlight(week);
  assert.equal(h.title, '今週は3日、冒険した'); assert.deepEqual(h.lines, ['腕立て伏せ 12回', 'スクワット 15回', 'プランク 40秒']);
});
