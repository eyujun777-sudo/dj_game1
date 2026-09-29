import React from 'react';
import { GemColor, SpecialType } from '../types/game';

interface GemViewProps {
  color: GemColor;
  special?: SpecialType;
  isSelected?: boolean;
  isHinted?: boolean;
  isMatched?: boolean;
  size?: number; // default cell responsive
}

export const GemView: React.FC<GemViewProps> = ({
  color,
  special = 'none',
  isSelected = false,
  isHinted = false,
  isMatched = false,
  size,
}) => {
  const isSpecial = special !== 'none';

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full select-none transition-transform duration-150 ${
        isSelected ? 'scale-110 z-20' : 'hover:scale-105 active:scale-95'
      } ${isHinted ? 'animate-bounce' : ''} ${isMatched ? 'scale-0 opacity-0 transition-all duration-300' : ''}`}
      style={{
        width: size ? `${size}px` : '100%',
        height: size ? `${size}px` : '100%',
      }}
    >
      {/* Outer Selection or Hint Ring */}
      {isSelected && (
        <div className="absolute inset-[-4px] rounded-2xl border-2 border-yellow-300 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse pointer-events-none" />
      )}

      {isHinted && !isSelected && (
        <div className="absolute inset-[-2px] rounded-xl border border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-ping pointer-events-none" />
      )}

      {/* Special Gem Aura / Halo */}
      {special === 'rainbow_diamond' && (
        <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-fuchsia-500/40 via-cyan-400/50 to-amber-300/40 blur-sm animate-spin [animation-duration:4s] pointer-events-none" />
      )}

      {special === 'bomb' && (
        <div className="absolute inset-[-4px] rounded-full bg-orange-600/30 blur-xs animate-ping [animation-duration:1.5s] pointer-events-none" />
      )}

      {/* Gem SVG Graphics */}
      <svg
        viewBox="0 0 100 100"
        className="w-[84%] h-[84%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] overflow-visible"
      >
        <defs>
          {/* RUBY GRADIENTS */}
          <radialGradient id="rubyGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff7a93" />
            <stop offset="45%" stopColor="#e11d48" />
            <stop offset="90%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>

          {/* EMERALD GRADIENTS */}
          <radialGradient id="emeraldGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>

          {/* SAPPHIRE GRADIENTS */}
          <radialGradient id="sapphireGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* TOPAZ / CITRINE GRADIENTS */}
          <radialGradient id="topazGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="85%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </radialGradient>

          {/* AMETHYST GRADIENTS */}
          <radialGradient id="amethystGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="40%" stopColor="#c026d3" />
            <stop offset="85%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </radialGradient>

          {/* OBSIDIAN / ONYX GRADIENTS */}
          <radialGradient id="obsidianGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#334155" />
            <stop offset="80%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* RAINBOW PRISM DIAMOND GRADIENTS */}
          <linearGradient id="prismLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="30%" stopColor="#f472b6" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Specular Glint Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SPECIAL RAINBOW DIAMOND */}
        {special === 'rainbow_diamond' ? (
          <g>
            {/* Outer Diamond Facets */}
            <polygon
              points="50,6 94,36 78,92 22,92 6,36"
              fill="url(#prismLight)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            {/* Facet lines */}
            <polygon points="50,6 50,42 94,36" fill="#ffffff" fillOpacity="0.4" />
            <polygon points="50,6 50,42 6,36" fill="#e879f9" fillOpacity="0.5" />
            <polygon points="50,42 78,92 22,92" fill="#67e8f9" fillOpacity="0.4" />
            <polygon points="50,42 94,36 78,92" fill="#c084fc" fillOpacity="0.6" />
            <polygon points="50,42 6,36 22,92" fill="#38bdf8" fillOpacity="0.6" />
            {/* Center Prism Gem Star */}
            <polygon
              points="50,18 60,38 82,42 66,58 70,80 50,68 30,80 34,58 18,42 40,38"
              fill="#ffffff"
              fillOpacity="0.8"
            />
            {/* Specular Shine Dot */}
            <circle cx="36" cy="24" r="5" fill="#ffffff" filter="url(#softGlow)" />
            <circle cx="62" cy="50" r="3" fill="#ffffff" />
          </g>
        ) : (
          /* REGULAR JEWELS (by color) */
          <>
            {/* 🔴 RUBY - Brilliant Round/Hexagon */}
            {color === 'ruby' && (
              <g>
                <polygon
                  points="50,8 86,28 86,72 50,92 14,72 14,28"
                  fill="url(#rubyGlow)"
                  stroke="#fda4af"
                  strokeWidth="1.8"
                />
                {/* Facets */}
                <polygon points="50,8 72,32 50,44 28,32" fill="#ffffff" fillOpacity="0.4" />
                <polygon points="72,32 86,28 86,72 68,64 50,44" fill="#fb7185" fillOpacity="0.3" />
                <polygon points="28,32 14,28 14,72 32,64 50,44" fill="#9f1239" fillOpacity="0.5" />
                <polygon points="50,44 68,64 50,92 32,64" fill="#881337" fillOpacity="0.4" />
                {/* Highlight */}
                <ellipse cx="36" cy="26" rx="8" ry="4" transform="rotate(-20 36 26)" fill="#ffffff" fillOpacity="0.6" />
              </g>
            )}

            {/* 🟢 EMERALD - Sharp Rhombus Diamond */}
            {color === 'emerald' && (
              <g>
                <polygon
                  points="50,8 90,50 50,92 10,50"
                  fill="url(#emeraldGlow)"
                  stroke="#a7f3d0"
                  strokeWidth="1.8"
                />
                <polygon points="50,8 72,50 50,76 28,50" fill="#ffffff" fillOpacity="0.35" />
                <polygon points="50,8 90,50 72,50" fill="#34d399" fillOpacity="0.4" />
                <polygon points="50,8 10,50 28,50" fill="#a7f3d0" fillOpacity="0.5" />
                <polygon points="72,50 90,50 50,92 50,76" fill="#047857" fillOpacity="0.6" />
                <polygon points="28,50 10,50 50,92 50,76" fill="#065f46" fillOpacity="0.5" />
                {/* Specular */}
                <circle cx="36" cy="32" r="5" fill="#ffffff" fillOpacity="0.7" />
              </g>
            )}

            {/* 🔵 SAPPHIRE - Octagonal Royal Shield */}
            {color === 'sapphire' && (
              <g>
                <polygon
                  points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30"
                  fill="url(#sapphireGlow)"
                  stroke="#bfdbfe"
                  strokeWidth="1.8"
                />
                {/* Inner Octagon */}
                <polygon
                  points="36,22 64,22 78,36 78,64 64,78 36,78 22,64 22,36"
                  fill="#ffffff"
                  fillOpacity="0.25"
                />
                {/* Top shine */}
                <polygon points="30,8 70,8 64,22 36,22" fill="#ffffff" fillOpacity="0.5" />
                <polygon points="8,30 22,36 22,64 8,70" fill="#60a5fa" fillOpacity="0.3" />
                <polygon points="92,30 78,36 78,64 92,70" fill="#1e40af" fillOpacity="0.5" />
                <circle cx="38" cy="24" r="5" fill="#ffffff" fillOpacity="0.8" />
              </g>
            )}

            {/* 🟡 TOPAZ - Teardrop / Sun Flame */}
            {color === 'topaz' && (
              <g>
                <path
                  d="M50,8 C68,30 88,54 88,72 C88,86 71,94 50,94 C29,94 12,86 12,72 C12,54 32,30 50,8 Z"
                  fill="url(#topazGlow)"
                  stroke="#fef08a"
                  strokeWidth="1.8"
                />
                {/* Inner contour */}
                <path
                  d="M50,22 C62,40 76,58 76,70 C76,80 64,84 50,84 C36,84 24,80 24,70 C24,58 38,40 50,22 Z"
                  fill="#ffffff"
                  fillOpacity="0.3"
                />
                <ellipse cx="40" cy="40" rx="6" ry="14" transform="rotate(-25 40 40)" fill="#ffffff" fillOpacity="0.65" />
              </g>
            )}

            {/* 🟣 AMETHYST - Mystic Glowing Orb / Sphere */}
            {color === 'amethyst' && (
              <g>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="url(#amethystGlow)"
                  stroke="#e879f9"
                  strokeWidth="2"
                />
                {/* Spherical Specular Highlight */}
                <ellipse cx="36" cy="32" rx="14" ry="9" transform="rotate(-30 36 32)" fill="#ffffff" fillOpacity="0.75" />
                {/* Mystic inner stars */}
                <circle cx="64" cy="62" r="3" fill="#ffffff" fillOpacity="0.5" />
                <circle cx="30" cy="65" r="2" fill="#ffffff" fillOpacity="0.4" />
                <circle cx="60" cy="35" r="2.5" fill="#ffffff" fillOpacity="0.6" />
              </g>
            )}

            {/* 🪨 OBSIDIAN / ONYX - Black Ancient Triangular Pyramid */}
            {color === 'obsidian' && (
              <g>
                <polygon
                  points="50,10 92,86 8,86"
                  fill="url(#obsidianGlow)"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />
                {/* Facets with Egyptian Golden Accents */}
                <polygon points="50,10 50,65 8,86" fill="#1e293b" fillOpacity="0.8" />
                <polygon points="50,10 50,65 92,86" fill="#0f172a" fillOpacity="0.95" />
                <polygon points="8,86 50,65 92,86" fill="#334155" fillOpacity="0.6" />
                {/* Golden hieroglyphic eye symbol in center */}
                <polygon points="50,38 58,54 42,54" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1" />
                {/* Top specular glint */}
                <circle cx="48" cy="22" r="3.5" fill="#ffffff" fillOpacity="0.9" />
              </g>
            )}
          </>
        )}

        {/* 💣 SPECIAL OVERLAY: BOMB */}
        {special === 'bomb' && (
          <g>
            <circle cx="50" cy="50" r="24" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#fbbf24"
            >
              💣
            </text>
          </g>
        )}

        {/* ↔️ SPECIAL OVERLAY: LINE HORIZONTAL */}
        {special === 'line_horizontal' && (
          <g>
            <rect x="6" y="44" width="88" height="12" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="12,50 24,40 24,60" fill="#ffffff" />
            <polygon points="88,50 76,40 76,60" fill="#ffffff" />
          </g>
        )}

        {/* ↕️ SPECIAL OVERLAY: LINE VERTICAL */}
        {special === 'line_vertical' && (
          <g>
            <rect x="44" y="6" width="12" height="88" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="50,12 40,24 60,24" fill="#ffffff" />
            <polygon points="50,88 40,76 60,76" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
