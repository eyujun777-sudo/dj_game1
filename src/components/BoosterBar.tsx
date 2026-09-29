import React from 'react';
import { Hammer, RefreshCw, Zap, Sparkles } from 'lucide-react';

export type BoosterType = 'hammer' | 'swap' | 'bomb' | 'rainbow' | null;

interface BoosterBarProps {
  activeBooster: BoosterType;
  onSelectBooster: (type: BoosterType) => void;
  inventory: Record<'hammer' | 'swap' | 'bomb' | 'rainbow', number>;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  activeBooster,
  onSelectBooster,
  inventory,
}) => {
  const items: {
    type: 'hammer' | 'swap' | 'bomb' | 'rainbow';
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'hammer',
      label: '망치',
      icon: <Hammer className="w-5 h-5 text-amber-100" />,
      color: 'from-amber-600 to-amber-800 border-amber-400',
    },
    {
      type: 'swap',
      label: '자유 교환',
      icon: <RefreshCw className="w-5 h-5 text-emerald-100" />,
      color: 'from-emerald-600 to-emerald-800 border-emerald-400',
    },
    {
      type: 'bomb',
      label: '폭탄',
      icon: <span className="text-lg">💣</span>,
      color: 'from-orange-600 to-red-800 border-orange-400',
    },
    {
      type: 'rainbow',
      label: '번개 보석',
      icon: <Zap className="w-5 h-5 text-yellow-200 fill-yellow-300" />,
      color: 'from-fuchsia-600 to-indigo-800 border-fuchsia-400',
    },
  ];

  return (
    <div className="w-full flex items-center justify-around px-4 py-2 bg-gradient-to-t from-black/80 via-slate-900/60 to-transparent z-20">
      {items.map((item) => {
        const isSelected = activeBooster === item.type;
        const count = inventory[item.type];

        return (
          <button
            key={item.type}
            onClick={() => onSelectBooster(isSelected ? null : item.type)}
            className={`relative flex flex-col items-center group transition-all duration-150 ${
              isSelected ? 'scale-115 -translate-y-1' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {/* Booster circular button */}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} border-2 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                isSelected
                  ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse'
                  : ''
              }`}
            >
              {item.icon}
            </div>

            {/* Inventory Badge */}
            <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 border border-white text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md">
              {count}
            </div>

            {/* Title */}
            <span className="text-[10px] font-bold text-amber-200 mt-1 drop-shadow">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
