import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { OVERLAP } from "./timeline";

export const C = {
  ink: "#0E0E14",
  grey: "#C9C9D2",
  mute: "#7B7B88",
  bg: "#FBFBFD",
  pink: "#FF3D9A",
  orange: "#FF8A3D",
  blue: "#4F6BFF",
  violet: "#9B5CFF",
};
export const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
export const GRAD = `linear-gradient(100deg, ${C.orange}, ${C.pink} 45%, ${C.violet} 75%, ${C.blue})`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Soft blur/scale crossfade in and out of every scene. */
export const SceneShell: React.FC<{ dur: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({
  dur,
  first,
  last,
  children,
}) => {
  const f = useCurrentFrame();
  const inP = first ? 1 : interpolate(f, [0, OVERLAP], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = last ? 0 : interpolate(f, [dur - OVERLAP, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        filter: `blur(${(1 - inP) * 14 + outP * 14}px)`,
        transform: `scale(${1.04 - 0.04 * inP - 0.03 * outP})`,
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Animated gradient cloud, the reference film's signature glow. */
export const Blob: React.FC<{ x?: number; y?: number; size?: number; intensity?: number; spin?: number }> = ({
  x = 960,
  y = 540,
  size = 900,
  intensity = 1,
  spin = 1,
}) => {
  const f = useCurrentFrame();
  const t = (f / 30) * spin;
  const parts = [
    { c: C.pink, dx: Math.sin(t * 0.7) * 120, dy: Math.cos(t * 0.5) * 60, s: 1 },
    { c: C.orange, dx: Math.cos(t * 0.6 + 1) * 160, dy: Math.sin(t * 0.8) * 90 - 60, s: 0.8 },
    { c: C.blue, dx: Math.sin(t * 0.5 + 2) * 200 + 120, dy: Math.cos(t * 0.6 + 2) * 80 + 40, s: 0.75 },
    { c: C.violet, dx: Math.cos(t * 0.9 + 3) * 140 - 140, dy: Math.sin(t * 0.4 + 1) * 100 + 60, s: 0.6 },
  ];
  return (
    <AbsoluteFill style={{ opacity: intensity, pointerEvents: "none" }}>
      {parts.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x + p.dx - (size * p.s) / 2,
            top: y + p.dy - (size * p.s * 0.7) / 2,
            width: size * p.s,
            height: size * p.s * 0.7,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${p.c}, ${p.c}00)`,
            filter: "blur(40px)",
            mixBlendMode: "multiply",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Words rise in one by one, out of a blur. */
export const Words: React.FC<{
  text: string;
  at?: number;
  every?: number;
  size?: number;
  weight?: number;
  gradientWords?: string[];
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, at = 0, every = 4, size = 120, weight = 700, gradientWords = [], color = C.ink, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.26}px`, ...style }}>
      {text.split(" ").map((w, i) => {
        const p = spring({ frame: f - at - i * every, fps, config: { damping: 18, stiffness: 120 } });
        const grad = gradientWords.includes(w.replace(/[.,]/g, ""));
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              fontWeight: weight,
              letterSpacing: -size * 0.035,
              lineHeight: 1.08,
              display: "inline-block",
              opacity: p,
              filter: `blur(${(1 - p) * 16}px)`,
              transform: `translateY(${(1 - p) * size * 0.5}px)`,
              color,
              ...(grad ? { backgroundImage: GRAD, WebkitBackgroundClip: "text", color: "transparent", padding: "0 8px 6px", margin: "0 -8px" } : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Fade-and-lift in for any element. */
export const useIn = (at: number, damping = 16) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness: 110 } });
};

export const Rise: React.FC<{ at: number; dist?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  dist = 40,
  style,
  children,
}) => {
  const p = useIn(at);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px) scale(${0.96 + 0.04 * p})`, filter: `blur(${(1 - p) * 8}px)`, ...style }}>
      {children}
    </div>
  );
};

export const Dot: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 22, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: GRAD, boxShadow: `0 0 ${size}px ${C.pink}66`, ...style }} />
);

/**
 * Vertical list where one row is active (black, with a gradient dot) and the rest are pale grey.
 * `active` is a fractional index so the list glides between rows.
 */
export const RollList: React.FC<{ items: string[]; active: number; size?: number; rowH?: number; align?: "left" | "center" }> = ({
  items,
  active,
  size = 76,
  rowH = 96,
  align = "left",
}) => (
  <div style={{ position: "relative", height: rowH * 5, width: "100%", overflow: "hidden", maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)" }}>
    {items.map((it, i) => {
      const d = i - active;
      const on = Math.max(0, 1 - Math.abs(d));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: rowH * 2 + d * rowH,
            left: 0,
            right: 0,
            height: rowH,
            display: "flex",
            alignItems: "center",
            justifyContent: align === "center" ? "center" : "flex-start",
            gap: 22,
            fontSize: size,
            fontWeight: 600,
            letterSpacing: -size * 0.03,
            whiteSpace: "nowrap",
            color: on > 0.5 ? C.ink : C.grey,
            opacity: 1 - Math.min(1, Math.abs(d) * 0.28),
            transform: `translateX(${on * (align === "left" ? 10 : 0)}px)`,
          }}
        >
          <Dot size={size * 0.3} style={{ opacity: on, transform: `scale(${on})`, marginLeft: align === "left" ? -size * 0.42 : 0 }} />
          <span style={{ marginLeft: align === "left" ? -size * 0.02 : 0 }}>{it}</span>
        </div>
      );
    })}
  </div>
);

/** Steps through a list: holds on each index, glides between them. */
export const stepper = (f: number, starts: number[], glide = 10) => {
  let v = 0;
  starts.forEach((s, i) => {
    if (i === 0) return;
    v += interpolate(f, [s, s + glide], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  });
  return v;
};

/** White card with a gradient glow behind it. */
export const GlowCard: React.FC<{ w: number; h: number; glow?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  w,
  h,
  glow = 1,
  style,
  children,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: w, height: h, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: 80,
          background: `conic-gradient(from ${f * 1.2}deg, ${C.pink}, ${C.orange}, ${C.violet}, ${C.blue}, ${C.pink})`,
          filter: "blur(50px)",
          opacity: 0.75 * glow,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 40,
          background: "#fff",
          boxShadow: "0 30px 80px rgba(20,10,40,0.18)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 26px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.85)",
      boxShadow: "0 10px 30px rgba(20,10,40,0.12)",
      fontSize: 30,
      fontWeight: 600,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Bubble: React.FC<{ from: "patient" | "adele"; at: number; children: React.ReactNode; size?: number }> = ({
  from,
  at,
  children,
  size = 30,
}) => {
  const p = useIn(at, 14);
  const me = from === "adele";
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        alignSelf: me ? "flex-start" : "flex-end",
        maxWidth: "80%",
        padding: "18px 24px",
        borderRadius: 28,
        borderBottomLeftRadius: me ? 8 : 28,
        borderBottomRightRadius: me ? 28 : 8,
        background: me ? "#F2F1F6" : GRAD,
        color: me ? C.ink : "#fff",
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1.3,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`,
        transformOrigin: me ? "left bottom" : "right bottom",
      }}
    >
      {children}
    </div>
  );
};

export const Typing: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ alignSelf: "flex-start", display: "flex", gap: 8, padding: "20px 24px", borderRadius: 28, background: "#F2F1F6" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: C.mute, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i)) }} />
      ))}
    </div>
  );
};

export const Logo: React.FC<{ size?: number; color?: string }> = ({ size = 160, color = C.ink }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.14 }}>
    <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.orange} />
          <stop offset="0.5" stopColor={C.pink} />
          <stop offset="1" stopColor={C.blue} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#lg)" />
      <path d="M30 52 Q50 74 70 52" stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="38" r="6" fill="#fff" />
      <circle cx="64" cy="38" r="6" fill="#fff" />
    </svg>
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: -size * 0.05, color, lineHeight: 1 }}>adele</span>
  </div>
);

export { clamp };
