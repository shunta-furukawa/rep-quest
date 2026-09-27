// Pre-set guidance: a setup card shown before starting, then one short cue per countdown second.
// Cues are read at a glance (or aloud) while getting into position, so each stays a few words.
// `art` is the optional illustration at /art/guide/<mode>.webp; the quest icon stands in until it exists.
export const GUIDE = {
  pushup: {
    phone: '胸の真下の床に、画面を上にして置く',
    form: '手は肩幅。下がったときに、あごで画面を軽くタッチ',
    cues: ['スマホを胸の下へ', '手は肩幅に', 'あごでタッチ'],
  },
  squat: {
    phone: '胸の前で両手で持ち、画面を自分に向ける',
    form: '足は肩幅。開始後は1秒静止してから、ゆっくりしゃがむ',
    cues: ['胸の前で構える', '足は肩幅に', '静止して待つ'],
  },
  plank: {
    phone: '顔の前の床に置く',
    form: '肘は肩の真下。頭からかかとまで一直線にキープ',
    cues: ['スマホを床へ', '肘をついて構える', '体を一直線に', 'お腹に力を', '呼吸は止めない'],
  },
  superman: {
    phone: '顔の前の床に置く',
    form: 'うつ伏せで腕を前へ。両手両脚を少し浮かせてキープ',
    cues: ['スマホを床へ', 'うつ伏せになる', '腕を前に伸ばす', '目線は床へ', '手足を浮かせる'],
  },
};
// The countdown lasts one second per cue: 3 for standing modes, 5 for the floor holds.
export const countdownOf = mode => GUIDE[mode].cues.length;
export function cueAt(mode, elapsedMs) {
  const cues = GUIDE[mode].cues;
  return cues[Math.min(cues.length - 1, Math.max(0, Math.floor(elapsedMs / 1000)))];
}
