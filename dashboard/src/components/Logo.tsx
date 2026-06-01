import React from 'react';

type Tone = 'brand' | 'muted' | 'mono';

interface LogoProps {
  /** Height of the logomark in px. Wordmark scales relative to it. */
  size?: number;
  /** Render the "IDP Core" wordmark next to the mark. */
  withWordmark?: boolean;
  /** brand = indigo, muted = low-emphasis gray, mono = inherits currentColor. */
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IDP Core logomark — a concentric "core / radar" aperture.
 * Pure SVG so it scales crisply and adapts to light/dark via tokens
 * (replaces the legacy raster logo.png that had a baked-in dark background).
 */
const Logo: React.FC<LogoProps> = ({
  size = 32,
  withWordmark = false,
  tone = 'brand',
  className,
  style,
}) => {
  const markColor =
    tone === 'brand' ? 'hsl(var(--ch-plasma))'
    : tone === 'muted' ? 'hsl(var(--ch-t2))'
    : 'currentColor';

  const wordPrimary = tone === 'muted' ? 'hsl(var(--ch-t2))' : 'hsl(var(--ch-t0))';
  const wordAccent  = tone === 'mono' ? 'currentColor' : markColor;

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34, ...style }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label="IDP Core"
        style={{ flexShrink: 0, color: markColor }}
      >
        {/* outer ring */}
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" opacity="0.22" />
        {/* mid sweep — open arc evokes a scanning aperture */}
        <path
          d="M16 5.5 a10.5 10.5 0 1 1 -7.4 3.07"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* core */}
        <circle cx="16" cy="16" r="4.2" fill="currentColor" />
      </svg>

      {withWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: size * 0.62,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: wordPrimary }}>IDP</span>
          <span style={{ color: wordAccent }}> Core</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
