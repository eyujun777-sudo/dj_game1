import React from 'react';
import { LEVELS } from '../data/levels';
import { Star, X, Lock, Play } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  unlockedLevel: number;
  levelStars: Record<number, number>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevelId,
  onSelectLevel,
  unlockedLevel,
  levelStars,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-800 via-amber-950 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-white max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-900/80 border border-amber-400 flex items-center justify-center text-amber-200 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-amber-200 tracking-wide">
            피라미드 탐험 지도
          </h2>
          <p className="text-xs text-amber-300/80 mt-1">
            원하는 레벨을 선택하여 도전하세요
          </p>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {LEVELS.map((lvl) => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const isCurrent = lvl.id === currentLevelId;
            const stars = levelStars[lvl.id] || 0;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                  !isUnlocked
                    ? 'bg-slate-900/50 border-slate-700/50 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-r from-amber-600/80 to-amber-800/80 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] cursor-pointer'
                    : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg border-2 ${
                      isUnlocked
                        ? 'bg-amber-500 text-slate-950 border-amber-200'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isUnlocked ? lvl.id : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>

                  <div>
                    <div className="font-black text-sm text-amber-100">{lvl.title}</div>
                    <div className="text-xs text-amber-300/70">
                      이동: {lvl.moves}회 | 목표: {lvl.targetScore.toLocaleString()}점
                    </div>
                  </div>
                </div>

                {/* Stars earned */}
                {isUnlocked && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars
                            ? 'text-yellow-400 fill-current'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
