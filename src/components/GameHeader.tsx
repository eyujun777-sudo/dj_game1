import React from 'react';
import { LevelGoal, GemColor, SpecialType } from '../types/game';
import { GemView } from './GemView';
import { Star, Volume2, VolumeX, Pause, HelpCircle } from 'lucide-react';

interface GameHeaderProps {
  levelNumber: number;
  moves: number;
  score: number;
  starScores: [number, number, number];
  goals: LevelGoal[];
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onShowHint?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  levelNumber,
  moves,
  score,
  starScores,
  goals,
  isMuted,
  onToggleSound,
  onOpenSettings,
  onShowHint,
}) => {
  // Compute star progress (0% to 100%)
  const maxScore = starScores[2];
  const progressRatio = Math.min(1, score / maxScore);
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  const starsEarned = [
    score >= starScores[0],
    score >= starScores[1],
    score >= starScores[2],
  ];

  return (
    <header className="relative w-full z-20 pt-2 pb-1 px-2 select-none">
      {/* Decorative Cloud & Egyptian Header Background */}
      <div className="bg-gradient-to-b from-sky-200/90 via-sky-100/90 to-amber-50/90 text-slate-800 rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.35)] border-2 border-amber-300/80 px-3 py-2 flex items-center justify-between backdrop-blur-md">
        
        {/* LEFT: Goals & Targets */}
        <div className="flex items-center gap-2 max-w-[34%]">
          {goals.map((goal, idx) => {
            const remaining = Math.max(0, goal.required - goal.current);
            const isCompleted = remaining === 0;

            return (
              <div
                key={idx}
                className="flex items-center gap-1 bg-amber-950/10 rounded-xl px-2 py-1 border border-amber-500/30 shadow-inner"
              >
                <div className="w-7 h-7 flex-shrink-0 relative">
                  {goal.type === 'collect_gem' && goal.targetColor && (
                    <GemView color={goal.targetColor} size={28} />
                  )}
                  {goal.type === 'clear_gold' && (
                    <div className="w-full h-full bg-gradient-to-br from-amber-300 to-yellow-600 rounded-md border border-yellow-200 flex items-center justify-center shadow">
                      <span className="text-xs">🏛️</span>
                    </div>
                  )}
                  {goal.type === 'create_special' && (
                    <GemView
                      color="amethyst"
                      special={goal.targetSpecial || 'rainbow_diamond'}
                      size={28}
                    />
                  )}
                  {goal.type === 'score' && (
                    <div className="w-full h-full bg-amber-400 rounded-full flex items-center justify-center font-bold text-xs text-amber-950">
                      ★
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center min-w-[20px]">
                  <span
                    className={`font-black text-xs leading-none ${
                      isCompleted ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {isCompleted ? '✓' : remaining}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER: Level Badge & Remaining Moves */}
        <div className="flex flex-col items-center relative -mt-4">
          <div className="bg-amber-600 border border-amber-300 text-amber-100 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-t-lg shadow-sm">
            LEVEL {levelNumber}
          </div>
          <div className="relative flex items-center justify-center w-16 h-14 bg-gradient-to-b from-red-500 to-red-700 rounded-2xl shadow-[0_5px_15px_rgba(220,38,38,0.5)] border-2 border-red-300 transform transition-transform hover:scale-105">
            <div className="absolute inset-1 rounded-xl border border-red-400/40 pointer-events-none" />
            <span
              className={`font-black tracking-tight text-white ${
                moves <= 5 ? 'text-2xl animate-pulse text-yellow-300' : 'text-3xl'
              }`}
              style={{ fontFamily: "'Cinzel', serif, sans-serif" }}
            >
              {moves}
            </span>
          </div>
          <span className="text-[10px] font-black text-amber-900 mt-0.5 tracking-tight uppercase">
            MOVES
          </span>
        </div>

        {/* RIGHT: Score & 3-Star Progress Bar */}
        <div className="flex flex-col items-end gap-1 max-w-[34%]">
          {/* Top small action buttons */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {onShowHint && (
              <button
                onClick={onShowHint}
                title="힌트 보기"
                className="w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-500 active:scale-90 text-amber-950 flex items-center justify-center shadow-xs transition-transform"
              >
                <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
            <button
              onClick={onToggleSound}
              title={isMuted ? '소리 켜기' : '음소거'}
              className="w-6 h-6 rounded-full bg-amber-200 hover:bg-amber-300 active:scale-90 text-amber-900 flex items-center justify-center shadow-xs transition-transform"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="일시정지 / 메뉴"
                className="w-6 h-6 rounded-full bg-amber-200 hover:bg-amber-300 active:scale-90 text-amber-900 flex items-center justify-center shadow-xs transition-transform"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Current Score Display */}
          <div className="font-black text-amber-950 text-sm tracking-tight leading-none">
            {score.toLocaleString()}
          </div>

          {/* 3-Star Progress Track */}
          <div className="relative w-24 h-3 bg-slate-700/30 rounded-full border border-amber-400/80 p-0.5 shadow-inner flex items-center">
            {/* Fill Bar */}
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />

            {/* 3 Star Icons at Milestones */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
                starsEarned[0] ? 'scale-125 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,1)]' : 'text-slate-400'
              }`}
              style={{ left: `${(starScores[0] / maxScore) * 100}%` }}
            >
              <Star className="w-3 h-3 fill-current stroke-[2]" />
            </div>
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
                starsEarned[1] ? 'scale-125 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,1)]' : 'text-slate-400'
              }`}
              style={{ left: `${(starScores[1] / maxScore) * 100}%` }}
            >
              <Star className="w-3.5 h-3.5 fill-current stroke-[2]" />
            </div>
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-300 ${
                starsEarned[2] ? 'scale-135 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)]' : 'text-slate-400'
              }`}
              style={{ left: '95%' }}
            >
              <Star className="w-4 h-4 fill-current stroke-[2]" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
