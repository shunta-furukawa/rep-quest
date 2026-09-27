import { BESTIARY, REGIONS } from './motivation.js';
function entry(m, dex) {
  const seen = dex[m.id], cell = document.createElement('div'), img = document.createElement('img'), label = document.createElement('small');
  cell.className = `dex-entry${seen ? '' : ' unseen'}${m.rare ? ' rare' : ''}`;
  img.src = `/sprites/${m.sprite}.webp`; img.alt = ''; img.width = 56; img.height = 56; img.loading = 'lazy'; img.decoding = 'async';
  if (seen) img.style.setProperty('--variant', m.filter || 'brightness(1)');
  label.textContent = seen ? `${m.name} ×${seen}` : m.rare ? '★ ？？？' : '？？？';
  cell.append(img, label); return cell;
}
// `grouped` splits the collection by region (plus the golden rares), marking where the adventurer is now.
export function renderBestiary(container, dex, { grouped = false, current = null } = {}) {
  if (!grouped) return container.replaceChildren(...BESTIARY.map(m => entry(m, dex)));
  const groups = [...REGIONS.map((r, i) => ({ title: r[0], here: i === current, list: BESTIARY.filter(m => m.region === i) })), { title: '黄金のレア個体', rare: true, list: BESTIARY.filter(m => m.rare) }];
  container.replaceChildren(...groups.map(g => {
    const section = document.createElement('section'), head = document.createElement('div'), name = document.createElement('h3'), count = document.createElement('span'), grid = document.createElement('div');
    section.className = `dex-group${g.here ? ' is-here' : ''}${g.rare ? ' is-rare' : ''}`; head.className = 'dex-group-head';
    name.textContent = g.here ? `${g.title} · 現在地` : g.title;
    count.textContent = `${g.list.filter(m => dex[m.id]).length} / ${g.list.length}`;
    grid.className = 'bestiary'; grid.append(...g.list.map(m => entry(m, dex)));
    head.append(name, count); section.append(head, grid); return section;
  }));
}
