// Display-only combat: saved amounts remain actual reps or whole seconds.
export function defeats(mode, amount) {
  return mode === 'plank' ? Math.floor(amount / 5) : amount;
}
const ENEMIES = [
  {sprite:'slime',name:'ルーンスライム'},
  {sprite:'bat',name:'夜羽のコウモリ'},
  {sprite:'golem',name:'苔石のゴーレム'},
];
export function createBattle(arena) {
  const enemy = arena.querySelector('.battle-enemy');
  const effects = arena.querySelector('.battle-effects');
  const name = document.getElementById('enemy-name');
  const feedback = document.getElementById('battle-feedback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, job='sword';
  function spawn(kills) {
    const next=ENEMIES[Math.floor(kills / 5) % ENEMIES.length];
    enemy.src=`/sprites/${next.sprite}.webp`;
    name.textContent=`WAVE ${Math.floor(kills / 5)+1} · ${next.name}`;
  }
  function temporary(el, duration=700) {
    effects.append(el);
    setTimeout(()=>el.remove(),duration);
  }
  return {
    reset(nextJob) {
      job=nextJob;clearTimeout(timer);effects.replaceChildren();
      feedback.textContent='';arena.dataset.job=job;enemy.classList.remove('arriving');spawn(0);
    },
    sync(kills) { spawn(kills); },
    strike(kills) {
      clearTimeout(timer);
      feedback.textContent=kills%5===0?`${kills} 体撃破！ WAVE CLEAR`:'撃破！ +10 XP';
      if(!reduced.matches) {
        const fallen=enemy.cloneNode();fallen.className='battle-enemy defeated';temporary(fallen);
        const slash=document.createElement('i');slash.className='battle-strike';temporary(slash);
        for(let i=0;i<8;i++) {
          const p=document.createElement('i');p.className='battle-spark';
          p.style.setProperty('--dx',`${Math.cos(i*Math.PI/4)*65}px`);
          p.style.setProperty('--dy',`${Math.sin(i*Math.PI/4)*65-20}px`);temporary(p);
        }
        enemy.classList.remove('arriving');void enemy.offsetWidth;enemy.classList.add('arriving');
      }
      spawn(kills);
      timer=setTimeout(()=>feedback.textContent='',1300);
    },
  };
}
