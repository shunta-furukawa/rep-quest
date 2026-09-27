import { MODES } from './engine.js';

// Technique lineages: load rises by harder variations, not by endless reps.
// Each technique has a target range (reps or seconds). Finishing a set at the top of the range
// MASTERY_SETS times unlocks the next technique. `weight` scales damage and XP per rep/second.
// The standard technique of each exercise keeps the exercise id, so older saves map onto it.
// `sides`: unilateral; amounts are totals for both sides, and a switch cue sounds at half the range.
// `sensor`: squat motion detection per technique — threshold scale and longest allowed rep.
export const MASTERY_SETS = 2;
const T = (id, name, [min, max], weight, form, cues, extra = {}) => ({ id, name, range: { min, max }, weight, form, cues, ...extra });
export const LINEAGES = {
  pushup: [
    T('pushup-knee', '膝つき腕立て伏せ', [10, 20], 0.6, '膝をついて、頭から膝まで一直線。胸を床へ近づける', ['スマホを胸の下へ', '膝をついて構える', 'あごでタッチ']),
    T('pushup', '腕立て伏せ', [8, 15], 1, '手は肩幅。下がったときに、あごで画面を軽くタッチ', ['スマホを胸の下へ', '手は肩幅に', 'あごでタッチ']),
    T('pushup-wide', 'ワイド腕立て伏せ', [8, 15], 1.1, '手は肩幅の1.5倍。胸を大きく開いて下ろす', ['スマホを胸の下へ', '手を広めに', 'あごでタッチ']),
    T('pushup-diamond', 'ダイヤモンド腕立て伏せ', [6, 12], 1.3, '両手の親指と人さし指でひし形を作り、胸の下に置く。肘は体の横', ['スマホを手の前へ', '手でひし形を', '肘をしめて']),
    T('pushup-decline', 'デクライン腕立て伏せ', [6, 12], 1.5, '足を椅子やベッドに乗せ、頭を低くして下ろす', ['スマホを胸の下へ', '足を台に乗せる', 'あごでタッチ']),
    T('pushup-archer', 'アーチャー腕立て伏せ', [8, 16], 1.8, '手を大きく広げ、片腕を伸ばしたまま反対側の腕に体重をのせる。左右交互、合計で数える', ['スマホを胸の下へ', '手を大きく広げる', '片側へ体重を'], { sides: true }),
    T('pushup-onearm-knee', '膝つき片手腕立て伏せ', [6, 12], 2.2, '膝をつき、片手だけで体を支えて下ろす。足は広めで安定させる。左右合計で数える', ['スマホを胸の下へ', '膝をつき片手で', '体をひねらない'], { sides: true }),
    T('pushup-onearm', '片手腕立て伏せ', [4, 10], 3, '足を広めに開き、片手だけで体を支えて下ろす。左右合計で数える', ['スマホを胸の下へ', '足を広く開く', '片手で支える'], { sides: true }),
  ],
  squat: [
    T('squat-half', 'ハーフスクワット', [12, 20], 0.6, '膝を軽く曲げる程度まで浅くしゃがむ', ['胸の前で構える', '足は肩幅に', '静止して待つ'], { sensor: { scale: 0.75 } }),
    T('squat', 'スクワット', [12, 20], 1, '足は肩幅。太ももが床と平行になるまでしゃがむ', ['胸の前で構える', '足は肩幅に', '静止して待つ']),
    T('squat-slow', 'スロースクワット', [8, 15], 1.3, '3秒かけてしゃがみ、1秒で立ち上がる', ['胸の前で構える', '3秒で下ろす', '静止して待つ'], { sensor: { scale: 0.6, maxMs: 9000 } }),
    T('squat-split', 'スプリットスクワット', [16, 24], 1.4, '足を前後に開き、後ろの膝を床へ近づける。左右合計で数える', ['胸の前で構える', '足を前後に開く', '静止して待つ'], { sides: true, sensor: { scale: 0.8 } }),
    T('squat-bulgarian', 'ブルガリアンスクワット', [12, 20], 1.8, '後ろ足の甲を椅子に乗せ、前脚でしゃがむ。左右合計で数える', ['胸の前で構える', '後ろ足を台へ', '静止して待つ'], { sides: true, sensor: { scale: 0.8 } }),
    T('squat-shrimp', 'シュリンプスクワット', [8, 16], 2.3, '片脚立ちで、反対の足を後ろで曲げたまましゃがむ。片手で壁に触れて支えてよい。左右合計で数える', ['片手でスマホを胸に', '片脚で立つ', '静止して待つ'], { sides: true, sensor: { scale: 0.75, maxMs: 9000 } }),
    T('squat-pistol-assist', '補助つきピストルスクワット', [8, 16], 2.6, '片脚を前に伸ばし、片手で壁や柱に触れながら片脚でしゃがむ。左右合計で数える', ['片手でスマホを胸に', '片脚を前へ', '静止して待つ'], { sides: true, sensor: { scale: 0.75, maxMs: 9000 } }),
    T('squat-pistol', 'ピストルスクワット', [6, 12], 3.2, '片脚を前に伸ばしたまま、支えなしで片脚でしゃがむ。左右合計で数える', ['胸の前で構える', '片脚を前へ', '静止して待つ'], { sides: true, sensor: { scale: 0.8, maxMs: 9000 } }),
  ],
  plank: [
    T('plank-knee', '膝つきプランク', [30, 60], 0.6, '肘と膝で支え、頭から膝まで一直線', ['スマホを床へ', '肘と膝をつく', '体を一直線に', 'お腹に力を', '呼吸は止めない']),
    T('plank', 'プランク', [30, 60], 1, '肘は肩の真下。頭からかかとまで一直線にキープ', ['スマホを床へ', '肘をついて構える', '体を一直線に', 'お腹に力を', '呼吸は止めない']),
    T('plank-leg', '片脚上げプランク', [30, 60], 1.3, 'プランクの姿勢から片脚を浮かせる。半分の時間で脚を入れ替える', ['スマホを床へ', '肘をついて構える', '体を一直線に', '片脚を浮かせる', '腰は水平に'], { sides: true }),
    T('plank-reach', '片手片脚プランク', [20, 40], 1.8, '手をついたプランクから、右手と左脚など対角の手足を伸ばす。半分の時間で入れ替える', ['スマホを床へ', '手をついて構える', '体を一直線に', '対角の手足を', '腰は水平に'], { sides: true }),
    T('plank-long', 'ロングレバープランク', [20, 40], 2, '肘を顔より前について、体を長く伸ばしてキープ', ['スマホを床へ', '肘を前について', '体を一直線に', 'お腹に力を', '呼吸は止めない']),
    T('plank-rkc', 'RKCプランク', [10, 20], 3, '肘を足の方へ引き寄せ、お尻・お腹・太ももに全力で力を入れる', ['スマホを床へ', '肘をついて構える', '肘を足へ引く', 'お尻をしめる', '全身に全力を']),
  ],
  superman: [
    T('superman-arms', 'アームリフト', [20, 45], 0.6, 'うつ伏せで、腕だけを床から浮かせてキープ', ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '目線は床へ', '腕だけ浮かせる']),
    T('superman', 'スーパーマン', [20, 45], 1, 'うつ伏せで腕を前へ。両手両脚を少し浮かせてキープ', ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '目線は床へ', '手足を浮かせる']),
    T('superman-y', 'Yレイズ・ホールド', [20, 45], 1.2, '腕をY字に開き、親指を上に向けて浮かせ、脚も浮かせる', ['スマホを床へ', 'うつ伏せになる', '腕をY字に', '親指を上へ', '手足を浮かせる']),
    T('superman-pulse', 'スーパーマン・パルス', [20, 40], 1.4, '手足を浮かせたまま、小さく上下に弾ませ続ける', ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '手足を浮かせる', '小さく弾ませる']),
    T('superman-swimmer', 'スイマー', [20, 40], 1.5, '手足を浮かせたまま、対角の手足を交互に上下させる', ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '手足を浮かせる', '交互に動かす']),
    T('superman-arch', 'アーチホールド', [15, 30], 2, '胸と太ももまで床から浮かせ、体を大きく反らせてキープ', ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '胸と脚を高く', '首は反らさない']),
  ],
};
// Every technique knows its exercise and its place in the lineage, whichever way it is looked up.
for (const [mode, list] of Object.entries(LINEAGES)) list.forEach((t, index) => Object.assign(t, { mode, index }));
const BY_ID = new Map(Object.values(LINEAGES).flat().map(t => [t.id, t]));
export const techOf = id => BY_ID.get(id);
export const ladderOf = mode => LINEAGES[mode];
export const standardIndex = mode => LINEAGES[mode].findIndex(t => t.id === mode);
// Damage and XP scale with the technique; fractional progress is floored per set.
export const damageOf = (id, amount) => Math.floor(amount * techOf(id).weight + 1e-9);
export const xpOf = (id, amount) => Math.round(amount * MODES[techOf(id).mode].xp * techOf(id).weight);
// Techniques up to the standard are open from the start; each later one needs the previous mastered.
export function isUnlocked(mastery, mode, index) {
  if (index <= standardIndex(mode)) return true;
  return (mastery?.[LINEAGES[mode][index - 1].id] || 0) >= MASTERY_SETS;
}
export const switchAt = id => { const t = techOf(id); return t.sides ? Math.round(t.range.max / 2) : null; };
