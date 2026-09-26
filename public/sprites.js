import { growth, JOBS } from './progression.js';
const W=192,H=208;
// Normalize body height rather than atlas cell size. Mage artwork has more
// headroom around the staff; preserve the common foot baseline in every pose.
const MAGE_SCALE=[1.34,1.35,1.32,1.27,1.24];
const sheets=new Map();
function load(job){
  if(!sheets.has(job))sheets.set(job,Promise.all(['','-hair'].map(suffix=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=`/sprites/${job}${suffix}.webp`;}))));
  return sheets.get(job);
}
function canvas(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
const dyed=new Map();
async function atlas(job,hair){
 const key=job+hair;
 if(!dyed.has(key)) { if(dyed.size>=4)dyed.delete(dyed.keys().next().value); dyed.set(key,load(job).then(([image,mask])=>{
  const result=document.createElement('canvas');result.width=image.width;result.height=image.height;const ctx=result.getContext('2d');ctx.drawImage(image,0,0);
  // A separate authored hair mask keeps outfits and skin untouched.
  const tint=document.createElement('canvas');tint.width=image.width;tint.height=image.height;const t=tint.getContext('2d');t.drawImage(mask,0,0);t.globalCompositeOperation='source-in';t.fillStyle=hair;t.fillRect(0,0,tint.width,tint.height);t.globalCompositeOperation='multiply';t.drawImage(mask,0,0);t.globalCompositeOperation='destination-in';t.drawImage(mask,0,0);ctx.drawImage(tint,0,0);return result;
 }).catch(e=>{dyed.delete(key);sheets.delete(job);throw e;})); }
 return dyed.get(key);
}
function paint(c,image,row,frame,job,silhouette=false){const x=c.getContext('2d');const scale=job==='mage'?MAGE_SCALE[row]:1;x.imageSmoothingEnabled=false;x.clearRect(0,0,W,H);x.drawImage(image,frame*W,row*H,W,H,Math.round(W/2*(1-scale)),Math.round(190*(1-scale)),Math.round(W*scale),Math.round(H*scale));
 // Unreached forms keep only their outline so the promotion itself stays a reveal.
 if(silhouette){x.globalCompositeOperation='source-in';x.fillStyle='#10283a';x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';}
 c.classList.toggle('is-silhouette',silhouette);}
export function portrait(job,stage,hair,label='',silhouette=false){
 const c=canvas();c.className='sprite-portrait';c.setAttribute('role','img');c.setAttribute('aria-label',label||(silhouette?'まだ見ぬ姿':JOBS[job].ranks[stage]));
 atlas(job,hair).then(image=>paint(c,image,stage,0,job,silhouette)).catch(()=>{c.setAttribute('aria-label','冒険者の画像を読み込めません');});return c;
}
export function createScene(){
 const root=document.createElement('div');root.className='sprite-stage';
 const c=canvas();c.className='hero-sprite';c.setAttribute('role','img');
 const medal=document.createElement('div');medal.className='sprite-medals';
 const feedback=document.createElement('span');feedback.className='sprite-feedback';feedback.setAttribute('aria-hidden','true');
 root.append(c,medal,feedback);
 let visible=false,image=null,profile=null,stage=0,job='sword',silhouette=false,action='idle',at=0,mode='idle',frame=-1,token=0,last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function render(now){requestAnimationFrame(render);if(!visible||document.hidden||!image||now-last<80)return;last=now;let next=0;
 const elapsed=now-at;
 if(!reduced.matches){
 if(action==='attack'||action==='heavy'){const phases=action==='heavy'?[0,2,2,3,3,5,0]:[0,2,3,3,5,0];next=phases[Math.floor(elapsed/100)]??0;if(elapsed>=phases.length*100)action='idle';}
 else if(action==='celebrate'){next=[0,5,4,4,4,5,0][Math.floor(elapsed/230)]??0;if(elapsed>1700)action='idle';}
 else if(job!=='mage')next=Math.floor(now/650)%2;
 }
 if(next!==frame){paint(c,image,stage,next,job,silhouette);frame=next;c.dataset.frame=String(next);}
 root.classList.toggle('guarding',mode==='guard');
 }
 requestAnimationFrame(render);
 return {mount(el){el.replaceChildren(root);},setVisible(v){visible=v;},setMode(v){mode=v;},
 async setCharacter(p){profile=p;const g=growth(p);job=g.job;stage=g.stage;silhouette=Boolean(p.silhouette);const id=++token;image=null;c.getContext('2d').clearRect(0,0,W,H);c.setAttribute('aria-label',silhouette?'まだ見ぬ姿':`${p.name||'冒険者'}・${g.title}`);medal.textContent=g.medals&&!silhouette?'◆'.repeat(g.medals):'';medal.setAttribute('aria-label',`${g.medals}つの勲章`);try{const loaded=await atlas(job,p.hair);if(id!==token)return;image=loaded;frame=-1;feedback.textContent='';}catch{if(id===token)feedback.textContent='画像を読み込めません。再読み込みしてください';}},
 play(v){if(v==='guard'){mode='guard';return;}action=v;at=performance.now();frame=-1;feedback.textContent=v==='celebrate'?'QUEST COMPLETE':v==='heavy'?'POWER!':'HIT!';root.classList.remove('sprite-impact');void root.offsetWidth;root.classList.add('sprite-impact');setTimeout(()=>feedback.textContent='',900);},
 };
}
