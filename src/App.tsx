import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gem,
  BoardTile,
  LevelConfig,
  LightningTarget,
  FloatingText,
  GemColor,
  SpecialType,
} from './types/game';
import { LEVELS } from './data/levels';
import {
  initializeBoard,
  findMatches,
  areAdjacent,
  findPossibleMoves,
  applyGravityAndRefill,
  nextGemId,
} from './utils/gameLogic';
import { sound } from './utils/audio';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { BoosterBar, BoosterType } from './components/BoosterBar';
import { DesertScenery } from './components/DesertScenery';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { FileText, Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // Level State
  const [currentLevelId, setCurrentLevelId] = useState<number>(2); // Default to Level 2 (the screenshot level!)
  const [unlockedLevel, setUnlockedLevel] = useState<number>(5);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({ 1: 3 });

  const currentLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Game Board State with immediate valid initial state to prevent any empty render
  const [board, setBoard] = useState<(Gem | null)[][]>(() => {
    return initializeBoard(currentLevelConfig).board;
  });
  const [tiles, setTiles] = useState<BoardTile[][]>(() => {
    return initializeBoard(currentLevelConfig).tiles;
  });
  const [movesLeft, setMovesLeft] = useState<number>(currentLevelConfig.moves);
  const [score, setScore] = useState<number>(0);
  const [goals, setGoals] = useState(() => currentLevelConfig.goals.map((g) => ({ ...g, current: 0 })));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [selectedPos, setSelectedPos] = useState<{ r: number; c: number } | null>(null);
  const [hintMove, setHintMove] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null);

  // FX State
  const [lightningTargets, setLightningTargets] = useState<LightningTarget[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeBooster, setActiveBooster] = useState<BoosterType>(null);
  const [inventory, setInventory] = useState({
    hammer: 3,
    swap: 3,
    bomb: 2,
    rainbow: 2,
  });

  // Modals
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize Level
  const startLevel = useCallback((lvlConfig: LevelConfig) => {
    const { board: initialBoard, tiles: initialTiles } = initializeBoard(lvlConfig);
    setBoard(initialBoard);
    setTiles(initialTiles);
    setMovesLeft(lvlConfig.moves);
    setScore(0);
    setGoals(lvlConfig.goals.map((g) => ({ ...g, current: 0 })));
    setSelectedPos(null);
    setHintMove(null);
    setIsLocked(false);
    setIsGameOverModalOpen(false);
    setActiveBooster(null);
  }, []);

  useEffect(() => {
    startLevel(currentLevelConfig);
  }, [currentLevelConfig, startLevel]);

  // Floating text helper
  const addFloatingText = (text: string, x: number, y: number, color?: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  // Check Level Win/Loss Condition
  const checkGameProgress = useCallback(
    (currentGoals: typeof goals, currentMoves: number, currentScore: number) => {
      // Check if all goals are satisfied
      const allGoalsMet = currentGoals.every((g) => {
        if (g.type === 'score') return currentScore >= g.required;
        return g.current >= g.required;
      });

      if (allGoalsMet) {
        setIsWon(true);
        setIsGameOverModalOpen(true);
        // Save stars
        const stars = [
          currentScore >= currentLevelConfig.starScores[0],
          currentScore >= currentLevelConfig.starScores[1],
          currentScore >= currentLevelConfig.starScores[2],
        ].filter(Boolean).length || 1;

        setLevelStars((prev) => ({
          ...prev,
          [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
        }));
        setUnlockedLevel((prev) => Math.max(prev, currentLevelId + 1));
        return true;
      }

      if (currentMoves <= 0) {
        setIsWon(false);
        setIsGameOverModalOpen(true);
        return true;
      }

      return false;
    },
    [currentLevelConfig, currentLevelId]
  );

  // Board Cascade & Chain Reaction Loop
  const processCascades = useCallback(
    async (
      currentBoard: (Gem | null)[][],
      currentTiles: BoardTile[][],
      combo = 1
    ) => {
      setIsLocked(true);

      const matches = findMatches(currentBoard, currentTiles);
      if (matches.matchedGems.length === 0) {
        // No more matches, check if board has valid moves or needs shuffle
        const possible = findPossibleMoves(currentBoard, currentTiles);
        if (possible.length === 0) {
          addFloatingText('보석을 섞는 중...', 180, 180, '#facc15');
          // Shuffle board
          const newB = currentBoard.map((row) => row.map((g) => (g ? { ...g } : null)));
          const activeGems: Gem[] = [];
          for (let r = 0; r < newB.length; r++) {
            for (let c = 0; c < newB[0].length; c++) {
              if (currentTiles[r][c].isActive && newB[r][c]) {
                activeGems.push(newB[r][c]!);
              }
            }
          }
          for (let i = activeGems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = activeGems[i].color;
            activeGems[i].color = activeGems[j].color;
            activeGems[j].color = tmp;
          }
          setBoard(newB);
        }

        setIsLocked(false);
        return;
      }

      // Play chime based on combo
      sound.playMatch(combo);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Calculate score for this match
      const points = matches.matchedGems.length * 60 * combo;
      setScore((s) => s + points);

      // Collect matched goals
      setGoals((prevGoals) =>
        prevGoals.map((goal) => {
          if (goal.type === 'collect_gem' && goal.targetColor) {
            const count = matches.matchedGems.filter(
              (g) => g.color === goal.targetColor
            ).length;
            return { ...goal, current: goal.current + count };
          }
          return goal;
        })
      );

      // Show floating combo text
      if (combo > 1) {
        const first = matches.matchedGems[0];
        addFloatingText(
          `COMBO x${combo}!`,
          (first.col + 0.5) * 44,
          (first.row + 0.5) * 44,
          combo >= 3 ? '#ec4899' : '#38bdf8'
        );
      }

      // Break gold tiles underneath matched gems
      let goldBroken = 0;
      const nextTiles = currentTiles.map((row) =>
        row.map((tile) => {
          const matchedOnTile = matches.matchedGems.some(
            (g) => g.row === tile.row && g.col === tile.col
          );
          if (matchedOnTile && tile.isGoldTile) {
            goldBroken++;
            return { ...tile, isGoldTile: false, goldHp: 0 };
          }
          return { ...tile };
        })
      );

      if (goldBroken > 0) {
        setGoals((prev) =>
          prev.map((g) => (g.type === 'clear_gold' ? { ...g, current: g.current + goldBroken } : g))
        );
        setTiles(nextTiles);
      }

      // Mark matched gems as null, keeping any newly created specials
      const nextBoard = currentBoard.map((row) => row.map((g) => (g ? { ...g } : null)));
      matches.matchedGems.forEach((g) => {
        nextBoard[g.row][g.col] = null;
      });

      // Insert special creations
      matches.specialCreations.forEach((spec) => {
        sound.playSpecialCreate();
        nextBoard[spec.row][spec.col] = {
          id: nextGemId(),
          color: spec.gem.color,
          special: spec.specialType,
          row: spec.row,
          col: spec.col,
        };
        setGoals((prev) =>
          prev.map((g) =>
            g.type === 'create_special' && g.targetSpecial === spec.specialType
              ? { ...g, current: g.current + 1 }
              : g
          )
        );
      });

      setBoard(nextBoard);

      // Wait a moment for match burst visual
      await new Promise((res) => setTimeout(res, 220));

      // Gravity fall
      applyGravityAndRefill(nextBoard, nextTiles, currentLevelConfig.allowedColors);
      setBoard([...nextBoard]);

      // Wait for drop animation
      await new Promise((res) => setTimeout(res, 250));

      // Recursive cascade
      await processCascades(nextBoard, nextTiles, combo + 1);
    },
    [currentLevelConfig]
  );

  // Trigger Special Activation (Lightning Prism, Bomb, Line Blasters)
  const activateSpecialAction = async (
    specialGem: Gem,
    partnerGem: Gem | null,
    currentBoard: (Gem | null)[][]
  ) => {
    setIsLocked(true);
    const numRows = currentBoard.length;
    const numCols = currentBoard[0].length;
    const nextBoard = currentBoard.map((row) => row.map((g) => (g ? { ...g } : null)));
    const matchedCoords: { r: number; c: number }[] = [];

    // CASE 1: RAINBOW DIAMOND (Electric Lightning Storm!)
    if (specialGem.special === 'rainbow_diamond' || partnerGem?.special === 'rainbow_diamond') {
      const prism = specialGem.special === 'rainbow_diamond' ? specialGem : partnerGem!;
      const targetColor =
        prism === specialGem
          ? partnerGem?.color || currentLevelConfig.allowedColors[0]
          : specialGem.color;

      sound.playLightning();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      // Collect all gems with targetColor
      const lightningHits: LightningTarget[] = [];
      const cellSize = 360 / numCols;
      const startX = (prism.col + 0.5) * cellSize;
      const startY = (prism.row + 0.5) * cellSize;

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const g = nextBoard[r][c];
          if (g && (g.color === targetColor || (r === prism.row && c === prism.col))) {
            matchedCoords.push({ r, c });
            lightningHits.push({
              startX,
              startY,
              endX: (c + 0.5) * cellSize,
              endY: (r + 0.5) * cellSize,
              color: '#38bdf8',
            });
          }
        }
      }

      setLightningTargets(lightningHits);
      addFloatingText('⚡ LIGHTNING STORM! ⚡', startX, startY, '#38bdf8');

      // Wait for lightning strike duration
      await new Promise((res) => setTimeout(res, 400));
      setLightningTargets([]);
    }

    // CASE 2: BOMB (3x3 fiery detonation)
    else if (specialGem.special === 'bomb' || partnerGem?.special === 'bomb') {
      sound.playBomb();
      const bombCenter = specialGem.special === 'bomb' ? specialGem : partnerGem!;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = bombCenter.row + dr;
          const c = bombCenter.col + dc;
          if (r >= 0 && r < numRows && c >= 0 && c < numCols && tiles[r][c]?.isActive) {
            matchedCoords.push({ r, c });
          }
        }
      }
      addFloatingText('💥 BOOM! 💥', (bombCenter.col + 0.5) * 44, (bombCenter.row + 0.5) * 44, '#f97316');
    }

    // CASE 3: LINE HORIZONTAL OR VERTICAL
    else if (
      specialGem.special === 'line_horizontal' ||
      specialGem.special === 'line_vertical' ||
      partnerGem?.special === 'line_horizontal' ||
      partnerGem?.special === 'line_vertical'
    ) {
      sound.playSpecialCreate();
      const lineGem =
        specialGem.special === 'line_horizontal' || specialGem.special === 'line_vertical'
          ? specialGem
          : partnerGem!;

      if (lineGem.special === 'line_horizontal') {
        for (let c = 0; c < numCols; c++) {
          if (tiles[lineGem.row][c]?.isActive) {
            matchedCoords.push({ r: lineGem.row, c });
          }
        }
      } else {
        for (let r = 0; r < numRows; r++) {
          if (tiles[r][lineGem.col]?.isActive) {
            matchedCoords.push({ r, c: lineGem.col });
          }
        }
      }
    }

    // Clear matched gems
    const destroyedGems: Gem[] = [];
    matchedCoords.forEach(({ r, c }) => {
      const g = nextBoard[r][c];
      if (g) {
        destroyedGems.push(g);
        nextBoard[r][c] = null;
      }
    });

    // Score & Goals
    const blastScore = destroyedGems.length * 100;
    setScore((s) => s + blastScore);

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.type === 'collect_gem' && goal.targetColor) {
          const cnt = destroyedGems.filter((g) => g.color === goal.targetColor).length;
          return { ...goal, current: goal.current + cnt };
        }
        return goal;
      })
    );

    // Break gold tiles underneath
    let goldBroken = 0;
    const nextTiles = tiles.map((row) =>
      row.map((tile) => {
        const hit = matchedCoords.some((mc) => mc.r === tile.row && mc.c === tile.col);
        if (hit && tile.isGoldTile) {
          goldBroken++;
          return { ...tile, isGoldTile: false, goldHp: 0 };
        }
        return tile;
      })
    );
    if (goldBroken > 0) {
      setGoals((prev) =>
        prev.map((g) => (g.type === 'clear_gold' ? { ...g, current: g.current + goldBroken } : g))
      );
      setTiles(nextTiles);
    }

    setBoard(nextBoard);
    await new Promise((res) => setTimeout(res, 200));

    // Refill & Cascade
    applyGravityAndRefill(nextBoard, nextTiles, currentLevelConfig.allowedColors);
    setBoard([...nextBoard]);
    await new Promise((res) => setTimeout(res, 250));

    await processCascades(nextBoard, nextTiles, 2);
  };

  // Perform Swap between two positions
  const executeSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isLocked) return;
    const gem1 = board[r1][c1];
    const gem2 = board[r2][c2];
    if (!gem1 || !gem2) return;

    sound.playSwap();
    setHintMove(null);

    // Create swapped board
    const nextBoard = board.map((row) => row.map((g) => (g ? { ...g } : null)));
    nextBoard[r1][c1] = { ...gem2, row: r1, col: c1 };
    nextBoard[r2][c2] = { ...gem1, row: r2, col: c2 };
    setBoard(nextBoard);

    // Check if either gem is a Special Gem (Rainbow, Bomb, Line)
    const hasSpecial = gem1.special !== 'none' || gem2.special !== 'none';

    if (hasSpecial) {
      const newMoves = movesLeft - 1;
      setMovesLeft(newMoves);
      await activateSpecialAction(gem1, gem2, nextBoard);
      checkGameProgress(goals, newMoves, score);
      return;
    }

    // Check standard match
    const matches = findMatches(nextBoard, tiles, { r: r2, c: c2 });

    if (matches.matchedGems.length === 0) {
      // Invalid swap: Revert back!
      sound.playInvalid();
      setIsLocked(true);
      await new Promise((res) => setTimeout(res, 220));
      nextBoard[r1][c1] = { ...gem1, row: r1, col: c1 };
      nextBoard[r2][c2] = { ...gem2, row: r2, col: c2 };
      setBoard([...nextBoard]);
      setIsLocked(false);
    } else {
      // Valid move!
      const newMoves = movesLeft - 1;
      setMovesLeft(newMoves);
      await processCascades(nextBoard, tiles, 1);
      checkGameProgress(goals, newMoves, score);
    }
  };

  // Handle Tile Click / Selection
  const handleTileClick = (r: number, c: number) => {
    if (isLocked) return;

    // Handle Active Booster Item
    if (activeBooster) {
      handleBoosterClick(r, c);
      return;
    }

    if (!selectedPos) {
      setSelectedPos({ r, c });
      sound.playClick();
    } else {
      const { r: r1, c: c1 } = selectedPos;
      if (r1 === r && c1 === c) {
        setSelectedPos(null);
        return;
      }

      if (areAdjacent(r1, c1, r, c)) {
        setSelectedPos(null);
        executeSwap(r1, c1, r, c);
      } else {
        setSelectedPos({ r, c });
        sound.playClick();
      }
    }
  };

  // Handle Swipe Gesture
  const handleSwipeMove = (r1: number, c1: number, r2: number, c2: number) => {
    if (isLocked) return;
    if (activeBooster) return;
    setSelectedPos(null);
    executeSwap(r1, c1, r2, c2);
  };

  // Handle Booster Application
  const handleBoosterClick = (r: number, c: number) => {
    if (!activeBooster || inventory[activeBooster] <= 0) {
      setActiveBooster(null);
      return;
    }

    const nextBoard = board.map((row) => row.map((g) => (g ? { ...g } : null)));

    if (activeBooster === 'hammer') {
      sound.playBomb();
      const target = nextBoard[r][c];
      if (target) {
        nextBoard[r][c] = null;
        setBoard(nextBoard);
        addFloatingText('🔨 망치 타격!', (c + 0.5) * 44, (r + 0.5) * 44, '#f59e0b');
        setInventory((prev) => ({ ...prev, hammer: prev.hammer - 1 }));
        applyGravityAndRefill(nextBoard, tiles, currentLevelConfig.allowedColors);
        setBoard([...nextBoard]);
        processCascades(nextBoard, tiles, 1);
      }
    } else if (activeBooster === 'bomb') {
      sound.playSpecialCreate();
      if (nextBoard[r][c]) {
        nextBoard[r][c] = {
          ...nextBoard[r][c]!,
          special: 'bomb',
        };
        setBoard(nextBoard);
        setInventory((prev) => ({ ...prev, bomb: prev.bomb - 1 }));
      }
    } else if (activeBooster === 'rainbow') {
      sound.playSpecialCreate();
      if (nextBoard[r][c]) {
        nextBoard[r][c] = {
          ...nextBoard[r][c]!,
          special: 'rainbow_diamond',
        };
        setBoard(nextBoard);
        setInventory((prev) => ({ ...prev, rainbow: prev.rainbow - 1 }));
      }
    } else if (activeBooster === 'swap') {
      if (!selectedPos) {
        setSelectedPos({ r, c });
        return;
      } else {
        const { r: r1, c: c1 } = selectedPos;
        const g1 = nextBoard[r1][c1];
        const g2 = nextBoard[r][c];
        if (g1 && g2) {
          nextBoard[r1][c1] = { ...g2, row: r1, col: c1 };
          nextBoard[r][c] = { ...g1, row: r, col: c };
          setBoard(nextBoard);
          sound.playSwap();
          setInventory((prev) => ({ ...prev, swap: prev.swap - 1 }));
          processCascades(nextBoard, tiles, 1);
        }
        setSelectedPos(null);
      }
    }

    setActiveBooster(null);
  };

  // Find & Show Hint
  const handleShowHint = () => {
    sound.playClick();
    const possible = findPossibleMoves(board, tiles);
    if (possible.length > 0) {
      setHintMove(possible[0]);
      setTimeout(() => setHintMove(null), 3000);
    } else {
      addFloatingText('가능한 이동 없음 - 셔플!', 180, 180, '#ef4444');
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-between overflow-hidden bg-slate-950 font-sans select-none touch-none">
      {/* Outer Scenic Background */}
      <DesertScenery />

      {/* Main Game Frame Container (Mobile Portrait Aspect Ratio) */}
      <div className="relative z-10 w-full max-w-[480px] h-full flex flex-col justify-between py-1 px-2">
        {/* Top Header */}
        <GameHeader
          levelNumber={currentLevelId}
          moves={movesLeft}
          score={score}
          starScores={currentLevelConfig.starScores}
          goals={goals}
          isMuted={isMuted}
          onToggleSound={() => {
            sound.isMuted = !isMuted;
            setIsMuted(!isMuted);
          }}
          onOpenSettings={() => setIsLevelSelectOpen(true)}
          onShowHint={handleShowHint}
        />

        {/* Action Quick Bar (Plan doc, Level Map, Replay) */}
        <div className="flex items-center justify-between px-2 py-0.5 z-20">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 text-xs font-bold rounded-full border border-amber-400/50 shadow-md backdrop-blur-xs transition-transform active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            구현 계획서
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsLevelSelectOpen(true)}
              className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 text-xs font-bold rounded-full border border-amber-400/50 shadow-md backdrop-blur-xs transition-transform active:scale-95"
            >
              레벨 선택
            </button>
            <button
              onClick={() => startLevel(currentLevelConfig)}
              title="현재 레벨 재시작"
              className="w-7 h-7 flex items-center justify-center bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 rounded-full border border-amber-400/50 shadow-md backdrop-blur-xs transition-transform active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: The Jewel Grid GameBoard */}
        <GameBoard
          board={board}
          tiles={tiles}
          selectedPos={selectedPos}
          hintMove={hintMove}
          onTileClick={handleTileClick}
          onSwipeMove={handleSwipeMove}
          lightningTargets={lightningTargets}
          onLightningDone={() => setLightningTargets([])}
          floatingTexts={floatingTexts}
          isLocked={isLocked}
          activeBooster={activeBooster}
        />

        {/* Bottom Booster Bar */}
        <BoosterBar
          activeBooster={activeBooster}
          onSelectBooster={(type) => {
            sound.playClick();
            setActiveBooster(type);
          }}
          inventory={inventory}
        />
      </div>

      {/* Win / Loss Modal */}
      <LevelCompleteModal
        isOpen={isGameOverModalOpen}
        isWon={isWon}
        score={score}
        starScores={currentLevelConfig.starScores}
        levelNumber={currentLevelId}
        onNextLevel={() => {
          const nextId = Math.min(LEVELS.length, currentLevelId + 1);
          setCurrentLevelId(nextId);
          setIsGameOverModalOpen(false);
        }}
        onReplay={() => {
          startLevel(currentLevelConfig);
        }}
        onLevelSelect={() => {
          setIsGameOverModalOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        currentLevelId={currentLevelId}
        onSelectLevel={(id) => {
          setCurrentLevelId(id);
          setIsLevelSelectOpen(false);
        }}
        unlockedLevel={unlockedLevel}
        levelStars={levelStars}
      />

      {/* Implementation Plan View Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-text">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-900 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-black text-amber-200">
                  보석 퍼즐 반응형 웹 구현 계획서
                </h2>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-amber-200 hover:text-white flex items-center justify-center border border-amber-400/40"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4 text-xs leading-relaxed text-amber-100/90">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-yellow-300 mb-1">
                  1. 핵심 기획 및 비주얼 테마 (Visual Theme & Screen Replica)
                </h3>
                <p>
                  - 제공해주신 스크린샷과 동일한 <strong>고대 이집트 파라오 신전</strong> 분위기 구현.
                  <br />
                  - 상단 구름형 헤더: 스테이지 목표(흑요석 12개, 황금 타일 21개 등), 중앙 레벨 및 남은 이동 횟수(32회 배지), 우측 점수 및 3성 프로그레스 바.
                  <br />
                  - 스크린샷 하단의 황금 피라미드, 스핑크스 석상, 붉은 배지("재밌는게임 오프라인") 완벽 재현.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-yellow-300 mb-1">
                  2. 특수 보석 & 사각 매치 연출 (Square Match & Specials)
                </h3>
                <p>
                  - <strong>2x2 사각형 매치 (4개 매치)</strong>: 같은 색상의 보석 4개가 2x2 정사각형 형태로 모였을 때도 깨지며, 폭탄 보석을 생성합니다.
                  <br />
                  - <strong>무지개 프리즘 다이아몬드 (5개 매치)</strong>: 스크린샷의 중심 연출처럼 보석 활성화 시 HTML5 Canvas 기반의 가지형 전기 아크(Branching Electric Lightning)가 목표 색상의 모든 보석으로 뻗어나가며 일제히 격발 파괴.
                  <br />
                  - <strong>폭탄 보석 (T자/L자/2x2 매치)</strong>: 3x3 범위 폭발.
                  <br />
                  - <strong>라인 번개 보석 (4개 일렬 매치)</strong>: 가로 또는 세로 한 줄 전체 레이저 관통.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-yellow-300 mb-1">
                  3. 모바일 최적화 반응형 설계 (Mobile Responsive & Touch Controls)
                </h3>
                <p>
                  - <strong>터치 스와이프 제스처</strong>: 보석을 드래그하거나 밀어 넘기면 즉시 인접 보석과 교환.
                  <br />
                  - <strong>원터치 선택 모드</strong>: 보석을 터치한 뒤 인접한 보석을 터치해도 교환 가능.
                  <br />
                  - <strong>반응형 뷰포트 (100dvh)</strong>: 상하 헤더와 부스터 바를 고려하여 화면 높이에 맞춰 그리드 크기를 자동 연산(`Math.min(vw, vh)`). 화면 스크롤이나 터치 튕김을 방지(`touch-action: none`).
                  <br />
                  - <strong>햅틱 피드백</strong>: 스마트폰 브라우저에서 매치 시 진동 효과(`navigator.vibrate`) 지원.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-yellow-300 mb-1">
                  4. 웹 오디오 사운드 시스템 (Procedural Web Audio)
                </h3>
                <p>
                  - 외부 음원 다운로드 대기 없이 순수 브라우저 Web Audio API로 화음 차임, 콤보 상승 피치, 번개 감전음, 폭발음, 클리어 팡파르를 실시간 합성하여 100% 오프라인 작동.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30">
                <h3 className="font-black text-sm text-yellow-300 mb-1">
                  5. 부스터 아이템 및 스테이지 시스템
                </h3>
                <p>
                  - 하단 부스터: 망치(지정 보석 파괴), 자유 교환(매치 여부 무관 교환), 폭탄 설치, 번개 보석 설치.
                  <br />
                  - 다채로운 레벨 구성: 1단계 기초 훈련부터 스크린샷의 파라오 610/2레벨, 스핑크스 번개 신전, 오시리스 황금 묘소까지 단계별 클리어 및 별점 저장 지원.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg border border-yellow-200"
            >
              게임 플레이로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
