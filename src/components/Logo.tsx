import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10 shrink-0">
        {/* The "Squircle" Red Background */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xl"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(229, 9, 20, 0.3))' }}
        >
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="30"
            className="fill-[#f83f3f]"
          />
          {/* Stylized "F" */}
          <path
            d="M38 22 H74 V34 H50 V46 H68 V58 H50 V78 H38 Z"
            fill="white"
          />
          {/* The triangle/play element integrated on the left */}
          <path
            d="M26 44 L38 56 L38 32 Z"
            fill="white"
          />
        </svg>
      </div>
      {showText && (
        <span className="text-2xl font-black tracking-tighter text-white italic">
          FLICK
        </span>
      )}
    </div>
  );
};
