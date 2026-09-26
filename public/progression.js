export const JOBS = {
  sword: { name:'剣士', dream:'光をまとう英雄へ', ranks:['見習い剣士','旅の剣士','銀の騎士','蒼天の騎士','暁の英雄'], weapons:['旅立ちの剣','鋼の剣','騎士の長剣','蒼天の剣','暁のルーンブレード'] },
  mage: { name:'魔法使い', dream:'星を導く大魔導師へ', ranks:['見習い魔法使い','青晶の術師','星詠みの術師','賢者','星導の大魔導師'], weapons:['木の杖','青晶の杖','星詠みの杖','賢者の杖','星導の宝杖'] },
  rogue: { name:'盗賊', dream:'自由を駆ける双刃の英雄へ', ranks:['見習い盗賊','風の斥候','夜渡りの盗賊','蒼影の達人','双星の英雄'], weapons:['旅の短剣','鋼の双刃','夜渡りの双刃','蒼影の双刃','双星のルーンダガー'] },
};
export const STAGES = [0,400,2400,9000,24000];
export const validJob = job => Object.hasOwn(JOBS,job);
export function ensureJobs(slot) {
  if (!slot.jobs) { slot.jobs={sword:slot.xp,mage:0,rogue:0}; slot.job='sword'; }
  return slot;
}
export function growth(slot, job = slot.job || 'sword') {
  const xp=slot.jobs?.[job] ?? (job==='sword'?slot.xp:0);
  const stage=STAGES.reduce((n,t,i)=>xp>=t?i:n,0);
  const start=STAGES[stage],end=STAGES[stage+1]??(start+12000);
  const marks=[start+(stage===0?10:Math.round((end-start)*.15)),start+Math.round((end-start)*.4),start+Math.round((end-start)*.7)];
  const medals=marks.filter(t=>xp>=t).length;
  const nextMark=marks.findIndex(t=>xp<t);
  return {job,xp,stage,medals,title:JOBS[job].ranks[stage],weapon:JOBS[job].weapons[stage],next:STAGES[stage+1]??null,
    reward:nextMark>=0?{xp:marks[nextMark],name:['銅の勲章','銀の勲章','金の勲章'][nextMark]}:stage<4?{xp:end,name:JOBS[job].ranks[stage+1]}:{xp:start+(Math.floor((xp-start)/12000)+1)*12000,name:'熟練の星'},
    mastery:stage===4?Math.floor((xp-start)/12000):0};
}
// Forms are revealed one step ahead: reached stages and the very next one are shown, later ones stay hidden.
export function formVisibility(xp, stage) {
  const current = STAGES.reduce((n, t, i) => xp >= t ? i : n, 0);
  return stage <= current ? 'reached' : stage === current + 1 ? 'next' : 'hidden';
}
export function grantJobXp(slot,xp,job=slot.job||'sword') {ensureJobs(slot);if(!validJob(job))throw new Error('Invalid job');slot.jobs[job]+=xp;}
