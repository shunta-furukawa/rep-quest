// Narrative layer over the chapter mechanic: each region holds a beacon (灯標)
// that is relit by calming CHAPTER_BOSSES of its monsters. No save data of its own.
export const PROLOGUE = [
  '空に浮かぶ島々、アストラ群島。島と島は「星脈」と呼ばれる光の流れでつながり、各地の灯標がその光を守ってきた。',
  'けれど近ごろ、灯標がひとつ、またひとつと消えはじめた。光を失った島からは魔物があふれ、道は閉ざされつつある。',
  'ギルドはあなたに託した。各地の魔物を鎮め、灯標をふたたび灯すこと。その一歩一歩が、群島に朝を取り戻す。',
];
// `id` names the optional backdrop at /art/regions/<id>.webp.
export const REGION_STORY = [
  { id: 'forest', title: 'ギルドのふもと', arrival: 'ギルドの石段を下りると、苔むした森が広がっている。ルーンの泉のほとりで、最初の灯標が弱々しく瞬いていた。', cleared: '森の灯標に光が戻った。木々のすき間から、風の吹きわたる高原へと続く吊り橋が見える。' },
  { id: 'highland', title: '島をつなぐ風の道', arrival: '吊り橋の先は、風が草を波打たせる高原の島。群れをなす狼の遠吠えが、灯標の丘から響いてくる。', cleared: '丘の灯標が風に揺れて輝いた。眼下の雲海の向こう、霧に包まれた湖が静かに光っている。' },
  { id: 'lake', title: '霧に沈む水鏡', arrival: '湖畔は乳白色の霧に閉ざされている。水面を漂う青い鬼火が、旅人を惑わせるように灯標を取り巻いていた。', cleared: '霧が晴れ、湖の灯標が水面に映った。対岸の断崖に、星を刻んだ古い石門が姿を現す。' },
  { id: 'ruins', title: '星詠みの眠る都', arrival: 'かつて星を読んだ者たちの都。崩れた回廊には朽ちた鎧の兵が立ち、宝箱のふりをした何かが息をひそめている。', cleared: '遺跡の天球儀が回りはじめ、灯標に星の光が宿った。遠く、赤く燃える山の影が浮かび上がる。' },
  { id: 'volcano', title: '紅玉の炉心', arrival: '大地の下で溶岩がうなる火山島。岩肌に埋もれた紅玉が脈打ち、幼い竜たちが灯標の火口を守っている。', cleared: '火口の灯標が紅く燃え上がった。雲の上、群島でいちばん高い頂が、夜明け前の空に白く光る。' },
  { id: 'summit', title: '群島の大灯標', arrival: '雲を突き抜けた頂に、群島すべての星脈が集まる大灯標がそびえる。最後の光を取り戻せば、アストラに朝が来る。', cleared: '大灯標が灯り、群島じゅうの星脈が光でつながった。けれど光の届かない深層で、まだ何かがうごめいている。' },
];
// After the sixth beacon the journey continues into deeper strata of the same regions.
export const DEPTH_NOTE = '灯標の奥、星脈の深層へ。見慣れた地にも、より手強い魔物がひそんでいる。';
export function destinationOf(chapter) {
  const next = chapter + 1;
  return { region: next % REGION_STORY.length, depth: Math.floor(next / REGION_STORY.length) };
}
// Island positions on the world map, as percentages of a 3:4 portrait map (x from left, y from top).
// The painted /art/world-map.webp must place each island at these points so the markers line up.
export const MAP_POINTS = [[24, 84], [72, 74], [28, 57], [74, 42], [27, 27], [62, 10]];
export function regionState(chapter, index) {
  const depth = Math.floor(chapter / REGION_STORY.length), current = chapter % REGION_STORY.length;
  return {
    visited: depth > 0 || index <= current,
    cleared: depth > 0 || index < current,
    current: index === current,
    next: index === (current + 1) % REGION_STORY.length,
    depth,
  };
}
