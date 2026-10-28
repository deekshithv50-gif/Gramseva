import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const KarnatakaEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Authentic Karnataka Government Official Seal Crest */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
        aria-label="Government of Karnataka Emblem"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring with Traditional Karnataka Gold Bead Border */}
        <circle cx="60" cy="60" r="56" fill="#FFFBEB" stroke="url(#goldGrad)" strokeWidth="4" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Ashoka Lion Capital (Top Crest) */}
        <g transform="translate(48, 12) scale(0.4)">
          {/* Central Lion Head */}
          <path
            d="M30 5 C30 0, 10 0, 10 5 C10 10, 14 15, 20 18 C26 15, 30 10, 30 5 Z"
            fill="url(#goldGrad)"
          />
          {/* Left Lion */}
          <path
            d="M10 8 C6 4, -2 8, 2 16 C6 18, 12 16, 12 12 Z"
            fill="url(#goldGrad)"
          />
          {/* Right Lion */}
          <path
            d="M30 8 C34 4, 42 8, 38 16 C34 18, 28 16, 28 12 Z"
            fill="url(#goldGrad)"
          />
          {/* Base Platform / Abacus */}
          <rect x="-2" y="18" width="44" height="6" rx="2" fill="#B45309" />
          {/* Ashoka Chakra */}
          <circle cx="20" cy="21" r="2.5" fill="#1E3A8A" />
        </g>

        {/* Main Central Royal Shield (Red & Gold) */}
        <path
          d="M32 36 C32 36, 60 32, 88 36 C88 56, 84 80, 60 92 C36 80, 32 56, 32 36 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="3"
        />

        {/* Gandabherunda (ಗಂಡಭೇರುಂಡ - The Mythological Two-Headed Bird of Karnataka) */}
        <g id="Gandabherunda" transform="translate(60, 62) scale(0.65)">
          {/* Crown on Central Crest */}
          <path d="M-6 -26 L0 -34 L6 -26 L3 -22 L-3 -22 Z" fill="#FDE68A" />

          {/* Left Head & Beak */}
          <path
            d="M-4 -20 C-9 -24, -18 -22, -22 -16 C-24 -14, -25 -10, -22 -8 C-18 -6, -14 -12, -8 -13 C-6 -10, -4 -8, -4 -4 Z"
            fill="#FEF08A"
          />
          <circle cx="-16" cy="-14" r="1.5" fill="#1E293B" />

          {/* Right Head & Beak */}
          <path
            d="M4 -20 C9 -24, 18 -22, 22 -16 C24 -14, 25 -10, 22 -8 C18 -6, 14 -12, 8 -13 C6 -10, 4 -8, 4 -4 Z"
            fill="#FEF08A"
          />
          <circle cx="16" cy="-14" r="1.5" fill="#1E293B" />

          {/* Powerful Majestic Wings (Left) */}
          <path
            d="M-10 -4 C-24 -12, -38 0, -32 20 C-26 15, -22 18, -18 24 C-16 16, -12 12, -6 10 Z"
            fill="#FDE047"
            stroke="#B45309"
            strokeWidth="1"
          />
          {/* Powerful Majestic Wings (Right) */}
          <path
            d="M10 -4 C24 -12, 38 0, 32 20 C26 15, 22 18, 18 24 C16 16, 12 12, 6 10 Z"
            fill="#FDE047"
            stroke="#B45309"
            strokeWidth="1"
          />

          {/* Broad Muscular Chest & Feathers */}
          <path
            d="M-10 -4 C-10 14, 10 14, 10 -4 C6 2, -6 2, -10 -4 Z"
            fill="#FEF9C3"
          />

          {/* Majestic Tail Feathers */}
          <path
            d="M-12 12 C-14 26, -4 34, 0 38 C4 34, 14 26, 12 12 C6 18, -6 18, -12 12 Z"
            fill="#FACC15"
          />

          {/* Talons grasping ornamental motifs */}
          <path d="M-14 22 L-18 28 L-12 28 Z" fill="#D97706" />
          <path d="M14 22 L18 28 L12 28 Z" fill="#D97706" />
        </g>

        {/* Traditional Flanking Sharabhas / Lions Supporters */}
        {/* Left Supporter */}
        <path
          d="M18 52 C22 46, 28 48, 30 56 C26 68, 20 80, 26 94 C20 92, 16 78, 18 52 Z"
          fill="url(#goldGrad)"
          opacity="0.9"
        />
        {/* Right Supporter */}
        <path
          d="M102 52 C98 46, 92 48, 90 56 C94 68, 100 80, 94 94 C100 92, 104 78, 102 52 Z"
          fill="url(#goldGrad)"
          opacity="0.9"
        />

        {/* Base Banner: Satyameva Jayate / Karnataka Ribbon */}
        <path
          d="M24 96 C40 92, 80 92, 96 96 C88 104, 32 104, 24 96 Z"
          fill="url(#maroonGrad)"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        <text
          x="60"
          y="100"
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          fill="#FEF3C7"
          fontFamily="serif"
          letterSpacing="1"
        >
          ಸತ್ಯಮೇವ ಜಯತೇ
        </text>

        {/* Kannada Script Arc: ಕರ್ನಾಟಕ ಸರ್ಕಾರ (Government of Karnataka) */}
        <text
          x="60"
          y="114"
          textAnchor="middle"
          fontSize="5.8"
          fontWeight="bold"
          fill="#78350F"
          fontFamily="sans-serif"
        >
          ಕರ್ನಾಟಕ ಸರ್ಕಾರ
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-900 tracking-wide font-kannada">
            ಕರ್ನಾಟಕ ಸರ್ಕಾರ
          </span>
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-tight">
            Government of Karnataka
          </span>
          <span className="text-[10px] text-emerald-800 font-medium">
            Rural Development & Panchayat Raj Dept (RDPR)
          </span>
        </div>
      )}
    </div>
  );
};
