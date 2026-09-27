import { renderBestiary } from './bestiary.js';
import { createAppUpdates } from './updates.js';
import { bossState, createBattle, defeats } from './battle.js';
import { BONUS, CHAPTER_BOSSES, NATIVES, REGIONS, bossOf, chapterOf, dexStats, ensureMotivation, fullBodyProgress, monster, resolveSet } from './motivation.js';
import { DEPTH_NOTE, PROLOGUE, REGION_STORY, destinationOf, regionState } from './story.js';
import { renderWorldMap } from './worldmap.js';
import { GUIDE, countdownOf, cueAt } from './guide.js';
import { JOBS, STAGES, ensureJobs, formVisibility, growth } from './progression.js';
import { portrait } from './sprites.js';
import { MODES, progress, localDate, RepDetector } from './engine.js';
import { STORAGE_KEY, LEGACY_KEY, HAIR_COLORS, emptyStore, createCharacter, deleteSlot, newActive, creditAmount, commitActive, migrateLegacy, validateStore, monthCells } from './storage.js';

const $ = id => document.getElementById(id);
const battle = createBattle($('battle-arena'));
let store = emptyStore(), data = null, session = null, audio = null, wake = null;
let lastTouch = -Infinity, toastTimer, storageOK = true, writeBlocked = false;
let view = 'slots', editorIndex = 0, editorHair = HAIR_COLORS[0].value, editorJob = 'sword', galleryJob = 'sword', galleryStage = 0;
let selectedDay = localDate(), calendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let scene = null, sceneLoad = null, currentDay = localDate(), appUpdates = null;

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').hidden = true, 5500);
}
function warning(message) {
  $('storage-warning').textContent = message;
  $('storage-warning').hidden = false;
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  const old = localStorage.getItem(LEGACY_KEY);
  if (saved) store = validateStore(JSON.parse(saved));
  else if (old) store = migrateLegacy(JSON.parse(old));
} catch {
  writeBlocked = true;
  storageOK = false;
  warning('保存データを読み込めません。元のデータは変更していません。バックアップから復元してください。');
}
function save() {
  if (writeBlocked) return false;
  try {
    const latest = localStorage.getItem(STORAGE_KEY);
    if (latest && JSON.parse(latest).revision !== store.revision) {
      writeBlocked = true;
      storageOK = false;
      warning('別の画面で記録が更新されました。この画面では保存を止めています。再読み込みして続けてください。');
      return false;
    }
    store.revision++;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch (error) { store.revision--; throw error; }
    storageOK = true;
    $('storage-warning').hidden = true;
    return true;
  } catch {
    storageOK = false;
    warning('端末に保存できません。記録を失わないよう、この画面を閉じる前にバックアップしてください。');
    return false;
  }
}
let recovered = false;
if (!writeBlocked) {
  for (const slot of store.slots) if (slot?.active && commitActive(slot)) { resolveSet(slot, slot.history[0]); recovered = true; }
  if (store.slots.some(Boolean)) save();
}
function selectedProfile() {
  if (view === 'creator') return { ...(store.slots[editorIndex] || {xp:0,jobs:{sword:0,mage:0,rogue:0}}), name: $('character-name').value, hair: editorHair, job:editorJob };
  if (view === 'gallery') return {...data,job:galleryJob,jobs:{...data.jobs,[galleryJob]:STAGES[galleryStage]},silhouette:formVisibility(data.jobs[galleryJob],galleryStage)==='hidden'};
  return data;
}
async function mountScene() {
  const mount = $(`${view}-scene`);
  if (!mount) { scene?.setVisible(false); return; }
  if (!sceneLoad) {
    sceneLoad = import('./sprites.js').then(({ createScene }) => createScene()).catch(() => null);
  }
  scene = await sceneLoad;
  const currentMount = $(`${view}-scene`);
  if (!currentMount) return;
  if (scene) {
    scene.mount(currentMount);
    const profile = selectedProfile();
    if (profile) scene.setCharacter(profile);
    scene.setVisible(true);
    scene.setMode(view === 'workout' && session?.state === 'running' && MODES[session.mode].timer ? 'guard' : 'idle');
    if (view === 'result') scene.play('celebrate');
  } else {
    const emblem = document.createElement('img'); emblem.src = '/art/crest.svg'; emblem.width = 90; emblem.height = 110; emblem.alt = '';
    const note = document.createElement('small'); note.textContent = '冒険者の画像を読み込めません';
    currentMount.replaceChildren(emblem, note);
    currentMount.classList.add('scene-fallback');
    currentMount.setAttribute('aria-label', '画像を読み込めません。運動の計測と記録はそのまま使えます。');
  }
}
function show(next) {
  view = next;
  appUpdates?.refresh();
  document.body.dataset.view = next;
  $('app-nav').hidden = !['home', 'map', 'gallery', 'dex', 'records', 'settings'].includes(next);
  for (const button of document.querySelectorAll('[data-screen]')) {
    if (button.dataset.screen === next) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const id of ['slots', 'creator', 'home', 'map', 'workout', 'result', 'gallery', 'dex', 'records', 'settings']) $(id).hidden = id !== view;
  $(next).scrollTop = 0;
  window.scrollTo(0, 0);
  mountScene();
}
function updateSound() {
  $('sound').textContent = store.sound ? '音 ON' : '音 OFF';
  $('sound').setAttribute('aria-label', store.sound ? '音をオフにする' : '音をオンにする');
}
function unlockAudio() {
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {}); } catch {}
}
function beep(success = false) {
  if (!store.sound || !audio) return;
  try {
    const now = audio.currentTime;
    for (const [i, f] of (success ? [523, 659, 784] : [440, 660]).entries()) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, now + i * .09);
      g.gain.linearRampToValueAtTime(.12, now + i * .09 + .015);
      g.gain.exponentialRampToValueAtTime(.001, now + i * .09 + .18);
      o.connect(g); g.connect(audio.destination); o.start(now + i * .09); o.stop(now + i * .09 + .2);
    }
  } catch {}
}
$('sound').onclick = () => { store.sound = !store.sound; unlockAudio(); save(); updateSound(); if (store.sound) beep(); };

function renderSlots() {
  $('slot-list').replaceChildren();
  store.slots.forEach((slot, index) => {
    const card = document.createElement('section'); card.className = 'slot-card';
    const open = document.createElement('button'); open.className = 'slot-open';
    const number = document.createElement('small'); number.textContent = `SLOT 0${index + 1}`;
    const name = document.createElement('strong'); name.textContent = slot ? slot.name : '新しい冒険をはじめる';
    const details = document.createElement('span');
    details.textContent = slot ? `${JOBS[slot.job].name} Lv. ${progress(growth(slot).xp).level} · 累計 ${slot.xp.toLocaleString()} XP · ${slot.sets} セット` : '名前と髪色を決めて、自分の分身をつくろう。';
    const gem = document.createElement('i'); gem.className = 'slot-gem'; gem.style.setProperty('--hair', slot?.hair || '#567078'); const crest = document.createElement('img'); crest.src = slot ? '/art/crest.svg' : '/art/compass.svg'; crest.width = 40; crest.height = 40; crest.alt = ''; gem.append(crest);
    const copy = document.createElement('div'); copy.append(number, name, details); open.append(gem, copy);
    open.onclick = () => {
      if (!slot || !slot.configured) return editCharacter(index);
      data = slot; store.selected = index; save();
      selectedDay = localDate(); calendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      render(); show('home');
    };
    card.append(open);
    if (slot?.configured) {
      const edit = document.createElement('button'); edit.className = 'text-btn slot-edit'; edit.textContent = '名前・髪色を変更';
      edit.setAttribute('aria-label', `スロット${index + 1}の名前・髪色を変更`); edit.onclick = () => editCharacter(index); card.append(edit);
    }
    if (slot) {
      const remove = document.createElement('button'); remove.className = 'text-btn slot-delete'; remove.textContent = 'このセーブを削除';
      remove.setAttribute('aria-label', `スロット${index + 1}のセーブを削除`); remove.onclick = () => askDelete(index); card.append(remove);
    }
    $('slot-list').append(card);
  });
  updateSound();
}
function editCharacter(index) {
  editorIndex = index;
  const existing = store.slots[index];
  editorHair = existing?.hair || HAIR_COLORS[0].value;
  editorJob = existing?.job || 'sword';
  drawCreatorJobs();
  $('character-name').value = existing?.configured ? existing.name : '';
  $('creator-title').textContent = existing?.configured ? 'あなたらしい冒険者に。' : 'あなたの冒険者をつくる。';
  $('create-character').textContent = existing?.configured ? '変更を保存する' : 'この冒険者ではじめる';
  $('creator-note').textContent = existing ? 'これまでの経験値と運動の記録は、そのまま引き継ぎます。' : `スロット${index + 1}に、新しい冒険を保存します。`;
  $('hair-options').replaceChildren();
  HAIR_COLORS.forEach(({ value, name }) => {
    const label = document.createElement('label'); label.className = 'hair-option'; label.style.setProperty('--hair', value);
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'hair'; input.value = value; input.checked = value === editorHair;
    const swatch = document.createElement('span'); swatch.className = 'hair-swatch';
    const text = document.createElement('span'); text.textContent = name;
    input.onchange = () => { editorHair = value; drawCreatorJobs(); scene?.setCharacter(selectedProfile()); };
    label.append(input, swatch, text); $('hair-options').append(label);
  });
  show('creator');
}
$('character-form').onsubmit = event => {
  event.preventDefault();
  if (writeBlocked) return toast('保存を再開するには、この画面を再読み込みしてください。');
  const name = $('character-name').value.trim();
  if (!name || name.length > 16) return toast('名前を1〜16文字で入力してください。');
  const existing = store.slots[editorIndex];
  if (existing) Object.assign(existing, { name, hair: editorHair, configured: true });
  else store.slots[editorIndex] = createCharacter(name, editorHair);
  store.selected = editorIndex; data = store.slots[editorIndex]; ensureJobs(data); data.job=editorJob; save();
  render(); show('home');
  if (!existing) openStory();
};
// The story sheet: where the adventurer is, where the road leads, and the beacons relit so far.
let pendingStory = false;
function openStory(arrived = false, index = null) {
  const c = chapterOf(data), story = REGION_STORY[c.region], dest = destinationOf(c.chapter), depth = Math.floor(c.chapter / REGIONS.length);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  if (index !== null && index !== c.region) return openRegion(index, c.chapter, el);
  const sections = [];
  if (arrived && c.chapter > 0) sections.push(el('p', 'story-cleared', REGION_STORY[(c.chapter - 1) % REGION_STORY.length].cleared));
  const now = el('section', 'story-now');
  now.append(el('small', 'eyebrow', `CHAPTER ${String(c.chapter + 1).padStart(2, '0')} · 現在地`), el('h3', '', c.name), el('p', 'story-epithet', story.title), el('p', '', depth ? `${story.arrival} ${DEPTH_NOTE}` : story.arrival));
  const left = CHAPTER_BOSSES - c.progress;
  now.append(el('p', 'story-beacon', `灯標 ${'◆'.repeat(c.progress)}${'◇'.repeat(left)} · あと${left}体の魔物を鎮めると灯る`));
  now.append(el('p', 'story-natives', `この地の魔物：${NATIVES[c.region].map(f => { const m = monster(f, c.region); return data.dex[m.id] ? m.name : '？？？'; }).join('、')}`));
  const next = el('section', 'story-next');
  next.append(el('small', 'eyebrow', '次の目的地'), el('h3', '', `${REGIONS[dest.region][0]}${dest.depth ? ` · 深層${dest.depth}` : ''}`), el('p', '', REGIONS[dest.region][1]));
  const log = el('details', 'story-log'); log.append(el('summary', '', 'これまでの旅'));
  const opening = el('div', 'story-entry'); opening.append(el('strong', '', 'はじまり'), ...PROLOGUE.map(t => el('p', '', t))); log.append(opening);
  for (let i = 0; i < Math.min(c.chapter, REGION_STORY.length); i++) {
    const done = el('div', 'story-entry'); done.append(el('strong', '', `${REGIONS[i][0]} · 灯標を灯した`), el('p', '', REGION_STORY[i].cleared)); log.append(done);
  }
  log.open = c.chapter === 0 && !arrived;
  sections.push(now, next, log);
  $('story-title').textContent = arrived ? '新しいエリアに到着' : '冒険の物語';
  $('story-body').replaceChildren(...sections);
  $('story-dialog').showModal();
  $('story-body').scrollTop = 0;
}
// Another island from the map: its tale if visited, only a glimpse if not.
function openRegion(index, chapter, el) {
  const s = regionState(chapter, index), tale = REGION_STORY[index], [name, line] = REGIONS[index];
  const section = el('section', 'story-now');
  section.append(el('small', 'eyebrow', s.cleared ? '灯標を灯した地' : s.next ? '次の目的地' : '未踏の地'), el('h3', '', name));
  if (s.visited) {
    section.append(el('p', 'story-epithet', tale.title), el('p', '', tale.arrival));
    if (s.cleared) section.append(el('p', 'story-cleared', tale.cleared));
    section.append(el('p', 'story-natives', `この地の魔物：${NATIVES[index].map(f => { const m = monster(f, index); return data.dex[m.id] ? m.name : '？？？'; }).join('、')}`));
  } else {
    section.append(el('p', '', line), el('p', 'story-natives', s.next ? '今いる地の灯標を灯すと、ここへの道がひらける。' : 'まだ遠い地。灯標をたどって進もう。'));
  }
  $('story-title').textContent = 'アストラ群島';
  $('story-body').replaceChildren(section);
  $('story-dialog').showModal();
  $('story-body').scrollTop = 0;
}
$('journey-strip').onclick = () => { render(); show('map'); };
$('map-back').onclick = () => { render(); show('home'); };
$('close-story').onclick = () => $('story-dialog').close();
let deleteIndex = null;
function askDelete(index) {
  const slot = store.slots[index];
  if (!slot) return;
  if (writeBlocked) return toast('保存を再開するには、この画面を再読み込みしてください。');
  deleteIndex = index;
  $('delete-detail').textContent = `スロット${index + 1}「${slot.name}」の成長・運動記録・図鑑をすべて削除します。元に戻せません。残したい場合は、先に設定からバックアップしてください。`;
  $('delete-name').value = ''; $('delete-name').placeholder = slot.name; $('delete-confirm').disabled = true;
  $('delete-dialog').showModal();
}
$('delete-name').oninput = () => { $('delete-confirm').disabled = $('delete-name').value.trim() !== store.slots[deleteIndex]?.name; };
$('delete-cancel').onclick = () => $('delete-dialog').close();
$('delete-form').onsubmit = event => {
  event.preventDefault();
  const slot = store.slots[deleteIndex];
  if (!slot || writeBlocked || $('delete-name').value.trim() !== slot.name) return;
  deleteSlot(store, deleteIndex);
  if (data === slot) data = null;
  $('delete-dialog').close();
  if (save()) toast(`スロット${deleteIndex + 1}のセーブを削除しました。`);
  renderSlots(); show('slots');
};
$('creator-back').onclick = () => { renderSlots(); show('slots'); };
$('switch-slot').onclick = () => { renderSlots(); show('slots'); };
$('slots-import').onclick = () => $('import').click();

function render() {
  if (!data) return;
  const snapshot = JSON.stringify([data.rest, data.quest, data.bosses, data.best, data.items, data.dex]);
  ensureMotivation(data);
  if (JSON.stringify([data.rest, data.quest, data.bosses, data.best, data.items, data.dex]) !== snapshot) save();
  const g = growth(data), p = progress(g.xp);
  $('character-label').textContent = data.name;
  $('slot-label').textContent = `SLOT 0${store.selected + 1}`;
  $('level').textContent = p.level;
  $('xp-label').textContent = `${p.current} / ${p.needed} XP`;
  $('xp-next').textContent = p.needed - p.current;
  $('xp-bar').style.width = `${p.current / p.needed * 100}%`;
  $('rank').textContent = g.title;
  $('weapon').textContent = g.weapon;
  renderNext();
  const c = chapterOf(data), dest = destinationOf(c.chapter);
  $('journey-number').textContent = `CHAPTER ${String(c.chapter + 1).padStart(2, '0')} · 現在地`;
  $('region-label').textContent = c.name;
  $('region-next').textContent = `${REGIONS[dest.region][0]}${dest.depth ? ` · 深層${dest.depth}` : ''}`;
  $('route').replaceChildren(...Array.from({ length: CHAPTER_BOSSES }, (_, i) => { const pip = document.createElement('i'); if (i < c.progress) pip.className = 'lit'; return pip; }));
  $('journey-strip').setAttribute('aria-label', `現在地 ${c.name}、次の目的地 ${$('region-next').textContent}、灯標 ${c.progress}/${CHAPTER_BOSSES}。世界地図を開く`);
  const lit = c.chapter >= REGIONS.length ? REGIONS.length : c.chapter, depthNow = Math.floor(c.chapter / REGIONS.length);
  $('map-summary').textContent = `灯した灯標 ${lit}/${REGIONS.length}${depthNow ? ` · 深層${depthNow}を探索中` : ''} · 累計撃破 ${dexStats(data.dex).defeats}体`;
  renderWorldMap($('world-map'), { chapter: c.chapter, progress: c.progress, job: g.job, stage: g.stage, hair: data.hair, onSelect: i => openStory(false, i) });
  // Region backdrops are optional art; a missing file falls through to the guild background layered beneath.
  document.documentElement.style.setProperty('--region-art', `url('/art/regions/${REGION_STORY[c.region].id}.webp')`);
  const q = data.quest, qUnit = MODES[q.mode].unit, qDone = data.daily[q.day]?.byMode[q.mode]?.amount || 0;
  $('today-quest').textContent = q.done ? `依頼達成 ✓ ${MODES[q.mode].name} ${q.target}${qUnit}` : `今日の依頼：${MODES[q.mode].name} ${Math.min(qDone, q.target)}/${q.target}${qUnit} · +${BONUS.quest}XP`;
  const body = fullBodyProgress(data, localDate());
  const bodyText = body.awarded ? '全身制覇 ✓' : `全身制覇 ${body.done.length}/${body.total}`;
  $('rest-note').textContent = data.rest.pool ? `${bodyText} · 休息 ${data.rest.pool}XP（2倍）` : body.awarded ? bodyText : `${bodyText} · +${BONUS.fullBody}XP`;
  for (const el of document.querySelectorAll('[data-boss]')) {
    const b = bossOf(data, el.dataset.boss);
    // HP comes first so the carried-over state survives truncation on narrow 2x2 tiles.
    el.textContent = `HP ${b.hp}/${b.max}${b.hp < b.max ? ' 持ち越し' : ''} · ${b.rare ? '★' : ''}Lv.${b.level} ${b.name}${b.isNew ? ' NEW' : ''}`;
  }
  for (const b of document.querySelectorAll('[data-mode]')) { b.classList.toggle('is-request', b.dataset.mode === q.mode && !q.done); b.classList.toggle('done-today', body.done.includes(b.dataset.mode)); }
  $('best-stats').replaceChildren(...Object.entries(MODES).map(([m, info]) => {
    const d = document.createElement('div'), label = document.createElement('small'), value = document.createElement('strong');
    label.textContent = info.name; value.textContent = `${data.best[m]}${info.unit}`; d.append(label, value); return d;
  }));
  const ds = dexStats(data.dex);
  $('dex-stats').replaceChildren(...[['発見', `${ds.found} / ${ds.total}`], ['累計撃破', `${ds.defeats.toLocaleString()} 体`], ['レア撃破', `${ds.rares} 体`]].map(([label, value]) => {
    const d = document.createElement('div'), k = document.createElement('small'), v = document.createElement('strong'); k.textContent = label; v.textContent = value; d.append(k, v); return d;
  }));
  renderBestiary($('bestiary'), data.dex, { grouped: true, current: c.region });
  const items = Object.entries(data.items);
  $('item-stats').textContent = items.length ? `戦利品：${items.map(([k, n]) => `${k} ×${n}`).join('、')}` : 'ボスを倒すと戦利品が手に入ります。まれに星のかけらも。';
  $('total-label').textContent = `${data.sets} セット達成`;
  $('lifetime-xp').textContent = data.xp.toLocaleString();
  $('lifetime-sets').textContent = data.sets.toLocaleString();
  $('job-stats').replaceChildren();
  for (const [job, info] of Object.entries(JOBS)) {
    const row = document.createElement('div');row.className='job-stat';
    const label = document.createElement('span');label.textContent=info.name+(job===data.job?' · 育成中':'');
    const value = document.createElement('strong');value.textContent=`Lv. ${progress(data.jobs[job]).level} / ${data.jobs[job].toLocaleString()} XP`;
    row.append(label,value);$('job-stats').append(row);
  }
  $('today-xp').textContent = `${(data.daily[localDate()]?.xp || 0).toLocaleString()} XP`;
  $('history').replaceChildren();
  if (!data.history.length) {
    const e = document.createElement('div'); e.className = 'history-empty'; e.textContent = '物語は、最初の1回から。クエストを選ぶと、ここに冒険が刻まれます。'; $('history').append(e);
  }
  for (const row of data.history.slice(0, 5)) {
    const e = document.createElement('div'); e.className = 'history-row';
    const left = document.createElement('div'), small = document.createElement('small'), right = document.createElement('span');
    left.textContent = `${MODES[row.mode].name} ${row.amount}${MODES[row.mode].unit}${row.boss ? ' · ボス撃破' : ''}`;
    small.textContent = new Date(row.date).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    left.append(small); right.textContent = `+${row.xp} XP`; e.append(left, right); $('history').append(e);
  }
  renderCalendar(); updateSound();
}
// Job cards show each class as it currently stands; the finished form stays a mystery until reached.
function drawJobs(el,selected,onPick,hair,jobsXp={}) {
  el.replaceChildren();
  for(const [job,info] of Object.entries(JOBS)) {
    const stage=growth({jobs:{sword:0,mage:0,rogue:0,...jobsXp},job},job).stage;
    const b=document.createElement('button');b.type='button';b.className='job-choice';b.setAttribute('aria-pressed',String(job===selected));b.setAttribute('aria-label',info.name+'を選ぶ');
    const name=document.createElement('strong');name.textContent=info.name;
    const dream=document.createElement('small');dream.textContent=info.dream;
    b.append(portrait(job,stage,hair,`${info.name}・${info.ranks[stage]}`),name,dream);b.onclick=()=>onPick(job);el.append(b);
  }
}
function drawCreatorJobs(){drawJobs($('creator-jobs'),editorJob,job=>{editorJob=job;drawCreatorJobs();mountScene();},editorHair,store.slots[editorIndex]?.jobs);}
function renderNext(){
 const g=growth(data),info=JOBS[g.job];
 $('job-summary').textContent=`${info.name} · 職業XP ${g.xp.toLocaleString()} · 段階 ${g.stage+1}/5`;
 $('next-portrait').replaceChildren(portrait(g.job,Math.min(4,g.stage+1),data.hair));
 $('next-title').textContent=g.next?`次は、${info.ranks[g.stage+1]}`:`${g.title} · 熟練の星 ${g.mastery}`;
 $('next-detail').textContent=g.next?`あと ${(g.next-g.xp).toLocaleString()} 職業XPで新しい姿へ`:'この職業を極めながら、別の職業も育てられます。';
 $('small-reward').textContent=`次の報酬：${g.reward.name}まで ${(g.reward.xp-g.xp).toLocaleString()} XP`;
 $('growth-bar').style.width=g.next?`${(g.xp-STAGES[g.stage])/(g.next-STAGES[g.stage])*100}%`:'100%';
 $('medal-status').textContent=g.medals?`獲得した勲章 ${'◆'.repeat(g.medals)}`:'最初の10XPで、銅の勲章を獲得';
}
function renderGallery(){
 drawJobs($('gallery-jobs'),galleryJob,job=>{galleryJob=job;galleryStage=growth(data,job).stage;renderGallery();mountScene();},data.hair,data.jobs);
 const current=growth(data,galleryJob);$('stage-options').replaceChildren();
 STAGES.forEach((xp,i)=>{
 const seen=formVisibility(current.xp,i),hidden=seen==='hidden';
 const b=document.createElement('button');b.className='stage-choice';b.setAttribute('aria-pressed',String(galleryStage===i));b.setAttribute('aria-label',hidden?`まだ見ぬ姿（${xp.toLocaleString()} XP）`:JOBS[galleryJob].ranks[i]+'の姿を見る');
 const title=document.createElement('strong');title.textContent=hidden?'？？？':JOBS[galleryJob].ranks[i];const sub=document.createElement('small');sub.textContent=seen==='reached'?`${xp.toLocaleString()} XP · 到達済み`:seen==='next'?`あと ${(xp-current.xp).toLocaleString()} XP · 次の姿`:`${xp.toLocaleString()} XP · 未到達`;
 b.append(portrait(galleryJob,i,data.hair,'',hidden),title,sub);b.onclick=()=>{galleryStage=i;renderGallery();mountScene();};$('stage-options').append(b);
 });
 const shown=formVisibility(current.xp,galleryStage);
 $('gallery-caption').textContent=shown==='reached'?`${JOBS[galleryJob].ranks[galleryStage]} · 到達済みの姿`:shown==='next'?`${JOBS[galleryJob].ranks[galleryStage]} · 次にたどり着く姿`:galleryStage===4?`？？？ · ${JOBS[galleryJob].dream}`:'？？？ · たどり着いたときに姿が明らかに';
 $('equip-job').textContent=galleryJob===data.job?'この職業で育成中':`${JOBS[galleryJob].name}で育てる`;
 $('equip-job').disabled=galleryJob===data.job;
 $('gallery-progress').textContent=`保存済み：${current.xp.toLocaleString()} 職業XP ／ ${current.title}。職業を変えても進捗は残ります。`;
}
$('open-gallery').onclick=()=>{galleryJob=data.job;galleryStage=growth(data).stage;renderGallery();show('gallery');};
$('gallery-back').onclick=()=>{render();show('home');};
$('equip-job').onclick=()=>{if(writeBlocked)return toast('再読み込みしてから変更してください。');data.job=galleryJob;save();render();show('home');toast(`${JOBS[data.job].name}の育成に切り替えました。`);};
for (const button of document.querySelectorAll('[data-screen]')) button.onclick = () => {
  const next = button.dataset.screen;
  if (next === 'gallery') { $('open-gallery').click(); return; }
  render(); show(next);
};
for (const button of document.querySelectorAll('[data-record]')) button.onclick = () => {
  for (const item of document.querySelectorAll('[data-record]')) {
    const selected = item === button;
    item.setAttribute('aria-pressed', String(selected));
    $(`record-${item.dataset.record}`).hidden = !selected;
  }
};
$('settings-slots').onclick = () => { renderSlots(); show('slots'); };
document.querySelector('.brand').onclick = event => {
  event.preventDefault();
  if (session) finish();
  else if (data) { render(); show('home'); }
  else { renderSlots(); show('slots'); }
};
$('workout-help').onclick = () => { pause(); $('workout-guide').showModal(); };
$('close-help').onclick = () => $('workout-guide').close();
$('preview-attack').onclick=()=>scene?.play('attack');
$('preview-victory').onclick=()=>scene?.play('celebrate');
function renderCalendar() {
  if (!data) return;
  const year = calendarDate.getFullYear(), month = calendarDate.getMonth(), today = localDate();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const monthXp = Object.entries(data.daily).filter(([k]) => k.startsWith(prefix)).reduce((sum, [, d]) => sum + d.xp, 0);
  $('calendar-month').textContent = `${year}年 ${month + 1}月`;
  $('month-total').textContent = `${monthXp.toLocaleString()} XP / 月`;
  $('next-month').disabled = year * 12 + month >= new Date().getFullYear() * 12 + new Date().getMonth();
  $('calendar-grid').replaceChildren();
  for (const key of monthCells(year, month)) {
    if (!key) { const e = document.createElement('span'); e.className = 'calendar-blank'; $('calendar-grid').append(e); continue; }
    const xp = data.daily[key]?.xp || 0, e = document.createElement('button');
    e.className = 'calendar-day';
    e.dataset.heat = xp >= 300 ? '3' : xp >= 100 ? '2' : xp > 0 ? '1' : '0';
    e.classList.toggle('is-today', key === today);
    if (key === today) e.setAttribute('aria-current', 'date');
    e.setAttribute('aria-pressed', String(key === selectedDay));
    e.setAttribute('aria-label', `${key.replaceAll('-', '/')}、${xp} XP${key === today ? '、今日' : ''}`);
    e.disabled = key > today;
    const n = document.createElement('span'), amount = document.createElement('small');
    n.textContent = Number(key.slice(-2)); amount.textContent = key > today ? '' : xp.toLocaleString();
    e.append(n, amount); e.onclick = () => { selectedDay = key; renderCalendar(); }; $('calendar-grid').append(e);
  }
  const day = data.daily[selectedDay];
  $('day-detail').replaceChildren();
  const title = document.createElement('strong'); title.textContent = `${selectedDay.replaceAll('-', '/')} · ${(day?.xp || 0).toLocaleString()} XP`;
  $('day-detail').append(title);
  if (day?.xp) {
    for (const [mode, entry] of Object.entries(day.byMode)) {
      const row = document.createElement('p'); row.textContent = `${MODES[mode].name} ${entry.amount}${MODES[mode].unit}　+${entry.xp} XP`; $('day-detail').append(row);
    }
    if (day.bonus) { const row = document.createElement('p'); row.textContent = `ボス・自己ベスト・休息などのボーナス　+${day.bonus} XP`; $('day-detail').append(row); }
  } else {
    const empty = document.createElement('p'); empty.textContent = selectedDay > today ? 'これからの冒険。' : selectedDay === today ? '今日の物語は、これから。' : '運動の記録はありません。休む日も、冒険の一部。'; $('day-detail').append(empty);
  }
  $('legacy-note').hidden = !data.undatedXp;
  $('legacy-note').textContent = `旧データのうち ${data.undatedXp.toLocaleString()} XP は日時が残っていないため、累計経験値にのみ含めています。`;
}
function moveMonth(delta) {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1);
  const now = new Date();
  selectedDay = calendarDate.getFullYear() === now.getFullYear() && calendarDate.getMonth() === now.getMonth() ? localDate() : localDate(calendarDate);
  renderCalendar();
}
$('prev-month').onclick = () => moveMonth(-1);
$('next-month').onclick = () => moveMonth(1);
$('calendar-today').onclick = () => { const now = new Date(); calendarDate = new Date(now.getFullYear(), now.getMonth(), 1); selectedDay = localDate(); renderCalendar(); };

const instructions = {
  pushup: 'iPhoneを床の安定した場所に置き、下がったときに大きなカウント画面を顎などで軽くタッチ。膝つきでもOK。首を伸ばしたり、画面に強くぶつけたりしないでください。',
  squat: 'iPhoneを胸元で両手で持ち、しゃがんでから立ち上がります。開始後は1秒静止。うまく数えない場合は、一度止めて感度を調整してください。',
  plank: '開始後の3秒で姿勢を準備。肘とつま先で体を支え、無理のない時間でキープします。姿勢の自動判定はありません。休むときは一時停止してください。',
  superman: 'iPhoneを顔の前の床に置き、うつ伏せで腕を前に伸ばします。開始後の3秒で準備し、両手と両脚を床から少し浮かせてキープ。首は反らさず目線は床へ。腰に痛みが出たら中止してください。姿勢の自動判定はありません。',
};
function setup(mode) {
  if (writeBlocked) return toast('別の画面の記録を読み込むため、再読み込みしてください。');
  ensureMotivation(data);
  session = { mode, amount: 0, kills: 0, defeated: false, boss: bossOf(data, mode), state: 'ready', elapsed: 0, timer: null, detector: new RepDetector(Number($('sensitivity').value)), lastSensor: 0 };
  data.active = newActive(mode, new Date(), data.job); save();
  $('mode-title').textContent = MODES[mode].name;
  $('mode-category').textContent = { pushup: 'STRENGTH QUEST', squat: 'POWER QUEST', plank: 'ENDURANCE QUEST', superman: 'GUARDIAN QUEST' }[mode];
  $('instructions').textContent = instructions[mode];
  $('squat-settings').hidden = mode !== 'squat'; $('sensitivity').disabled = false;
  $('start').hidden = false; $('start').disabled = false; $('start').textContent = 'クエストをはじめる';
  $('pause').hidden = true; $('finish').hidden = true; $('count').textContent = '0';
  $('unit').textContent = MODES[mode].unit;
  battle.reset(data.job, session.boss);
  $('status').textContent = '準備できたら、はじめよう'; $('sensor-status').textContent = '';
  showGuide(mode, 'ready');
  $('counter').disabled = true;
  $('counter').setAttribute('aria-label', mode === 'pushup' ? '腕立てを1回カウント' : '運動のカウント');
  updateCount(false); show('workout');
}
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setup(b.dataset.mode));
// Painted quest icons at /art/quest/<mode>.webp are optional; the SVG pictograms stay until one loads.
for (const img of document.querySelectorAll('.quest-icon img')) {
  const painted = new Image(), mode = img.closest('[data-mode]').dataset.mode;
  painted.onload = () => { img.src = painted.src; img.classList.add('is-painted'); };
  painted.src = `/art/quest/${mode}.webp`;
}
async function keepAwake() {
  try { if ('wakeLock' in navigator) { const lock = await navigator.wakeLock.request('screen'); if (!session || !['countdown', 'running'].includes(session.state)) lock.release().catch(() => {}); else wake = lock; } } catch {}
}
function releaseWake() { wake?.release().catch(() => {}); wake = null; }
function persistActive() {
  if (data?.active && session) { creditAmount(data.active, session.amount); save(); }
}
function updateCount(impact = true) {
  const { mode, amount, boss } = session, unit = MODES[mode].unit, best = data.best[mode];
  const st = bossState(boss, amount), hits = defeats(mode, amount), previous = session.kills, justDefeated = st.defeated && !session.defeated;
  session.kills = hits; session.defeated = st.defeated;
  $('count').textContent = amount;
  $('raw-count').textContent = st.defeated ? `ボス撃破！ オーバーキル +${st.overkill}${unit}` : `ボスに ${amount} ダメージ · 残りHP ${st.hp}`;
  $('enemy-hp').style.width = `${st.hp / st.max * 100}%`;
  const record = best && amount > best ? '自己ベスト更新中！' : best ? `自己ベスト ${best}${unit}` : 'はじめての記録に挑戦';
  $('enemy-label').textContent = `${st.defeated ? '撃破！ ここからはオーバーキル' : boss.hp < boss.max && !amount ? `前回の残りHP ${st.hp}。倒しきろう` : `HP ${st.hp}/${st.max}`} · ${record}`;
  if (impact && (justDefeated || hits > previous)) {
    beep(justDefeated);
    scene?.play(justDefeated ? 'celebrate' : mode === 'squat' ? 'heavy' : 'attack');
    battle.strike({ crit: !justDefeated && Math.random() < 0.125, defeated: justDefeated, overkill: justDefeated ? 0 : st.overkill });
    $('counter').classList.remove('impact'); void $('counter').offsetWidth; $('counter').classList.add('impact');
  }
  persistActive();
}
function countRep() { if (session?.state !== 'running' || writeBlocked) return; session.amount++; updateCount(); }
function motion(e) {
  if (session?.mode !== 'squat' || !['countdown', 'running'].includes(session.state)) return;
  const v = e.accelerationIncludingGravity;
  if (!v || ![v.x, v.y, v.z].every(Number.isFinite)) return;
  session.lastSensor = performance.now();
  if (session.state === 'running' && session.detector.feed(v, performance.now())) countRep();
}
window.addEventListener('devicemotion', motion);
async function start() {
  if (!session || !['ready', 'paused'].includes(session.state) || writeBlocked) return;
  const current = session; unlockAudio(); $('start').disabled = true;
  // Speaking inside the tap unlocks speech on iOS; later cues then play from the countdown timer.
  say(GUIDE[current.mode].cues[0]);
  if (current.mode === 'squat') {
    try {
      if (!window.DeviceMotionEvent) throw new Error('unsupported');
      if (typeof DeviceMotionEvent.requestPermission === 'function' && await DeviceMotionEvent.requestPermission() !== 'granted') throw new Error('denied');
    } catch (e) {
      $('sensor-status').textContent = e.message === 'denied' ? 'センサーが許可されていません。Safariのサイト設定を確認して、もう一度お試しください。' : 'この環境では動作センサーを使えません。iPhoneのSafariで開いてください。';
      $('start').disabled = false; return;
    }
  }
  if (session !== current || document.hidden) { $('start').disabled = false; return; }
  current.state = 'countdown'; keepAwake(); current.countdown = performance.now();
  current.detector = new RepDetector(Number($('sensitivity').value));
  $('sensitivity').disabled = true; $('start').hidden = true; $('pause').hidden = false;
  $('finish').hidden = false; $('status').textContent = `準備 · ${countdownOf(current.mode)}`;
  current.cueIndex = 0; showGuide(current.mode, 'countdown');
  $('sensor-status').textContent = current.mode === 'squat' ? 'センサー接続を確認中…' : '';
  current.timer = setInterval(tick, 100);
}
// Guide panel over the battle arena: the full setup card before starting, one big cue per second while counting down.
function showGuide(mode, phase) {
  const g = GUIDE[mode], art = $('guide-art');
  art.onerror = () => { art.onerror = null; art.src = `/art/${mode}.svg`; art.classList.add('is-icon'); };
  art.classList.remove('is-icon'); art.src = `/art/guide/${mode}.webp`; art.alt = `${MODES[mode].name}の構えとスマホの置き場所`;
  // An optional second frame (/art/guide/<mode>-2.webp, the end of the movement) alternates with the first to show motion.
  const second = $('guide-art-2'), frame = new Image();
  second.hidden = true; $('guide-panel').classList.remove('is-moving');
  frame.onload = () => { if ($('guide-panel').dataset.mode !== mode) return; second.src = frame.src; second.hidden = false; $('guide-panel').classList.add('is-moving'); };
  frame.src = `/art/guide/${mode}-2.webp`;
  $('guide-panel').dataset.mode = mode;
  $('guide-panel').dataset.phase = phase;
  $('guide-cue').textContent = phase === 'ready' ? `${MODES[mode].name}の準備` : g.cues[0];
  $('guide-phone').textContent = g.phone; $('guide-form').textContent = g.form;
  $('guide-count').textContent = phase === 'countdown' ? countdownOf(mode) : '';
  $('guide-panel').hidden = false;
}
function hideGuide() { $('guide-panel').hidden = true; }
// Short spoken cues follow the sound setting; unsupported browsers simply stay silent.
function say(text) {
  if (!store.sound || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = 1.1; speechSynthesis.speak(u); } catch {}
}
function tick() {
  if (!session) return;
  const now = performance.now();
  if (session.state === 'countdown') {
    const left = countdownOf(session.mode) - Math.floor((now - session.countdown) / 1000);
    $('status').textContent = `準備 · ${Math.max(1, left)}`;
    $('guide-count').textContent = Math.max(1, left);
    // The first cue was spoken on tap; each later second speaks its own cue once.
    const cueIndex = Math.floor((now - session.countdown) / 1000);
    if (cueIndex !== session.cueIndex && cueIndex < countdownOf(session.mode)) { session.cueIndex = cueIndex; const cue = cueAt(session.mode, now - session.countdown); $('guide-cue').textContent = cue; say(cue); }
    if (left <= 0) {
      if (session.mode === 'squat' && now - session.lastSensor > 1500) { pause(); $('sensor-status').textContent = 'センサーの値が届いていません。許可・端末を確認して再開してください。'; return; }
      session.state = 'running'; session.segment = now; session.detector.reset(); hideGuide();
      $('status').textContent = session.mode === 'pushup' ? 'ここを軽くタッチ' : session.mode === 'squat' ? '1秒静止してから、ゆっくり動こう' : '呼吸を止めず、自分のペースで';
      $('counter').disabled = session.mode !== 'pushup';
      $('sensor-status').textContent = session.mode === 'squat' ? 'センサー接続済み · ゆっくり1往復で1回' : '';
      scene?.setMode(MODES[session.mode].timer ? 'guard' : 'idle'); beep();
    }
    return;
  }
  if (session.state !== 'running') return;
  if (MODES[session.mode].timer) {
    const amount = Math.floor((session.elapsed + now - session.segment) / 1000);
    if (amount !== session.amount) { session.amount = amount; updateCount(); }
  }
  if (session.mode === 'squat' && now - session.lastSensor > 2500) { pause(); $('sensor-status').textContent = 'センサーが途切れたため一時停止しました。'; }
}
function pause() {
  if (!session || !['running', 'countdown'].includes(session.state)) return;
  if (session.state === 'running' && MODES[session.mode].timer) { session.elapsed += performance.now() - session.segment; session.amount = Math.floor(session.elapsed / 1000); updateCount(false); }
  session.state = 'paused'; clearInterval(session.timer); releaseWake(); scene?.setMode('idle'); window.speechSynthesis?.cancel(); showGuide(session.mode, 'ready');
  $('counter').disabled = true; $('status').textContent = '一時停止中'; $('pause').hidden = true;
  $('start').hidden = false; $('start').disabled = false; $('start').textContent = '再開する'; $('sensitivity').disabled = false; persistActive();
}
$('start').onclick = start; $('pause').onclick = pause;
function tap() { const now = performance.now(); if (session?.mode !== 'pushup' || session.state !== 'running' || now - lastTouch < 700) return; lastTouch = now; countRep(); }
$('counter').addEventListener('pointerdown', e => { if (!e.isPrimary) return; e.preventDefault(); tap(); });
$('counter').addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); tap(); } });
function finish() {
  if (!session) return;
  pause(); clearInterval(session.timer); releaseWake();
  const { mode, amount } = session, before = progress(growth(data).xp).level, beforeGrowth=growth(data);
  persistActive(); const base = commitActive(data), report = base ? resolveSet(data, data.history[0]) : null; save(); session = null;
  if (!amount) { render(); show('home'); return; }
  const after = progress(growth(data).xp).level, earned = base + report.bonus, unit = MODES[mode].unit;
  $('result-title').textContent = report.boss.defeated ? 'ボスを撃破した！' : '今日の一歩が、力になる。';
  $('result-description').textContent = `${MODES[mode].name} ${amount}${unit} 達成`;
  $('reward-xp').textContent = earned;
  const lines = [{ text: `${MODES[mode].name} ${amount}${unit}`, xp: base }, ...report.lines];
  if (report.drops.length) lines.push({ text: `戦利品：${report.drops.join('、')}`, xp: 0 });
  if (report.chapterUp) lines.push({ text: `灯標が灯った！ 次のエリアへ：${chapterOf(data).name}`, xp: 0 });
  pendingStory = report.chapterUp;
  $('result-lines').replaceChildren(...lines.map(({ text, xp }) => {
    const li = document.createElement('li'), label = document.createElement('span'); label.textContent = text; li.append(label);
    if (xp) { const value = document.createElement('strong'); value.textContent = `+${xp} XP`; li.append(value); }
    return li;
  }));
  $('level-up').textContent = after > before ? `LEVEL UP! Lv. ${before} → Lv. ${after}` : '経験値を獲得。着実に、強くなっている。';
  $('result-summary').textContent = `累計 ${data.xp.toLocaleString()} XP · ${data.sets} セット ／ ${JOBS[data.job].name} Lv. ${after}${storageOK ? ' · 自動保存しました' : ' · 保存できませんでした。バックアップしてください'}`;
  const g=growth(data);
  $('growth-reward').textContent = g.stage>beforeGrowth.stage ? `昇格！ ${g.title}になりました。新しい装備を身につけた！` : g.medals>beforeGrowth.medals ? `勲章を獲得！ ${JOBS[g.job].name}の成長が姿に刻まれました。` : `${JOBS[g.job].name} +${earned} XP · 次の${g.reward.name}まで ${Math.max(0,g.reward.xp-g.xp).toLocaleString()} XP`;
  show('result'); beep(true);
}
$('finish').onclick = finish;
$('back').onclick = () => { if (session) finish(); };
$('return').onclick = () => { selectedDay = localDate(); render(); show('home'); if (pendingStory) { pendingStory = false; openStory(true); } };
function refreshDate() {
  const today = localDate();
  if (currentDay !== today) {
    if (selectedDay === currentDay) selectedDay = today;
    const old = currentDay; currentDay = today;
    if (old.slice(0, 7) !== today.slice(0, 7)) calendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (['home', 'map', 'dex', 'records', 'settings'].includes(view)) render();
  }
}
setInterval(refreshDate, 30000);
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); scene?.setVisible(false); } else { refreshDate(); mountScene(); } });
window.addEventListener('pagehide', pause);
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  writeBlocked = true; storageOK = false; pause();
  warning('別の画面で記録が更新されました。上書きを防ぐため一時停止しています。再読み込みして続けてください。');
});
$('export').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }));
  a.download = `rep-quest-3slots-${localDate()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('import').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 10000000) throw new Error();
    const raw = JSON.parse(await file.text());
    const restored = raw.version === 1 ? migrateLegacy(raw) : validateStore(raw);
    if (!confirm('3つのスロットを、バックアップの内容で置き換えますか？現在の記録は置き換わります。')) return;
    for (const slot of restored.slots) if (slot?.active && commitActive(slot)) resolveSet(slot, slot.history[0]);
    // Explicit restoration is a full replacement, including recovery from a corrupt save.
    restored.revision = (store.revision || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    store = restored; data = null; writeBlocked = false; storageOK = true; $('storage-warning').hidden = true;
    renderSlots(); show('slots'); toast('3つのスロットを復元しました。');
  } catch { toast('復元できませんでした。REP QUESTのバックアップと端末の空き容量を確認してください。'); }
  finally { event.target.value = ''; }
};
renderSlots(); show('slots');
if (recovered) toast('前回の途中までの運動を、運動した日付で記録しました。');
appUpdates = createAppUpdates({
  serviceWorker: navigator.serviceWorker, button: $('app-update'), notify: toast,
  isBusy: () => Boolean(session), reload: () => location.reload(),
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) appUpdates.check();
});
setInterval(() => { if (!document.hidden) appUpdates.check(); }, 5 * 60 * 1000);
