import { Gem, GemColor, SpecialType, LevelConfig, BoardTile } from '../types/game';

let gemIdCounter = 1;
export const nextGemId = () => `gem-${gemIdCounter++}-${Date.now()}`;

export function createRandomGem(
  row: number,
  col: number,
  allowedColors: GemColor[],
  special: SpecialType = 'none'
): Gem {
  const color = allowedColors[Math.floor(Math.random() * allowedColors.length)];
  return {
    id: nextGemId(),
    color,
    special,
    row,
    col,
  };
}

export function initializeBoard(level: LevelConfig): {
  board: (Gem | null)[][];
  tiles: BoardTile[][];
} {
  const shape = level.boardShape;
  const numRows = shape.length;
  const numCols = shape[0].length;

  const tiles: BoardTile[][] = [];
  const board: (Gem | null)[][] = [];

  for (let r = 0; r < numRows; r++) {
    tiles[r] = [];
    board[r] = [];
    for (let c = 0; c < numCols; c++) {
      const cellVal = shape[r][c];
      const isActive = cellVal > 0;
      tiles[r][c] = {
        row: r,
        col: c,
        isActive,
        isGoldTile: cellVal === 2,
        goldHp: cellVal === 2 ? 1 : 0,
      };

      if (!isActive) {
        board[r][c] = null;
        continue;
      }

      // Generate gem that doesn't immediately form a 3-match or 2x2 square match
      let candidateColor: GemColor;
      let attempts = 0;
      do {
        candidateColor =
          level.allowedColors[Math.floor(Math.random() * level.allowedColors.length)];
        attempts++;
      } while (
        attempts < 25 &&
        ((c >= 2 &&
          board[r][c - 1]?.color === candidateColor &&
          board[r][c - 2]?.color === candidateColor) ||
          (r >= 2 &&
            board[r - 1]?.[c]?.color === candidateColor &&
            board[r - 2]?.[c]?.color === candidateColor) ||
          (r >= 1 &&
            c >= 1 &&
            board[r - 1]?.[c]?.color === candidateColor &&
            board[r]?.[c - 1]?.color === candidateColor &&
            board[r - 1]?.[c - 1]?.color === candidateColor))
      );

      board[r][c] = {
        id: nextGemId(),
        color: candidateColor,
        special: 'none',
        row: r,
        col: c,
      };
    }
  }

  // Ensure there is at least one valid move on initial board
  let validMoves = findPossibleMoves(board, tiles);
  let shuffleCount = 0;
  while (validMoves.length === 0 && shuffleCount < 10) {
    shuffleBoard(board, tiles, level.allowedColors);
    validMoves = findPossibleMoves(board, tiles);
    shuffleCount++;
  }

  return { board, tiles };
}

export interface MatchResult {
  matchedGems: Gem[];
  specialCreations: {
    gem: Gem;
    row: number;
    col: number;
    specialType: SpecialType;
  }[];
}

export function findMatches(
  board: (Gem | null)[][],
  tiles: BoardTile[][],
  preferredTriggerPos?: { r: number; c: number }
): MatchResult {
  if (!board || board.length === 0 || !board[0] || board[0].length === 0 || !tiles || tiles.length === 0) {
    return { matchedGems: [], specialCreations: [] };
  }
  const numRows = board.length;
  const numCols = board[0].length;
  const matchedSet = new Set<string>();
  const gemLookup = new Map<string, Gem>();

  // Helper to register gem
  const mark = (gem: Gem) => {
    matchedSet.add(`${gem.row},${gem.col}`);
    gemLookup.set(`${gem.row},${gem.col}`, gem);
  };

  const horizontalRuns: Gem[][] = [];
  const verticalRuns: Gem[][] = [];

  // Check horizontal matches
  for (let r = 0; r < numRows; r++) {
    let run: Gem[] = [];
    for (let c = 0; c < numCols; c++) {
      const gem = board[r][c];
      if (gem && tiles[r][c].isActive) {
        if (run.length === 0 || run[0].color === gem.color) {
          run.push(gem);
        } else {
          if (run.length >= 3) {
            horizontalRuns.push([...run]);
            run.forEach(mark);
          }
          run = [gem];
        }
      } else {
        if (run.length >= 3) {
          horizontalRuns.push([...run]);
          run.forEach(mark);
        }
        run = [];
      }
    }
    if (run.length >= 3) {
      horizontalRuns.push([...run]);
      run.forEach(mark);
    }
  }

  // Check vertical matches
  for (let c = 0; c < numCols; c++) {
    let run: Gem[] = [];
    for (let r = 0; r < numRows; r++) {
      const gem = board[r][c];
      if (gem && tiles[r][c].isActive) {
        if (run.length === 0 || run[0].color === gem.color) {
          run.push(gem);
        } else {
          if (run.length >= 3) {
            verticalRuns.push([...run]);
            run.forEach(mark);
          }
          run = [gem];
        }
      } else {
        if (run.length >= 3) {
          verticalRuns.push([...run]);
          run.forEach(mark);
        }
        run = [];
      }
    }
    if (run.length >= 3) {
      verticalRuns.push([...run]);
      run.forEach(mark);
    }
  }

  // Check 2x2 square matches (4 gems of same color in a 2x2 square)
  const squareMatches: Gem[][] = [];
  for (let r = 0; r < numRows - 1; r++) {
    for (let c = 0; c < numCols - 1; c++) {
      const gTopLeft = board[r][c];
      const gTopRight = board[r][c + 1];
      const gBottomLeft = board[r + 1][c];
      const gBottomRight = board[r + 1][c + 1];

      if (
        gTopLeft &&
        gTopRight &&
        gBottomLeft &&
        gBottomRight &&
        tiles[r][c].isActive &&
        tiles[r][c + 1].isActive &&
        tiles[r + 1][c].isActive &&
        tiles[r + 1][c + 1].isActive
      ) {
        const color = gTopLeft.color;
        if (
          gTopRight.color === color &&
          gBottomLeft.color === color &&
          gBottomRight.color === color
        ) {
          const squareGems = [gTopLeft, gTopRight, gBottomLeft, gBottomRight];
          squareMatches.push(squareGems);
          squareGems.forEach(mark);
        }
      }
    }
  }

  // Detect special creations
  const specialCreations: MatchResult['specialCreations'] = [];
  const handledPositions = new Set<string>();

  // 1. Check for 5-in-a-row -> Rainbow Diamond (Prism Jewel)
  for (const run of [...horizontalRuns, ...verticalRuns]) {
    if (run.length >= 5) {
      // Pick trigger gem or middle gem
      let targetGem = run[Math.floor(run.length / 2)];
      if (preferredTriggerPos) {
        const found = run.find(
          (g) => g.row === preferredTriggerPos.r && g.col === preferredTriggerPos.c
        );
        if (found) targetGem = found;
      }
      const key = `${targetGem.row},${targetGem.col}`;
      if (!handledPositions.has(key)) {
        handledPositions.add(key);
        specialCreations.push({
          gem: targetGem,
          row: targetGem.row,
          col: targetGem.col,
          specialType: 'rainbow_diamond',
        });
      }
    }
  }

  // 2. Check for T/L shapes (intersection of horizontal and vertical runs) -> Bomb
  for (const hRun of horizontalRuns) {
    for (const vRun of verticalRuns) {
      if (hRun[0].color === vRun[0].color) {
        // Find intersection
        const intersection = hRun.find((hg) =>
          vRun.some((vg) => vg.row === hg.row && vg.col === hg.col)
        );
        if (intersection) {
          const key = `${intersection.row},${intersection.col}`;
          if (!handledPositions.has(key)) {
            handledPositions.add(key);
            specialCreations.push({
              gem: intersection,
              row: intersection.row,
              col: intersection.col,
              specialType: 'bomb',
            });
          }
        }
      }
    }
  }

  // 3. Check for 4-in-a-row -> Line Blaster
  for (const run of horizontalRuns) {
    if (run.length === 4) {
      let targetGem = run[1];
      if (preferredTriggerPos) {
        const found = run.find(
          (g) => g.row === preferredTriggerPos.r && g.col === preferredTriggerPos.c
        );
        if (found) targetGem = found;
      }
      const key = `${targetGem.row},${targetGem.col}`;
      if (!handledPositions.has(key)) {
        handledPositions.add(key);
        specialCreations.push({
          gem: targetGem,
          row: targetGem.row,
          col: targetGem.col,
          specialType: 'line_horizontal',
        });
      }
    }
  }
  for (const run of verticalRuns) {
    if (run.length === 4) {
      let targetGem = run[1];
      if (preferredTriggerPos) {
        const found = run.find(
          (g) => g.row === preferredTriggerPos.r && g.col === preferredTriggerPos.c
        );
        if (found) targetGem = found;
      }
      const key = `${targetGem.row},${targetGem.col}`;
      if (!handledPositions.has(key)) {
        handledPositions.add(key);
        specialCreations.push({
          gem: targetGem,
          row: targetGem.row,
          col: targetGem.col,
          specialType: 'line_vertical',
        });
      }
    }
  }

  // 4. Check for 2x2 Square Matches -> Small/Bomb Special
  for (const square of squareMatches) {
    let targetGem = square[0];
    if (preferredTriggerPos) {
      const found = square.find(
        (g) => g.row === preferredTriggerPos.r && g.col === preferredTriggerPos.c
      );
      if (found) targetGem = found;
    }
    const key = `${targetGem.row},${targetGem.col}`;
    if (!handledPositions.has(key)) {
      handledPositions.add(key);
      specialCreations.push({
        gem: targetGem,
        row: targetGem.row,
        col: targetGem.col,
        specialType: 'bomb',
      });
    }
  }

  const matchedGems = Array.from(matchedSet).map((key) => gemLookup.get(key)!);

  return {
    matchedGems,
    specialCreations,
  };
}

export function areAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export function findPossibleMoves(
  board: (Gem | null)[][],
  tiles: BoardTile[][]
): { r1: number; c1: number; r2: number; c2: number }[] {
  if (!board || board.length === 0 || !board[0] || board[0].length === 0 || !tiles || tiles.length === 0) {
    return [];
  }
  const numRows = board.length;
  const numCols = board[0].length;
  const moves: { r1: number; c1: number; r2: number; c2: number }[] = [];

  const directions = [
    [0, 1],
    [1, 0],
  ];

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const g1 = board[r][c];
      if (!g1 || !tiles[r][c].isActive) continue;

      // Special gems can always be swapped with any adjacent active gem
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= numRows || nc >= numCols) continue;
        const g2 = board[nr][nc];
        if (!g2 || !tiles[nr][nc].isActive) continue;

        if (g1.special === 'rainbow_diamond' || g2.special === 'rainbow_diamond') {
          moves.push({ r1: r, c1: c, r2: nr, c2: nc });
          continue;
        }

        // Test swap
        board[r][c] = g2;
        board[nr][nc] = g1;
        const matches = findMatches(board, tiles);
        board[r][c] = g1;
        board[nr][nc] = g2;

        if (matches.matchedGems.length > 0) {
          moves.push({ r1: r, c1: c, r2: nr, c2: nc });
        }
      }
    }
  }

  return moves;
}

export function shuffleBoard(
  board: (Gem | null)[][],
  tiles: BoardTile[][],
  allowedColors: GemColor[]
) {
  if (!board || board.length === 0 || !tiles || tiles.length === 0) return;
  const activeGems: Gem[] = [];
  const numRows = board.length;
  const numCols = board[0].length;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (tiles[r]?.[c]?.isActive && board[r]?.[c]) {
        activeGems.push(board[r][c]!);
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = activeGems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tempColor = activeGems[i].color;
    activeGems[i].color = activeGems[j].color;
    activeGems[j].color = tempColor;
  }
}

// Drops gems down and refills empty spaces from above
export function applyGravityAndRefill(
  board: (Gem | null)[][],
  tiles: BoardTile[][],
  allowedColors: GemColor[]
): {
  newGems: Gem[];
  boardChanged: boolean;
} {
  if (!board || board.length === 0 || !board[0] || !tiles || tiles.length === 0) {
    return { newGems: [], boardChanged: false };
  }
  const numRows = board.length;
  const numCols = board[0].length;
  let boardChanged = false;
  const newGems: Gem[] = [];

  for (let c = 0; c < numCols; c++) {
    // Collect all existing gems in this column from bottom to top
    const colGems: Gem[] = [];
    const activeRowIndices: number[] = [];

    for (let r = 0; r < numRows; r++) {
      if (tiles[r][c].isActive) {
        activeRowIndices.push(r);
        if (board[r][c]) {
          colGems.push(board[r][c]!);
        }
      }
    }

    // Place gems into lowest available active spots
    let gemIdx = colGems.length - 1;
    for (let i = activeRowIndices.length - 1; i >= 0; i--) {
      const r = activeRowIndices[i];
      if (gemIdx >= 0) {
        const gem = colGems[gemIdx];
        if (gem.row !== r || gem.col !== c) {
          boardChanged = true;
          gem.row = r;
          gem.col = c;
        }
        board[r][c] = gem;
        gemIdx--;
      } else {
        // Need to spawn a new gem at top
        boardChanged = true;
        const freshGem = createRandomGem(r, c, allowedColors);
        freshGem.isNew = true;
        board[r][c] = freshGem;
        newGems.push(freshGem);
      }
    }
  }

  return { newGems, boardChanged };
}
