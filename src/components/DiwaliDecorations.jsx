import React from 'react';

// Festive Indian Diya (Traditional Earthen Clay Lamp with Flickering Golden Flame)
export function DiwaliDiya({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={`${className} shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Diwali Diya Lamp"
    >
      {/* Earthen Clay Diya Base */}
      <path
        d="M6 18C6 24 11 27 16 27C21 27 26 24 26 18C26 16.5 24 16 16 16C8 16 6 16.5 6 18Z"
        fill="url(#diyaClayGrad)"
        stroke="#ffd166"
        strokeWidth="0.8"
      />
      {/* Diya Rim & Oil Pool */}
      <ellipse cx="16" cy="17" rx="10" ry="2.5" fill="#f77f00" stroke="#ffb703" strokeWidth="0.6" />
      <ellipse cx="16" cy="17" rx="6" ry="1.4" fill="#c1121f" />

      {/* Animated Flickering Flame */}
      <g className="diwali-flame">
        {/* Outer Warm Flame */}
        <path
          d="M16 4C14 8 11.5 11 11.5 13.5C11.5 16 13.5 17 16 17C18.5 17 20.5 16 20.5 13.5C20.5 11 18 8 16 4Z"
          fill="url(#outerFlameGrad)"
        />
        {/* Inner Luminous Flame Core */}
        <path
          d="M16 8C14.8 10.5 13.5 12 13.5 13.8C13.5 15.5 14.6 16.5 16 16.5C17.4 16.5 18.5 15.5 18.5 13.8C18.5 12 17.2 10.5 16 8Z"
          fill="url(#innerFlameGrad)"
        />
      </g>

      <defs>
        <linearGradient id="diyaClayGrad" x1="6" y1="16" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b45309" />
          <stop offset="0.5" stopColor="#d97706" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id="outerFlameGrad" cx="16" cy="13" r="5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffea00" />
          <stop offset="0.55" stopColor="#ff7b00" />
          <stop offset="1" stopColor="#ff0054" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="innerFlameGrad" x1="16" y1="8" x2="16" y2="16.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#ffd166" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Festive Diwali Light Bulbs Border Component (Blinks Slowly Across Borders)
export function DiwaliBulbBorder({ children, variant = 'header', className = '' }) {
  // Traditional vibrant Diwali festive fairy light colors
  const bulbColors = [
    '#ffb703', // Warm Golden Amber
    '#ef233c', // Festive Vermilion Red
    '#10b981', // Emerald Green
    '#f77f00', // Saffron Deep Orange
    '#e040fb', // Radiant Magenta
    '#00e5ff', // Cyan Star
    '#ffd166', // Golden Glow
    '#ff4d6d', // Ruby Pink
  ];

  const isBanner = variant === 'banner';
  const topCount = isBanner ? 11 : 7;
  const bottomCount = isBanner ? 11 : 7;
  const sideCount = isBanner ? 4 : 2;

  const bulbSizeClass = isBanner
    ? 'w-2.5 h-2.5 sm:w-3 sm:h-3'
    : 'w-2 h-2 sm:w-2.5 sm:h-2.5';

  return (
    <div
      className={`relative rounded-2xl border transition-all ${
        isBanner
          ? 'bg-gradient-to-r from-amber-950/30 via-red-950/20 to-black/50 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          : 'bg-black/40 hover:bg-black/60 border-amber-500/35 hover:border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.18)]'
      } ${className}`}
    >
      {/* 1. TOP BORDER LIGHT BULBS */}
      <div className="absolute -top-1 sm:-top-1.5 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
        {Array.from({ length: topCount }).map((_, idx) => {
          const color = bulbColors[idx % bulbColors.length];
          const blinkClass = idx % 2 === 0 ? 'diwali-bulb-a' : 'diwali-bulb-b';
          return (
            <span
              key={`top-${idx}`}
              className={`diwali-bulb ${bulbSizeClass} ${blinkClass}`}
              style={{ backgroundColor: color, color: color }}
              title="Diwali Light"
            />
          );
        })}
      </div>

      {/* 2. BOTTOM BORDER LIGHT BULBS */}
      <div className="absolute -bottom-1 sm:-bottom-1.5 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
        {Array.from({ length: bottomCount }).map((_, idx) => {
          const color = bulbColors[(idx + 3) % bulbColors.length];
          const blinkClass = idx % 2 === 0 ? 'diwali-bulb-b' : 'diwali-bulb-a';
          return (
            <span
              key={`bottom-${idx}`}
              className={`diwali-bulb ${bulbSizeClass} ${blinkClass}`}
              style={{ backgroundColor: color, color: color }}
              title="Diwali Light"
            />
          );
        })}
      </div>

      {/* 3. LEFT BORDER LIGHT BULBS */}
      <div className="absolute top-2.5 bottom-2.5 -left-1 sm:-left-1.5 flex flex-col justify-between items-center pointer-events-none z-10">
        {Array.from({ length: sideCount }).map((_, idx) => {
          const color = bulbColors[(idx + 1) % bulbColors.length];
          const blinkClass = idx % 2 === 0 ? 'diwali-bulb-c' : 'diwali-bulb-a';
          return (
            <span
              key={`left-${idx}`}
              className={`diwali-bulb ${bulbSizeClass} ${blinkClass}`}
              style={{ backgroundColor: color, color: color }}
              title="Diwali Light"
            />
          );
        })}
      </div>

      {/* 4. RIGHT BORDER LIGHT BULBS */}
      <div className="absolute top-2.5 bottom-2.5 -right-1 sm:-right-1.5 flex flex-col justify-between items-center pointer-events-none z-10">
        {Array.from({ length: sideCount }).map((_, idx) => {
          const color = bulbColors[(idx + 4) % bulbColors.length];
          const blinkClass = idx % 2 === 0 ? 'diwali-bulb-a' : 'diwali-bulb-c';
          return (
            <span
              key={`right-${idx}`}
              className={`diwali-bulb ${bulbSizeClass} ${blinkClass}`}
              style={{ backgroundColor: color, color: color }}
              title="Diwali Light"
            />
          );
        })}
      </div>

      {/* Content Wrapped Inside Border */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
