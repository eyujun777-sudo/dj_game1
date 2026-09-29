import React from 'react';

export const DesertScenery: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Blue Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#25a9e0] via-[#5ecaf0] to-[#b3e5fc]" />

      {/* Fluffy Clouds at top */}
      <div className="absolute top-2 left-6 w-32 h-10 bg-white/70 rounded-full blur-xs" />
      <div className="absolute top-6 left-16 w-24 h-8 bg-white/80 rounded-full blur-xs" />
      <div className="absolute top-4 right-8 w-40 h-12 bg-white/70 rounded-full blur-xs" />

      {/* Distant Desert Dunes & Palms */}
      <div className="absolute bottom-28 inset-x-0 h-44 bg-gradient-to-t from-[#e6c280] via-[#edd8a6] to-transparent opacity-80" />

      {/* Oasis greenery patch */}
      <div className="absolute bottom-24 left-0 w-36 h-28 bg-[#86c04f]/40 rounded-tr-full blur-md" />
      <div className="absolute bottom-24 right-0 w-44 h-32 bg-[#86c04f]/40 rounded-tl-full blur-md" />

      {/* BOTTOM SCENERY FROM SCREENSHOT: Golden Pyramid & Sphinx Statues at bottom-right */}
      <div className="absolute bottom-0 right-[-10px] w-48 h-44 z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="pyramidSun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="pyramidShadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <linearGradient id="goldThrone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>

          {/* Great Golden Pyramid */}
          <polygon points="120,20 190,140 120,150" fill="url(#pyramidShadow)" />
          <polygon points="120,20 50,140 120,150" fill="url(#pyramidSun)" />
          {/* Stepped block lines on pyramid */}
          <line x1="110" y1="40" x2="65" y2="130" stroke="#a16207" strokeWidth="1" opacity="0.4" />
          <line x1="115" y1="60" x2="80" y2="135" stroke="#a16207" strokeWidth="1" opacity="0.4" />
          <line x1="120" y1="40" x2="180" y2="130" stroke="#713f12" strokeWidth="1" opacity="0.5" />

          {/* Golden Throne / Altar in front */}
          <rect x="40" y="130" width="55" height="35" rx="3" fill="url(#goldThrone)" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="35" y="160" width="65" height="15" rx="2" fill="#ca8a04" />
          <polygon points="40,130 50,110 65,110 65,130" fill="#fde047" stroke="#a16207" strokeWidth="1" />

          {/* Mini Sphinx Statue on Pedestal */}
          <rect x="15" y="145" width="28" height="25" fill="#eab308" stroke="#a16207" strokeWidth="1" />
          {/* Sphinx head & body */}
          <ellipse cx="28" cy="140" rx="10" ry="7" fill="#fde047" stroke="#a16207" strokeWidth="1" />
          <circle cx="34" cy="133" r="5" fill="#fde047" stroke="#a16207" strokeWidth="1" />

          {/* Second Mini Sphinx on right */}
          <rect x="100" y="145" width="28" height="25" fill="#ca8a04" stroke="#713f12" strokeWidth="1" />
          <ellipse cx="114" cy="140" rx="10" ry="7" fill="#eab308" stroke="#713f12" strokeWidth="1" />
          <circle cx="120" cy="133" r="5" fill="#eab308" stroke="#713f12" strokeWidth="1" />
        </svg>
      </div>

      {/* BOTTOM LEFT: Red Curved Badge from Screenshot */}
      <div className="absolute bottom-0 left-0 z-10">
        <div className="relative bg-gradient-to-tr from-[#dc2626] to-[#ef4444] rounded-tr-[45px] pt-3 pb-3 pl-4 pr-7 border-t-2 border-r-2 border-red-300 shadow-[0_-4px_16px_rgba(220,38,38,0.4)]">
          <div className="text-white font-black text-xs sm:text-sm tracking-tight drop-shadow-sm leading-tight">
            <div>재밌는게임</div>
            <div className="text-yellow-200">오프라인 지원</div>
          </div>
        </div>
      </div>
    </div>
  );
};
