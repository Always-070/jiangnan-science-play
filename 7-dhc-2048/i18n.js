const en = {
  title: '7-DHC 2048', language: 'Language',
  heroTitle: 'Start with a carbon source,<br><em>build 7-DHC.</em>',
  heroBody: 'Slide, merge, and synthesize. Guide acetyl-CoA toward a steroid precursor and complete this miniature pathway before the board fills up.',
  score: 'SCORE', best: 'BEST', moves: 'MOVES', reactionBoard: 'REACTION BOARD · 4 × 4',
  synthesisBench: 'Synthesis bench', highest: 'HIGHEST TILE', boardLabel: '7-DHC 2048 game board',
  continue: 'Keep synthesizing', newGame: 'Start a new round', hintTitle: 'Slide to merge',
  hintKeys: 'Arrow keys · WASD · Touch gestures', directions: 'Direction controls',
  up: 'Move up', left: 'Move left', down: 'Move down', right: 'Move right', reset: '↻ Restart',
  target: 'TARGET · 2048', goal: 'Synthesize 7-dehydrocholesterol', pathTitle: 'Synthesis pathway',
  noteTitle: 'A simplified learning pathway',
  noteBody: 'Doubling tiles illustrates step-by-step assembly; it does not represent reaction stoichiometry or every enzymatic step.',
  scienceTitle: 'Every merge <em>builds a larger carbon skeleton.</em>',
  science1Title: 'Start small', science1Body: 'Acetyl-CoA supplies the starting carbon units. Each new tile represents fresh material entering the synthesis pathway.',
  science2Title: 'Build the skeleton', science2Body: 'From the mevalonate pathway to squalene, carbon units are assembled step by step into the characteristic steroid ring system.',
  science3Title: 'Reach 7-DHC', science3Body: '7-DHC is an important intermediate in cholesterol biosynthesis and a precursor of vitamin D₃ in human skin.',
  footerTitle: 'Start with acetyl-CoA. Slide, merge, and build your way to 7-DHC!',
  footerNote: 'Progress saved in this browser',
  wonEyebrow: 'SYNTHESIS COMPLETE', wonTitle: '7-DHC synthesized!',
  wonBody: 'You have assembled the starting carbon source into the target steroid precursor. Keep merging to aim for a higher yield.',
  overEyebrow: 'THE DISH IS FULL', overTitle: 'This reaction has ended',
  empty: 'Empty cell', value: 'value', higher: 'Higher yield',
  progress: n => `${n}% pathway unlocked`, yield: n => `7-DHC yield × ${n}`,
  higherStep: n => `${n} units of target product`,
  overBody: name => `The highest product in this round was ${name}. Try a different corner strategy and play again.`,
};
const zh = {
  title: '7-DHC 2048｜代谢合成游戏', language: '语言',
  heroTitle: '从一个碳源开始，<br><em>拼出 7-DHC。</em>',
  heroBody: '滑动、合并、逐级合成。把乙酰辅酶A一路推进至甾体前体，在棋盘填满前完成这条微型代谢路线。',
  score: '当前得分', best: '历史最佳', moves: '有效滑动', reactionBoard: 'REACTION BOARD · 4 × 4',
  synthesisBench: '代谢合成台', highest: '当前最高', boardLabel: '7-DHC 2048 游戏棋盘',
  continue: '继续合成', newGame: '开始新一轮', hintTitle: '滑动以合并',
  hintKeys: '方向键 · WASD · 触控手势', directions: '方向按钮',
  up: '向上', left: '向左', down: '向下', right: '向右', reset: '↻ 重新开始',
  target: '本轮目标 · 2048', goal: '合成 7-脱氢胆固醇', pathTitle: '合成路线',
  noteTitle: '路线已作科普化简',
  noteBody: '合并倍增用于表现“逐步组装”，不代表真实反应的分子计量或完整酶促步骤。',
  scienceTitle: '每一次合并，<em>都是一次碳骨架升级。</em>',
  science1Title: '从小分子开始', science1Body: '乙酰辅酶A提供最基础的碳单元。每次出现的新方块，都代表新的原料进入合成体系。',
  science2Title: '逐级构建骨架', science2Body: '从甲羟戊酸途径到角鲨烯，碳单元被逐步组装，最终形成甾体化合物的典型环系。',
  science3Title: '抵达 7-DHC', science3Body: '7-DHC 是胆固醇生物合成的重要中间体，也是人体皮肤合成维生素 D₃ 的前体。',
  footerTitle: '从一个乙酰辅酶A开始，滑动、合并，一步步拼出 7-DHC！',
  footerNote: '进度保存在本机浏览器',
  wonEyebrow: '合成完成', wonTitle: '7-DHC 已生成！',
  wonBody: '你已经把基础碳源一路组装成目标甾体前体。可以继续合并，挑战更高产量。',
  overEyebrow: '培养皿已满', overTitle: '本轮反应结束',
  empty: '空位', value: '数值', higher: '更高产量',
  progress: n => `${n}% 路线解锁`, yield: n => `7-DHC 产量 × ${n}`,
  higherStep: n => `累计 ${n} 份目标产物`,
  overBody: name => `本轮最高合成到 ${name}。调整边角布局，再试一次吧。`,
};

export const COPY = { en, 'zh-CN': zh };
export const ENGLISH_ITEMS = [
  ['Acetyl-CoA', 'Starting carbon source'],
  ['Acetoacetyl-CoA', 'C₂ unit condensation'],
  ['HMG-CoA', 'Mevalonate precursor'],
  ['Mevalonate', 'Into the MVA pathway'],
  ['Isopentenyl diphosphate', 'Activated C₅ unit'],
  ['Dimethylallyl diphosphate', 'C₅ isomer'],
  ['Geranyl diphosphate', 'Building the C₁₀ skeleton'],
  ['Farnesyl diphosphate', 'Building the C₁₅ skeleton'],
  ['Squalene', 'Building a C₃₀ chain'],
  ['Lanosterol', 'Forming the steroid rings'],
  ['7-Dehydrocholesterol', 'Target product'],
];

export function initialLocale(storage) {
  try { return storage.getItem('7dhc-2048-language') === 'zh-CN' ? 'zh-CN' : 'en'; }
  catch { return 'en'; }
}

export function applyStaticCopy(locale, root = document) {
  const copy = COPY[locale];
  root.documentElement.lang = locale;
  root.title = copy.title;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = copy[el.dataset.i18n]; });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', copy[el.dataset.i18nAria]); });
  root.querySelectorAll('[data-language]').forEach(el => { el.setAttribute('aria-pressed', String(el.dataset.language === locale)); });
}
