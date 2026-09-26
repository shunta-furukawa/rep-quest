// Activation is explicit; controller changes in another tab never interrupt a set.
export function createAppUpdates({ serviceWorker, button, notify, isBusy, reload }) {
  let registration, waiting, changed=false, checking=false, activating=false, requested=false;
  let controlled=Boolean(serviceWorker?.controller);
  const watched=new WeakSet();
  function refresh() {
    button.hidden=!serviceWorker;
    button.disabled=checking || activating || (Boolean(waiting || changed) && isBusy());
    button.textContent=activating?'更新中…':waiting || changed?'更新する':checking?'確認中…':'更新確認';
    button.classList.toggle('update-ready',Boolean(waiting || changed));
    button.setAttribute('aria-label',waiting || changed?'新しいバージョンに更新する':'アプリの更新を確認する');
  }
  function detect() {
    waiting=registration?.waiting || null;
    refresh();
  }
  function watch(worker) {
    if(!worker || watched.has(worker))return;
    watched.add(worker);
    worker.addEventListener('statechange',()=>{
      if(worker.state==='installed')detect();
      if(worker.state==='redundant'){detect();notify('更新を準備できませんでした。接続を確認して、もう一度お試しください。');}
    });
  }
  async function check(manual=false) {
    if(!registration || checking || activating)return;
    checking=true;refresh();
    try {
      await registration.update();detect();watch(registration.installing);
      if(manual)notify(waiting || changed?'新しいバージョンがあります。「更新する」を押してください。':registration.installing?'更新を準備しています。準備ができると「更新する」に変わります。':'最新バージョンです。');
    } catch { if(manual)notify('更新を確認できません。オンラインで、もう一度お試しください。'); }
    finally { checking=false;refresh(); }
  }
  button.onclick=()=>{
    if(waiting || changed) {
      if(isBusy())return notify('セットを終えてから更新できます。');
      if(changed)return reload();
      requested=true;activating=true;refresh();
      waiting.postMessage({type:'ACTIVATE_UPDATE'});
    } else check(true);
  };
  if(serviceWorker) {
    serviceWorker.addEventListener('controllerchange',()=>{
      if (!controlled && !requested) { controlled=true;detect();return; }
      controlled=true;
      changed=true;waiting=null;activating=false;
      if(requested && !isBusy())reload();
      else { requested=false;refresh(); }
    });
    checking=true;
    serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{
      registration=reg;checking=false;detect();watch(reg.installing);
      reg.addEventListener('updatefound',()=>watch(reg.installing));
    }).catch(()=>{checking=false;button.hidden=true;});
  }
  refresh();
  return {check,refresh};
}
