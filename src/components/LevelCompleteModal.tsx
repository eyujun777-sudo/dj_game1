import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Trophy, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/audio';

interface LevelCompleteModalProps {
  isOpen: boolean;
  isWon: boolean;
  score: number;
  starScores: [number, number, number];
  levelNumber: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  isWon,
  score,
  starScores,
  levelNumber,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isWon) {
        sound.playVictory();
        // Fire confetti cannons
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#a855f7'],
        });
      } else {
        sound.playGameOver();
      }
    }
  }, [isOpen, isWon]);

  if (!isOpen) return null;

  const starsCount = [
    score >= starScores[0],
    score >= starScores[1],
    score >= starScores[2],
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-700 via-amber-900 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 text-center shadow-[0_15px_40px_rgba(0,0,0,0.8)] text-white">
        {/* Top Floating Badge */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 px-6 py-1.5 rounded-full font-black text-sm uppercase tracking-wider shadow-lg border-2 border-amber-200">
          {isWon ? 'LEVEL COMPLETED!' : 'OUT OF MOVES'}
        </div>

        {/* Header Icon / Title */}
        <div className="mt-4 mb-3 flex flex-col items-center">
          {isWon ? (
            <>
              <Trophy className="w-14 h-14 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce" />
              <h2 className="text-2xl font-black text-amber-200 tracking-wide mt-1">
                레벨 {levelNumber} 클리어!
              </h2>
            </>
          ) : (
            <>
              <AlertTriangle className="w-14 h-14 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              <h2 className="text-2xl font-black text-red-200 tracking-wide mt-1">
                미션 실패
              </h2>
              <p className="text-xs text-amber-200/80 mt-1">
                이동 횟수를 모두 소진했습니다.
              </p>
            </>
          )}
        </div>

        {/* Star Rating Display */}
        {isWon && (
          <div className="flex items-center justify-center gap-3 my-4">
            {[1, 2, 3].map((starIdx) => {
              const active = starIdx <= (starsCount || 1);
              return (
                <div
                  key={starIdx}
                  className={`transition-all duration-500 transform ${
                    active
                      ? 'scale-120 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)]'
                      : 'scale-90 text-slate-600'
                  }`}
                >
                  <Star className="w-10 h-10 fill-current stroke-[1.5]" />
                </div>
              );
            })}
          </div>
        )}

        {/* Final Score Card */}
        <div className="bg-slate-950/60 rounded-2xl border border-amber-500/40 p-3 my-4">
          <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
            최종 점수
          </div>
          <div
            className="text-3xl font-black text-amber-100 tracking-tight mt-0.5"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-5">
          {isWon ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base rounded-2xl shadow-[0_5px_15px_rgba(16,185,129,0.5)] border border-emerald-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              다음 레벨 도전
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-base rounded-2xl shadow-[0_5px_15px_rgba(245,158,11,0.5)] border border-yellow-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              다시 도전하기
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              재시작
            </button>
            <button
              onClick={onLevelSelect}
              className="py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              레벨 목록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
