export const MODES={pushup:{name:'腕立て伏せ',unit:'回',xp:10},squat:{name:'スクワット',unit:'回',xp:10},plank:{name:'プランク',unit:'秒',xp:2}};
export function progress(xp){let level=1,remaining=xp;while(remaining>=level*100){remaining-=level*100;level++;}return{level,current:remaining,needed:level*100};}
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function validateSave(value){if(!value||value.version!==1||!Number.isFinite(value.xp)||value.xp<0||value.xp>1e9||!Number.isInteger(value.sets)||value.sets<0||!Array.isArray(value.history)||value.history.length>200)throw new Error('Invalid save');for(const row of value.history){if(!MODES[row.mode]||!Number.isInteger(row.amount)||row.amount<0||row.amount>1e7||!Number.isFinite(row.xp)||row.xp<0||!Number.isFinite(Date.parse(row.date)))throw new Error('Invalid history');}return value;}
// Detect a complete biphasic motion, then require rest before another rep.
// Acceleration is measured along gravity, independent of phone orientation.
export class RepDetector{
 constructor(threshold=.9){this.threshold=threshold;this.reset();}
 reset(){this.gravity=null;this.smooth=0;this.phase=0;this.started=0;this.last=-Infinity;this.stillSince=null;this.samples=0;}
 feed(vector,t){if(!vector||![vector.x,vector.y,vector.z].every(Number.isFinite))return false;
 const v=[vector.x,vector.y,vector.z];if(!this.gravity){this.gravity=[...v];this.warmup=t;return false;}
 this.gravity=this.gravity.map((g,i)=>g*.97+v[i]*.03);const norm=Math.hypot(...this.gravity);if(norm<1)return false;
 const a=v.reduce((s,n,i)=>s+(n-this.gravity[i])*this.gravity[i]/norm,0);this.smooth=.7*this.smooth+.3*a;
 if(t-this.warmup<1000)return false;
 const s=this.smooth,th=this.threshold;
 if(this.phase===4){if(Math.abs(s)<th*.55){this.stillSince??=t;if(t-this.stillSince>200&&t-this.last>900){this.phase=0;this.stillSince=null;}}else this.stillSince=null;return false;}
 if(this.phase&&t-this.started>7000){this.phase=0;}
 if(this.phase===0&&Math.abs(s)>th&&t-this.last>1000){this.sign=Math.sign(s);this.phase=1;this.started=t;}
 else if(this.phase===1&&s*this.sign<-th*.7&&t-this.started>=300){this.phase=2;}
 else if(this.phase===2&&s*this.sign>th*.7&&t-this.started>=650){this.phase=3;}
 else if(this.phase===3&&Math.abs(s)<th*.55&&t-this.started>=900){this.phase=4;this.last=t;return true;}
 return false;
 }
}
