import React from 'react';

// Festive Diwali Light Bulbs Border Component (Blinks Slowly Across Borders)
export function DiwaliBulbBorder({ children, variant = 'banner', className = '' }) {
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
      {/* 1. TOP BORDER LIGHT BULBS (Slow blinking) */}
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

      {/* 2. BOTTOM BORDER LIGHT BULBS (Slow blinking) */}
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

      {/* 3. LEFT BORDER LIGHT BULBS (Slow blinking) */}
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

      {/* 4. RIGHT BORDER LIGHT BULBS (Slow blinking) */}
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
