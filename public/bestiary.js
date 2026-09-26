import { BESTIARY } from './motivation.js';
export function renderBestiary(container, dex) {
  container.replaceChildren(...BESTIARY.map(m => {
    const seen = dex[m.id], cell = document.createElement('div'), img = document.createElement('img'), label = document.createElement('small');
    cell.className = `dex-entry${seen ? '' : ' unseen'}${m.rare ? ' rare' : ''}`;
    img.src = `/sprites/${m.sprite}.webp`; img.alt = ''; img.width = 56; img.height = 56; img.loading = 'lazy'; img.decoding = 'async';
    if (seen) img.style.setProperty('--variant', m.filter || 'brightness(1)');
    label.textContent = seen ? `${m.name} ×${seen}` : m.rare ? '★ ？？？' : '？？？';
    cell.append(img, label); return cell;
  }));
}
