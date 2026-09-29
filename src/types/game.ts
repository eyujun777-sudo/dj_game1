export type GemColor = 'ruby' | 'emerald' | 'sapphire' | 'topaz' | 'amethyst' | 'obsidian';

export type SpecialType = 'none' | 'line_horizontal' | 'line_vertical' | 'bomb' | 'rainbow_diamond';

export interface Gem {
  id: string;
  color: GemColor;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
}

export interface BoardTile {
  row: number;
  col: number;
  isActive: boolean; // For shaped boards (e.g. clipped corners)
  isGoldTile?: boolean; // Under-tile objective that needs to be broken by matches
  goldHp?: number;
}

export interface LevelGoal {
  type: 'score' | 'collect_gem' | 'clear_gold' | 'create_special';
  targetColor?: GemColor;
  targetSpecial?: SpecialType;
  required: number;
  current: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  moves: number;
  targetScore: number;
  starScores: [number, number, number];
  boardShape: number[][]; // 0 = inactive, 1 = normal tile, 2 = gold tile
  goals: LevelGoal[];
  allowedColors: GemColor[];
}

export interface LightningTarget {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}
