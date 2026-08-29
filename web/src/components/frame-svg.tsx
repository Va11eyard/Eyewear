type FrameLook = {
  shape: string;
  color: string;
  material?: string;
};

export function FrameSvg({ shape, color, material = "acetate" }: FrameLook) {
  const fill = hexFor(color);
  const rim = material === "metal" ? 4.2 : 9;
  return (
    <svg viewBox="0 0 560 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lensShine" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#1a1714" stopOpacity="0.12" />
        </linearGradient>
        <filter id="rimShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#rimShadow)" fill="none" stroke={fill} strokeWidth={rim} strokeLinejoin="round">
        {lensPath(shape, 158)}
        {lensPath(shape, 402)}
      </g>
      <g fill="url(#lensShine)" stroke="none" opacity="0.92">
        {lensPath(shape, 158)}
        {lensPath(shape, 402)}
      </g>
      <path d="M226 92 Q280 72 334 92" fill="none" stroke={fill} strokeWidth={rim * 0.72} strokeLinecap="round" />
      <ellipse cx="226" cy="96" rx="5" ry="4" fill={fill} opacity="0.85" />
      <ellipse cx="334" cy="96" rx="5" ry="4" fill={fill} opacity="0.85" />
      <path d="M82 94 L14 78 L8 86 L78 108 Z" fill={fill} opacity="0.92" />
      <path d="M478 94 L546 78 L552 86 L482 108 Z" fill={fill} opacity="0.92" />
    </svg>
  );
}

function hexFor(color: string): string {
  const map: Record<string, string> = {
    black: "#161310",
    gold: "#c4a574",
    grey: "#5c5956",
    tortoise: "#6b3f24",
    horn: "#4a3428",
    silver: "#c5c1ba",
  };
  return map[color] ?? "#161310";
}

function lensPath(shape: string, cx: number) {
  if (shape === "round") {
    return <ellipse key={cx} cx={cx} cy="100" rx="70" ry="66" />;
  }
  if (shape === "oval") {
    return <ellipse key={cx} cx={cx} cy="100" rx="84" ry="52" />;
  }
  if (shape === "square") {
    return <rect key={cx} x={cx - 72} y="48" width="144" height="104" rx="16" />;
  }
  if (shape === "cat") {
    return (
      <path
        key={cx}
        d={`M${cx - 82} 118 Q${cx - 88} 52 ${cx - 8} 46 Q${cx + 72} 50 ${cx + 84} 116 Q${cx + 20} 148 ${cx - 82} 118 Z`}
      />
    );
  }
  return <rect key={cx} x={cx - 86} y="58" width="172" height="82" rx="10" />;
}
