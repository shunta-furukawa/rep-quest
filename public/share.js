import { MODES, localDate } from './engine.js';

// Share cards: one image per proud moment, and a weekly recap. Everything is drawn on the device;
// nothing is uploaded until the player chooses to share it.
export const HASHTAGS = '#REPQUEST #筋トレ';
const KIND_LABEL = { technique: '技の習得', promotion: '昇格', beacon: '灯標を灯した', rare: 'レア撃破', fullbody: '全身制覇', best: '自己ベスト', weekly: '今週の冒険' };

// The single biggest moment of a set, or null when the set was an ordinary one.
export function pickHighlight({ report, before, after, amount, cleared, nextRegion }) {
  const unit = MODES[report.mode].unit, set = `${report.tech?.name ?? MODES[report.mode].name} ${amount}${unit}`;
  const make = (kind, title, detail = set) => ({ kind, label: KIND_LABEL[kind], title, detail });
  if (report.unlocked) return make('technique', `${report.unlocked.name}を習得！`, `${set}で技を磨き上げた`);
  if (after && before && after.stage > before.stage) return make('promotion', `${after.title}に昇格！`);
  if (report.chapterUp) return make('beacon', `${cleared}の灯標を灯した`, `次の地：${nextRegion}`);
  if (report.boss?.defeated && report.boss.rare) return make('rare', `${report.boss.name}を撃破！`);
  if (report.fullBody) return make('fullbody', '今日、全身制覇', `${Object.keys(MODES).length}種目すべてをこなした`);
  if (report.personalBest) { const pb = report.personalBest; return make('best', `${pb.name} 自己ベスト${pb.amount}${pb.unit}`, `前回のベスト ${pb.previous}${pb.unit} から更新`); }
  return null;
}

// The last seven local days, today included.
export function weeklySummary(slot, today = localDate()) {
  const [y, m, d] = today.split('-').map(Number);
  const keys = Array.from({ length: 7 }, (_, i) => localDate(new Date(y, m - 1, d - 6 + i)));
  const totals = Object.fromEntries(Object.keys(MODES).map(k => [k, 0]));
  let xp = 0, days = 0;
  for (const key of keys) {
    const day = slot.daily[key];
    if (!day?.xp) continue;
    days++; xp += day.xp;
    for (const [mode, entry] of Object.entries(day.byMode)) totals[mode] += entry.amount;
  }
  const defeats = slot.history.filter(r => r.boss && keys.includes(localDate(new Date(r.date)))).length;
  return { from: keys[0], to: keys[6], days, xp, totals, defeats };
}
export function weeklyHighlight(week) {
  const lines = Object.entries(week.totals).filter(([, n]) => n).map(([mode, n]) => `${MODES[mode].name} ${n}${MODES[mode].unit}`);
  return { kind: 'weekly', label: KIND_LABEL.weekly, title: `今週は${week.days}日、冒険した`, detail: `ボス撃破 ${week.defeats}体 · ${week.xp.toLocaleString()} XP`, lines };
}
export function shareText(h) {
  return [`【REP QUEST】${h.title}`, h.detail, HASHTAGS].join('\n');
}

// --- Card drawing (browser only) ---
const W = 1200, H = 675;
const loadImage = src => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
function cover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
}
// Japanese has no spaces to break on, so wrap by measured characters.
function wrap(ctx, text, width) {
  const lines = []; let line = '';
  for (const ch of text) { if (ctx.measureText(line + ch).width > width && line) { lines.push(line); line = ch; } else line += ch; }
  if (line) lines.push(line);
  return lines;
}
const SERIF = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const SANS = '-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif';
export async function drawCard(h, { backdrop, hero, name, date }) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#07131f'; x.fillRect(0, 0, W, H);
  for (const src of [backdrop, '/art/guild-dusk.webp']) { try { cover(x, await loadImage(src), W, H); break; } catch {} }
  const shade = x.createLinearGradient(0, 0, W, 0);
  shade.addColorStop(0, '#07131ff2'); shade.addColorStop(0.55, '#07131fcc'); shade.addColorStop(1, '#07131f33');
  x.fillStyle = shade; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#e3bc76aa'; x.lineWidth = 3; x.strokeRect(18, 18, W - 36, H - 36);
  if (hero) { x.imageSmoothingEnabled = false; const s = 2.7; x.drawImage(hero, W - 60 - hero.width * s, H - 40 - hero.height * s, hero.width * s, hero.height * s); x.imageSmoothingEnabled = true; }
  try { const logo = await loadImage('/art/wordmark-generated.webp'); x.drawImage(logo, 60, 50, 330, 330 * logo.height / logo.width); } catch {}
  x.fillStyle = '#9fe3e8'; x.font = `600 30px ${SANS}`; x.fillText(h.label, 64, 190);
  // Prefer one line: step the size down before wrapping, so a title never breaks mid-word.
  x.fillStyle = '#f1d395';
  const size = [64, 58, 52, 46].find(px => { x.font = `700 ${px}px ${SERIF}`; return x.measureText(h.title).width <= 700; }) ?? 52;
  x.font = `700 ${size}px ${SERIF}`;
  const titleLines = wrap(x, h.title, 700).slice(0, 2), lineHeight = size * 1.22;
  titleLines.forEach((line, i) => x.fillText(line, 60, 272 + i * lineHeight));
  let yPos = 272 + titleLines.length * lineHeight + 4;
  x.fillStyle = '#e8eef0'; x.font = `500 32px ${SANS}`;
  for (const line of [h.detail, ...(h.lines || [])].slice(0, 5)) { x.fillText(line, 64, yPos); yPos += 46; }
  x.fillStyle = '#b8c7cc'; x.font = `400 26px ${SANS}`;
  x.fillText([name, date].filter(Boolean).join(' · '), 64, H - 58);
  x.fillStyle = '#e3bc76'; x.textAlign = 'right'; x.fillText(HASHTAGS, W - 60, 72);
  return new Promise(resolve => c.toBlob(resolve, 'image/png'));
}
