import React, { useId } from "react";
import { SYMBOL_H, SYMBOL_PATHS, SYMBOL_W } from "./brandPath";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, clamp } from "./ui";

export const SYMBOL_D = SYMBOL_PATHS.join(" ");
// Most interior point of the symbol's centre crossing (in SYMBOL_W x SYMBOL_H units); the logo zoom flies through here.
export const SYMBOL_ANCHOR = { x: 560, y: 533 };
export const symbolHeight = (width: number) => (width * SYMBOL_H) / SYMBOL_W;

// Supplied lockup proportions, in multiples of the wordmark height.
const WORD_RATIO = 1323 / 213;
const SYMBOL_RATIO = 2.13;
const GAP_RATIO = 0.48;

const safeId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "");

/**
 * The Adele Care symbol as a vector. `draw` traces the outline, `fill` sweeps the gradient in
 * from the bottom-left (the way the brand gradient runs), and `sheen` passes a highlight across it.
 */
export const SymbolMark: React.FC<{
  width: number;
  draw?: number;
  fill?: number;
  sheen?: number;
  tone?: "brand" | "white";
  glow?: number;
  style?: React.CSSProperties;
}> = ({ width, draw = 1, fill = 1, sheen = -1, tone = "brand", glow = 0, style }) => {
  const id = safeId(useId());
  const paint = tone === "white" ? "#fff" : `url(#g${id})`;
  const front = fill * 1.4 - 0.2;
  const a = Math.min(1, Math.max(0, front - 0.2));
  const b = Math.min(1, Math.max(a + 0.0001, front));
  return (
    <svg
      width={width}
      height={symbolHeight(width)}
      viewBox={`0 0 ${SYMBOL_W} ${SYMBOL_H}`}
      style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${glow * 28}px ${C.sky}aa)` : undefined, ...style }}
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#12304F" />
          <stop offset="0.55" stopColor="#2A6AA3" />
          <stop offset="1" stopColor="#4A9AD0" />
        </linearGradient>
        <linearGradient id={`m${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset={a} stopColor="#fff" />
          <stop offset={b} stopColor="#000" />
        </linearGradient>
        <mask id={`k${id}`}>
          <rect width={SYMBOL_W} height={SYMBOL_H} fill={`url(#m${id})`} />
        </mask>
        <clipPath id={`c${id}`}>
          <path d={SYMBOL_D} />
        </clipPath>
        <linearGradient id={`s${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill > 0 && <path d={SYMBOL_D} fill={paint} mask={fill < 1 ? `url(#k${id})` : undefined} />}
      {draw > 0 && fill < 1 && (
        <path
          d={SYMBOL_D}
          fill="none"
          stroke={paint}
          strokeWidth={12}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
          strokeLinecap="round"
          opacity={1 - fill}
        />
      )}
      {sheen > 0 && sheen < 1 && (
        <g clipPath={`url(#c${id})`}>
          <rect
            x={-600 + sheen * (SYMBOL_W + 1200)}
            y={-400}
            width={380}
            height={SYMBOL_H + 800}
            fill={`url(#s${id})`}
            transform={`rotate(20 ${SYMBOL_W / 2} ${SYMBOL_H / 2})`}
          />
        </g>
      )}
    </svg>
  );
};

export const Wordmark: React.FC<{ height: number; dark?: boolean; style?: React.CSSProperties }> = ({ height, dark, style }) => (
  <Img
    src={staticFile(dark ? "brand/wordmark-dark.png" : "brand/wordmark.png")}
    style={{ height, width: height * WORD_RATIO, display: "block", ...style }}
  />
);

/** Soft left-to-right wipe used to reveal the wordmark. */
export const wipe = (p: number): React.CSSProperties => {
  const m = `linear-gradient(90deg, #000 ${p * 130 - 30}%, transparent ${p * 130}%)`;
  return { WebkitMaskImage: m, maskImage: m };
};

export const Lockup: React.FC<{ height: number; dark?: boolean }> = ({ height, dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * GAP_RATIO }}>
    <SymbolMark width={height * SYMBOL_RATIO} tone={dark ? "white" : "brand"} />
    <Wordmark height={height} dark={dark} />
  </div>
);

/** The lockup building itself: outline draws, gradient fills, wordmark wipes out of the symbol, sheen. */
export const LogoReveal: React.FC<{ at: number; height: number }> = ({ at, height }) => {
  const f = useCurrentFrame() - at;
  const draw = interpolate(f, [0, 34], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fill = interpolate(f, [20, 46], [0, 1], clamp);
  const word = interpolate(f, [30, 60], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sheen = interpolate(f, [58, 86], [0, 1], clamp);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: height * GAP_RATIO }}>
      <SymbolMark width={height * SYMBOL_RATIO} draw={draw} fill={fill} sheen={sheen} glow={0.7 * (1 - fill)} />
      <div style={{ ...wipe(word), transform: `translateX(${(1 - word) * -50}px)`, filter: `blur(${(1 - word) * 8}px)` }}>
        <Wordmark height={height} />
      </div>
    </div>
  );
};
