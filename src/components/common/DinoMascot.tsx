import React from 'react';

interface DinoMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expression?: 'happy' | 'thinking' | 'excited' | 'warning';
  speechBubble?: string;
  className?: string;
}

export const DinoMascot: React.FC<DinoMascotProps> = ({
  size = 'md',
  expression = 'happy',
  speechBubble,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36'
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Speech Bubble */}
      {speechBubble && (
        <div className="relative bg-slate-800 text-cyan-200 border border-cyan-500/30 text-xs sm:text-sm font-medium px-3 py-2 rounded-2xl shadow-lg max-w-xs animate-fade-in">
          <span>{speechBubble}</span>
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-800 border-b border-r border-cyan-500/30 rotate-45" />
        </div>
      )}

      {/* SVG Baby Ankylosaurus Mascot */}
      <div className={`${sizeMap[size]} flex-shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-md`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Shadows */}
          <ellipse cx="60" cy="110" rx="40" ry="8" fill="#0f172a" fillOpacity="0.3" />

          {/* Tail Club */}
          <path d="M 25 80 Q 15 85 10 95 Q 18 100 28 92 Z" fill="#0d9488" />
          <circle cx="10" cy="95" r="7" fill="#0f766e" />
          <circle cx="8" cy="93" r="2" fill="#2dd4bf" />

          {/* Main Body (Turquoise Ankylosaurus) */}
          <path
            d="M 30 75 Q 30 45 65 45 Q 95 45 95 75 Q 95 95 65 95 Q 35 95 30 75 Z"
            fill="#14b8a6"
          />

          {/* Armor Shell Spikes / Scutes (Ankylosaurus characteristic) */}
          <path d="M 40 50 L 45 42 L 50 50 Z" fill="#2dd4bf" />
          <path d="M 55 46 L 60 38 L 65 46 Z" fill="#2dd4bf" />
          <path d="M 70 48 L 75 40 L 80 48 Z" fill="#2dd4bf" />

          <circle cx="45" cy="58" r="4" fill="#0d9488" />
          <circle cx="60" cy="55" r="4.5" fill="#0d9488" />
          <circle cx="75" cy="58" r="4" fill="#0d9488" />

          {/* Cute Belly */}
          <path
            d="M 45 75 Q 65 90 85 75 Q 75 92 55 92 Z"
            fill="#99f6e4"
          />

          {/* Head */}
          <path
            d="M 70 65 Q 70 35 95 40 Q 110 50 105 75 Q 90 82 70 65 Z"
            fill="#14b8a6"
          />

          {/* Cheeks */}
          <circle cx="92" cy="65" r="4" fill="#f43f5e" fillOpacity="0.5" />

          {/* Eyes according to expression */}
          {expression === 'happy' && (
            <g>
              <circle cx="86" cy="52" r="5" fill="#0f172a" />
              <circle cx="88" cy="50" r="1.8" fill="#ffffff" />
            </g>
          )}
          {expression === 'excited' && (
            <g>
              <path d="M 82 50 Q 86 44 90 50" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
          {expression === 'thinking' && (
            <g>
              <circle cx="86" cy="50" r="4" fill="#0f172a" />
              <path d="M 82 44 L 90 46" stroke="#0f172a" strokeWidth="2" />
            </g>
          )}
          {expression === 'warning' && (
            <g>
              <circle cx="86" cy="52" r="4" fill="#0f172a" />
              <path d="M 82 45 L 90 47" stroke="#dc2626" strokeWidth="2" />
            </g>
          )}

          {/* Cute Smile */}
          <path d="M 94 62 Q 98 66 102 61" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Scientist Safety Goggles! */}
          <g>
            <rect x="76" y="44" width="22" height="14" rx="7" fill="#38bdf8" fillOpacity="0.4" stroke="#0284c7" strokeWidth="2" />
            <line x1="70" y1="50" x2="76" y2="50" stroke="#0284c7" strokeWidth="2" />
            <line x1="98" y1="50" x2="104" y2="50" stroke="#0284c7" strokeWidth="2" />
            {/* Goggle Highlight */}
            <path d="M 80 46 L 85 46" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Mini Lab Beaker held by Dino's cute front paw */}
          <g transform="translate(90, 70)">
            <path d="M 5 0 L 15 0 L 17 18 C 17 22 13 24 10 24 C 7 24 3 22 3 18 Z" fill="#ffffff" fillOpacity="0.8" stroke="#334155" strokeWidth="1.5" />
            {/* Beaker colorful potion */}
            <path d="M 4 10 Q 10 12 16 10 L 16 18 C 16 21 13 23 10 23 C 7 23 4 21 4 18 Z" fill="#ec4899" />
            {/* Bubble */}
            <circle cx="10" cy="5" r="1.5" fill="#38bdf8" />
          </g>

          {/* Little feet */}
          <ellipse cx="50" cy="95" rx="6" ry="4" fill="#0f766e" />
          <ellipse cx="75" cy="95" rx="6" ry="4" fill="#0f766e" />
        </svg>
      </div>
    </div>
  );
};
