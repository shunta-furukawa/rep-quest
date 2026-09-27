import { CHAPTER_BOSSES, REGIONS } from './motivation.js';
import { MAP_POINTS, regionState } from './story.js';
import { portrait } from './sprites.js';

const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
let artChecked = null;
// Star veins, beacons and the adventurer are drawn live over optional painted art.
export function renderWorldMap(container, { chapter, progress, job, stage, hair, onSelect }) {
  const lines = svg('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', class: 'map-veins', 'aria-hidden': 'true' });
  const cur = chapter % REGIONS.length;
  for (let i = 0; i < REGIONS.length - 1; i++) {
    const [x1, y1] = MAP_POINTS[i], [x2, y2] = MAP_POINTS[i + 1], s = regionState(chapter, i);
    lines.append(svg('line', { x1, y1, x2, y2, class: s.cleared ? 'vein lit' : i === cur ? 'vein route' : 'vein' }));
  }
  if (cur === REGIONS.length - 1) { const [x1, y1] = MAP_POINTS.at(-1), [x2, y2] = MAP_POINTS[0]; lines.append(svg('line', { x1, y1, x2, y2, class: 'vein route' })); }
  const islands = REGIONS.map(([name], i) => {
    const s = regionState(chapter, i), b = document.createElement('button');
    b.type = 'button';
    b.className = `map-island${s.cleared ? ' cleared' : ''}${s.current ? ' current' : ''}${s.next ? ' next' : ''}${s.visited ? '' : ' unvisited'}`;
    b.style.left = `${MAP_POINTS[i][0]}%`; b.style.top = `${MAP_POINTS[i][1]}%`;
    const land = document.createElement('span'); land.className = 'map-land';
    const beacon = document.createElement('i'); beacon.className = 'map-beacon';
    const label = document.createElement('span'); label.className = 'map-label';
    label.textContent = name;
    const tag = document.createElement('small'); tag.textContent = s.current ? `現在地 · 灯標 ${progress}/${CHAPTER_BOSSES}` : s.next ? '次の目的地' : s.cleared ? '灯標を灯した' : '未踏の地';
    label.append(tag);
    b.append(land, beacon, label);
    b.setAttribute('aria-label', `${name}、${tag.textContent}。物語を開く`);
    b.onclick = () => onSelect(i);
    if (s.current) { const hero = portrait(job, stage, hair, 'あなたの冒険者'); hero.classList.add('map-hero'); b.append(hero); }
    return b;
  });
  container.replaceChildren(lines, ...islands);
  // Painted islands replace the placeholder land shapes once the art exists.
  artChecked ??= new Promise(resolve => { const img = new Image(); img.onload = () => resolve(true); img.onerror = () => resolve(false); img.src = '/art/world-map.webp'; });
  artChecked.then(ok => container.classList.toggle('has-art', ok));
}
