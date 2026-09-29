import React, { useRef, useState, useEffect } from 'react';
import { Gem, BoardTile, LightningTarget, FloatingText, GemColor, SpecialType } from '../types/game';
import { GemView } from './GemView';
import { LightningCanvas } from './LightningCanvas';
import { BoosterType } from './BoosterBar';

interface GameBoardProps {
  board: (Gem | null)[][];
  tiles: BoardTile[][];
  selectedPos: { r: number; c: number } | null;
  hintMove: { r1: number; c1: number; r2: number; c2: number } | null;
  onTileClick: (r: number, c: number) => void;
  onSwipeMove: (r1: number, c1: number, r2: number, c2: number) => void;
  lightningTargets: LightningTarget[];
  onLightningDone: () => void;
  floatingTexts: FloatingText[];
  isLocked: boolean;
  activeBooster: BoosterType;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  tiles,
  selectedPos,
  hintMove,
  onTileClick,
  onSwipeMove,
  lightningTargets,
  onLightningDone,
  floatingTexts,
  isLocked,
  activeBooster,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

  const numRows = board?.length || 0;
  const numCols = board?.[0]?.length || 8;

  // Responsive Board Sizing
  const [boardDimension, setBoardDimension] = useState<number>(360);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth || window.innerWidth;
      const parentHeight = window.innerHeight;

      // Available space: account for header (~130px) and footer/boosters (~160px)
      const availableW = Math.min(parentWidth - 24, 460);
      const availableH = parentHeight - 270;
      const size = Math.floor(Math.min(availableW, availableH, 440));
      setBoardDimension(Math.max(280, size));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (numRows === 0 || !board || !tiles || tiles.length === 0) {
    return (
      <div className="relative flex items-center justify-center w-full my-auto h-72">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const cellSize = boardDimension / numCols;

  // Touch Swipe Handlers for effortless mobile touch play
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    if (isLocked) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, r, c };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isLocked) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const { r, c } = touchStartRef.current;
    touchStartRef.current = null;

    const threshold = 22; // min swipe distance in px
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        const targetCol = dx > 0 ? c + 1 : c - 1;
        if (targetCol >= 0 && targetCol < numCols && tiles[r][targetCol]?.isActive) {
          onSwipeMove(r, c, r, targetCol);
        }
      } else {
        // Vertical swipe
        const targetRow = dy > 0 ? r + 1 : r - 1;
        if (targetRow >= 0 && targetRow < numRows && tiles[targetRow][c]?.isActive) {
          onSwipeMove(r, c, targetRow, c);
        }
      }
    } else {
      // Considered a tap/click
      onTileClick(r, c);
    }
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent, r: number, c: number) => {
    if (isLocked) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY, r, c };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStartRef.current || isLocked) {
      touchStartRef.current = null;
      return;
    }
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const { r, c } = touchStartRef.current;
    touchStartRef.current = null;

    const threshold = 20;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const targetCol = dx > 0 ? c + 1 : c - 1;
        if (targetCol >= 0 && targetCol < numCols && tiles[r][targetCol]?.isActive) {
          onSwipeMove(r, c, r, targetCol);
        }
      } else {
        const targetRow = dy > 0 ? r + 1 : r - 1;
        if (targetRow >= 0 && targetRow < numRows && tiles[targetRow][c]?.isActive) {
          onSwipeMove(r, c, targetRow, c);
        }
      }
    } else {
      onTileClick(r, c);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full my-auto select-none touch-none"
    >
      {/* Ancient Temple Ornate Board Frame with Golden Egyptian Edges */}
      <div
        className="relative rounded-3xl p-2.5 bg-gradient-to-b from-amber-700/80 via-amber-900/90 to-slate-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(251,191,36,0.6)] border-4 border-amber-500/80 backdrop-blur-lg"
        style={{
          width: `${boardDimension + 20}px`,
          height: `${boardDimension + 20}px`,
        }}
      >
        {/* Hieroglyphic Corner Embellishments */}
        <div className="absolute top-1 left-1 text-amber-300 text-xs font-serif opacity-70 pointer-events-none">
          𓀀
        </div>
        <div className="absolute top-1 right-1 text-amber-300 text-xs font-serif opacity-70 pointer-events-none">
          𓃭
        </div>
        <div className="absolute bottom-1 left-1 text-amber-300 text-xs font-serif opacity-70 pointer-events-none">
          𓆃
        </div>
        <div className="absolute bottom-1 right-1 text-amber-300 text-xs font-serif opacity-70 pointer-events-none">
          𓂀
        </div>

        {/* The Grid */}
        <div
          className="relative grid bg-slate-950/90 rounded-2xl overflow-hidden shadow-inner border border-amber-500/40"
          style={{
            width: `${boardDimension}px`,
            height: `${boardDimension}px`,
            gridTemplateRows: `repeat(${numRows}, 1fr)`,
            gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          }}
        >
          {/* Base Tiles (Background & Gold plates) */}
          {tiles.map((row, r) =>
            row.map((tile, c) => {
              if (!tile.isActive) {
                return (
                  <div
                    key={`tile-${r}-${c}`}
                    className="w-full h-full bg-transparent pointer-events-none"
                  />
                );
              }

              const isGold = tile.isGoldTile;
              return (
                <div
                  key={`tile-${r}-${c}`}
                  className={`relative w-full h-full border border-slate-800/80 transition-colors ${
                    isGold
                      ? 'bg-gradient-to-br from-amber-500/70 via-yellow-600/70 to-amber-700/80 shadow-[inset_0_0_8px_rgba(253,224,71,0.6)]'
                      : (r + c) % 2 === 0
                      ? 'bg-slate-900/80'
                      : 'bg-slate-800/80'
                  }`}
                >
                  {/* Gold Tile Sun Glyph Relief */}
                  {isGold && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                      <span className="text-amber-200 text-sm">☼</span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Gems Overlay */}
          {board.map((row, r) =>
            row.map((gem, c) => {
              if (!tiles[r][c].isActive) return null;

              const isSelected = selectedPos?.r === r && selectedPos?.c === c;
              const isHinted =
                (hintMove?.r1 === r && hintMove?.c1 === c) ||
                (hintMove?.r2 === r && hintMove?.c2 === c);

              return (
                <div
                  key={`gem-slot-${r}-${c}`}
                  className="absolute cursor-pointer flex items-center justify-center p-0.5 transition-all duration-200"
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    left: `${c * cellSize}px`,
                    top: `${r * cellSize}px`,
                  }}
                  onTouchStart={(e) => handleTouchStart(e, r, c)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={(e) => handleMouseDown(e, r, c)}
                  onMouseUp={handleMouseUp}
                >
                  {gem && (
                    <GemView
                      color={gem.color}
                      special={gem.special}
                      isSelected={isSelected}
                      isHinted={isHinted}
                      size={cellSize * 0.92}
                    />
                  )}
                </div>
              );
            })
          )}

          {/* Lightning Canvas on Top of the Board */}
          <LightningCanvas
            targets={lightningTargets}
            onComplete={onLightningDone}
            width={boardDimension}
            height={boardDimension}
          />

          {/* Floating Score and Combo Popups */}
          {floatingTexts.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-fade-up z-50 whitespace-nowrap"
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                color: item.color || '#fef08a',
                fontFamily: "'Cinzel', sans-serif",
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Active Booster Cursor Tooltip */}
      {activeBooster && (
        <div className="absolute top-2 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-lg border border-amber-200 animate-pulse pointer-events-none z-50">
          {activeBooster === 'hammer' && '보석을 터치하여 파괴하세요!'}
          {activeBooster === 'swap' && '바꿀 보석 2개를 차례로 터치하세요!'}
          {activeBooster === 'bomb' && '폭탄을 설치할 칸을 터치하세요!'}
          {activeBooster === 'rainbow' && '번개 다이아몬드를 설치할 칸을 터치하세요!'}
        </div>
      )}
    </div>
  );
};
