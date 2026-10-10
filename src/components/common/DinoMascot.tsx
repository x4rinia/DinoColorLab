import React, { useState } from 'react';

interface DinoMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expression?: 'happy' | 'thinking' | 'excited' | 'warning';
  speechBubble?: string;
  className?: string;
}

export const DinoMascot: React.FC<DinoMascotProps> = ({
  size = 'md',
  expression: _expression = 'happy',
  speechBubble,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-36 h-36 sm:w-44 sm:h-44'
  };

  const mascotSrc = `${import.meta.env.BASE_URL}ankylo-mascot.webp`;

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Speech Bubble */}
      {speechBubble && (
        <div className="relative bg-slate-800 text-cyan-200 border border-cyan-500/30 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-2xl shadow-lg max-w-xs animate-fade-in">
          <span>{speechBubble}</span>
          {/* Pfeil der Sprechblase zeigt nach rechts zum Dino */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 border-t border-r border-cyan-500/30 rotate-45" />
        </div>
      )}

      {/* Cute Ankylosaurus Mascot mit Färbepinsel & Farbschale */}
      <div
        className={`${sizeMap[size]} flex-shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-md select-none`}
      >
        {!imageError ? (
          <img
            src={mascotSrc}
            alt="Dino Color Lab Ankylo mit Pinsel und Farbschale"
            className="w-full h-full object-contain pointer-events-none drop-shadow-lg"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="60" cy="110" rx="40" ry="8" fill="#0f172a" fillOpacity="0.3" />
            {/* Tail Club */}
            <path d="M 25 80 Q 15 85 10 95 Q 18 100 28 92 Z" fill="#0d9488" />
            <circle cx="10" cy="95" r="7" fill="#0f766e" />
            {/* Body */}
            <path d="M 30 75 Q 30 45 65 45 Q 95 45 95 75 Q 95 95 65 95 Q 35 95 30 75 Z" fill="#14b8a6" />
            {/* Spikes */}
            <path d="M 40 50 L 45 42 L 50 50 Z" fill="#2dd4bf" />
            <path d="M 55 46 L 60 38 L 65 46 Z" fill="#2dd4bf" />
            <path d="M 70 48 L 75 40 L 80 48 Z" fill="#2dd4bf" />
            {/* Head */}
            <path d="M 70 65 Q 70 35 95 40 Q 110 50 105 75 Q 90 82 70 65 Z" fill="#14b8a6" />
            <circle cx="92" cy="65" r="4" fill="#f43f5e" fillOpacity="0.5" />
            <circle cx="86" cy="52" r="5" fill="#0f172a" />
            <circle cx="88" cy="50" r="1.8" fill="#ffffff" />
            <path d="M 94 62 Q 98 66 102 61" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>
    </div>
  );
};
