// Display-only combat: saved amounts remain actual reps or whole seconds.
export function defeats(mode, amount) {
  return mode === 'plank' ? Math.floor(amount / 5) : amount;
}
// One boss per set. Each rep (or plank second) is one point of damage.
export function bossState(boss, amount) {
  const dealt = Math.min(amount, boss.hp);
  return { hp: boss.hp - dealt, max: boss.max, defeated: amount >= boss.hp, overkill: Math.max(0, amount - boss.hp) };
}
export function createBattle(arena) {
  const enemy = arena.querySelector('.battle-enemy');
  const effects = arena.querySelector('.battle-effects');
  const name = document.getElementById('enemy-name');
  const feedback = document.getElementById('battle-feedback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, job='sword';
  function temporary(el, duration=700) {
    effects.append(el);
    setTimeout(()=>el.remove(),duration);
  }
  return {
    reset(nextJob, boss) {
      job=nextJob;clearTimeout(timer);effects.replaceChildren();
      feedback.textContent='';arena.dataset.job=job;enemy.classList.remove('arriving','hit','vanquished');
      enemy.src=`/sprites/${boss.sprite}.webp`;
      name.textContent=`BOSS · ${boss.name} Lv.${boss.level}`;
    },
    strike({ crit=false, defeated=false, overkill=0 }={}) {
      clearTimeout(timer);
      feedback.textContent=defeated?'BOSS DEFEATED!':overkill?`オーバーキル +${overkill}`:crit?'会心の一撃！':'HIT!';
      arena.classList.toggle('crit',crit||defeated);
      if(!reduced.matches) {
        if(defeated){const fallen=enemy.cloneNode();fallen.className='battle-enemy defeated';temporary(fallen);}
        const slash=document.createElement('i');slash.className='battle-strike';temporary(slash);
        for(let i=0;i<(crit||defeated?14:8);i++) {
          const p=document.createElement('i');p.className='battle-spark';const r=crit||defeated?90:65;
          p.style.setProperty('--dx',`${Math.cos(i*Math.PI*2/(crit||defeated?14:8))*r}px`);
          p.style.setProperty('--dy',`${Math.sin(i*Math.PI*2/(crit||defeated?14:8))*r-20}px`);temporary(p);
        }
        if(!defeated&&!overkill){enemy.classList.remove('hit');void enemy.offsetWidth;enemy.classList.add('hit');}
      }
      if(defeated)enemy.classList.add('vanquished');
      timer=setTimeout(()=>{feedback.textContent='';arena.classList.remove('crit');},1300);
    },
  };
}
