import { LevelConfig } from '../types/game';

// Board shape codes:
// 0 = empty/void (not part of playable board)
// 1 = normal board tile
// 2 = gold tile (requires match on top to break)

// Classic clipped-corner temple board from screenshot
const TEMPLE_OCTAGON: number[][] = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

const GOLDEN_PYRAMID_SHAPE: number[][] = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

const STANDARD_8X8: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: '나일강의 보석 (기초 훈련)',
    moves: 28,
    targetScore: 2500,
    starScores: [1500, 2500, 4000],
    boardShape: STANDARD_8X8,
    goals: [
      { type: 'collect_gem', targetColor: 'ruby', required: 15, current: 0 },
      { type: 'collect_gem', targetColor: 'sapphire', required: 15, current: 0 },
    ],
    allowedColors: ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst'],
  },
  {
    id: 2,
    title: '파라오의 피라미드 (스크린샷 레벨)',
    moves: 32,
    targetScore: 6000,
    starScores: [3000, 5000, 7500],
    boardShape: TEMPLE_OCTAGON,
    goals: [
      { type: 'collect_gem', targetColor: 'obsidian', required: 12, current: 0 },
      { type: 'clear_gold', required: 16, current: 0 },
    ],
    allowedColors: ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'obsidian'],
  },
  {
    id: 3,
    title: '스핑크스의 번개 신전',
    moves: 30,
    targetScore: 7000,
    starScores: [3500, 6000, 9000],
    boardShape: GOLDEN_PYRAMID_SHAPE,
    goals: [
      { type: 'create_special', targetSpecial: 'rainbow_diamond', required: 2, current: 0 },
      { type: 'collect_gem', targetColor: 'amethyst', required: 25, current: 0 },
      { type: 'clear_gold', required: 20, current: 0 },
    ],
    allowedColors: ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst'],
  },
  {
    id: 4,
    title: '오시리스의 황금 묘소',
    moves: 26,
    targetScore: 8000,
    starScores: [4000, 7000, 10000],
    boardShape: TEMPLE_OCTAGON,
    goals: [
      { type: 'create_special', targetSpecial: 'bomb', required: 4, current: 0 },
      { type: 'collect_gem', targetColor: 'emerald', required: 25, current: 0 },
      { type: 'collect_gem', targetColor: 'obsidian', required: 15, current: 0 },
    ],
    allowedColors: ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'obsidian'],
  },
  {
    id: 5,
    title: '영원한 태양의 제단 (무한 챌린지)',
    moves: 35,
    targetScore: 12000,
    starScores: [6000, 10000, 15000],
    boardShape: GOLDEN_PYRAMID_SHAPE,
    goals: [
      { type: 'score', required: 12000, current: 0 },
      { type: 'create_special', targetSpecial: 'rainbow_diamond', required: 3, current: 0 },
    ],
    allowedColors: ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'obsidian'],
  },
];
