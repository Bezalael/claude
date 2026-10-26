import React from "react";
import { AbsoluteFill } from "remotion";
import { SYMBOL_ANCHOR, SYMBOL_D, SymbolMark, symbolHeight } from "./brand";
import { SYMBOL_W } from "./brandPath";
import { C } from "./ui";

/**
 * Scene-to-scene transitions. Both scenes are mounted for the transition window and each gets the
 * same linear progress `p` (0 to 1); every presentation applies its own easing. The entering scene
 * sits above the exiting one unless the exiting wrapper raises itself with zIndex.
 */
export type Dir = "in" | "out";
export type PresProps = { dir: Dir; p: number; id: string; children: React.ReactNode };
export type Transition = {
  at: number; // cut time in seconds, on a music downbeat
  frames: number;
  anchor?: number; // share of the window that falls before the cut (0.5 = centred on it)
  Pres: React.FC<PresProps>;
};

const c01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = c01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const inExpo = (t: number) => (t <= 0 ? 0 : 2 ** (10 * t - 10));
const Bg: React.FC = () => <AbsoluteFill style={{ background: C.bg }} />;

/** Directional (motion) blur through an inline SVG filter; sx/sy are blur radii in px. */
const MotionBlur: React.FC<{ id: string; sx: number; sy: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  id,
  sx,
  sy,
  style,
  children,
}) => {
  const on = sx > 0.5 || sy > 0.5;
  return (
    <>
      {on && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${sx} ${sy}`} />
          </filter>
        </svg>
      )}
      <AbsoluteFill style={{ filter: on ? `url(#${id})` : undefined, ...style }}>{children}</AbsoluteFill>
    </>
  );
};

/** Camera flies forward: the old scene rushes past, the new one arrives from depth. */
export const zoomThrough =
  (x: number, y: number): React.FC<PresProps> =>
  ({ dir, p, children }) => {
    const origin = `${x}px ${y}px`;
    if (dir === "out") {
      const e = inExpo(p);
      return (
        <AbsoluteFill style={{ transform: `scale(${1 + 5 * e})`, transformOrigin: origin, opacity: 1 - smooth(0.45, 0.75, p), filter: `blur(${12 * e}px)` }}>
          {children}
        </AbsoluteFill>
      );
    }
    const e = outExpo(smooth(0.35, 1, p));
    return (
      <AbsoluteFill style={{ transform: `scale(${lerp(0.55, 1, e)})`, transformOrigin: origin, opacity: smooth(0.4, 0.65, p), filter: `blur(${(1 - e) * 14}px)` }}>
        {children}
      </AbsoluteFill>
    );
  };

/** App icon geometry shared by the shrink transition and the logo scene's first frames. */
export const ICON = { size: 240, radius: 54, symbol: 150 };
export const AppIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = ICON.size, style }) => {
  const k = size / ICON.size;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: ICON.radius * k,
        background: "linear-gradient(135deg, #163A5F 0%, #2A6AA3 55%, #4499D3 100%)",
        display: "grid",
        placeItems: "center",
        boxShadow: `0 ${24 * k}px ${60 * k}px rgba(18,48,79,0.28)`,
        ...style,
      }}
    >
      <SymbolMark width={ICON.symbol * k} tone="white" />
    </div>
  );
};

/** iOS-style close: the whole scene shrinks into a card that becomes the Adele app icon on the beat. */
export const shrinkToIcon: React.FC<PresProps> = ({ dir, p, children }) => {
  if (dir === "in") return <AbsoluteFill>{children}</AbsoluteFill>;
  const e = inOutCubic(p);
  const w = lerp(1920, ICON.size, e);
  const h = lerp(1080, ICON.size, e);
  const s = lerp(1, ICON.size / 1080, e);
  const icon = smooth(0.5, 0.85, p);
  return (
    <AbsoluteFill style={{ zIndex: 2, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          borderRadius: lerp(0, ICON.radius, smooth(0, 0.6, p)),
          overflow: "hidden",
          boxShadow: `0 30px 90px rgba(18,48,79,${0.3 * smooth(0, 0.3, p)})`,
          background: C.bg,
        }}
      >
        <div style={{ position: "absolute", left: (w - 1920) / 2, top: (h - 1080) / 2, width: 1920, height: 1080, transform: `scale(${s})` }}>{children}</div>
        <AppIcon size={Math.max(w, h)} style={{ position: "absolute", left: (w - Math.max(w, h)) / 2, top: (h - Math.max(w, h)) / 2, opacity: icon, borderRadius: 0, boxShadow: "none" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Final logo state in the logo scene; the zoom starts from exactly here. */
export const LOGO_END = { cx: 960, cy: 540, width: 420 };
const K0 = LOGO_END.width / SYMBOL_W;
const ANCHOR_SCREEN = {
  x: LOGO_END.cx - LOGO_END.width / 2 + SYMBOL_ANCHOR.x * K0,
  y: LOGO_END.cy - symbolHeight(LOGO_END.width) / 2 + SYMBOL_ANCHOR.y * K0,
};

/** The symbol becomes a window: the next scene appears inside it and the camera flies through the stroke. */
export const logoFlyThrough: React.FC<PresProps> = ({ dir, p, id, children }) => {
  const e = inOutCubic(p);
  const k = K0 * Math.pow(32 / K0, e);
  const tx = ANCHOR_SCREEN.x - SYMBOL_ANCHOR.x * k;
  const ty = ANCHOR_SCREEN.y - SYMBOL_ANCHOR.y * k;
  const origin = `${ANCHOR_SCREEN.x}px ${ANCHOR_SCREEN.y}px`;
  if (dir === "out") {
    return (
      <AbsoluteFill style={{ transform: `scale(${Math.min(k / K0, 12)})`, transformOrigin: origin, filter: `blur(${8 * smooth(0.3, 0.8, p)}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <path d={SYMBOL_D} transform={`translate(${tx} ${ty}) scale(${k})`} />
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#${id})` }}>
        <Bg />
        <AbsoluteFill style={{ transform: `scale(${lerp(1.35, 1, e)})`, transformOrigin: origin }}>{children}</AbsoluteFill>
        {/* the symbol's own fill thins away so the window opens rather than pops */}
        <AbsoluteFill style={{ opacity: 1 - smooth(0, 0.35, p) }}>
          <svg width={1920} height={1080}>
            <defs>
              <linearGradient id={`${id}g`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#12304F" />
                <stop offset="0.55" stopColor="#2A6AA3" />
                <stop offset="1" stopColor="#4A9AD0" />
              </linearGradient>
            </defs>
            <path d={SYMBOL_D} transform={`translate(${tx} ${ty}) scale(${k})`} fill={`url(#${id}g)`} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  );
};

/** A fast, clean push with motion blur that peaks mid-move. */
export const push =
  (axis: "x" | "y"): React.FC<PresProps> =>
  ({ dir, p, id, children }) => {
    const e = inOutQuint(p);
    const v = (inOutQuint(Math.min(1, p + 0.01)) - inOutQuint(Math.max(0, p - 0.01))) / 0.02 / 5;
    const dist = axis === "x" ? 1920 : 1080;
    const off = dir === "out" ? -e * dist : (1 - e) * dist;
    const blur = 36 * v;
    const t = axis === "x" ? `translateX(${off}px)` : `translateY(${off}px)`;
    return (
      <MotionBlur id={id} sx={axis === "x" ? blur : 0} sy={axis === "y" ? blur : 0} style={{ transform: `${t} scale(${1 - 0.05 * Math.sin(Math.PI * p)})` }}>
        {children}
      </MotionBlur>
    );
  };

/** The old scene lifts away as a card; the new one settles in beneath it. */
export const cardLift: React.FC<PresProps> = ({ dir, p, id, children }) => {
  if (dir === "in") {
    const e = outExpo(smooth(0.2, 1, p));
    return <AbsoluteFill style={{ transform: `scale(${lerp(0.9, 1, e)})`, opacity: smooth(0.1, 0.5, p) }}>{children}</AbsoluteFill>;
  }
  const shrink = inOutCubic(smooth(0, 0.45, p));
  const lift = inExpo(smooth(0.3, 1, p));
  const v = lift > 0.02 ? 30 * smooth(0.45, 0.85, p) * (1 - smooth(0.9, 1, p)) : 0;
  return (
    <AbsoluteFill style={{ zIndex: 2, transform: `translateY(${-1300 * lift}px) scale(${lerp(1, 0.84, shrink)})` }}>
      <AbsoluteFill style={{ borderRadius: 48 * shrink, overflow: "hidden", boxShadow: `0 40px 120px rgba(18,48,79,${0.25 * shrink})` }}>
        <MotionBlur id={id} sx={0} sy={v}>
          <Bg />
          {children}
        </MotionBlur>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Circular reveal growing out of a point in the old scene. */
export const irisFrom =
  (x: number, y: number, r0: number): React.FC<PresProps> =>
  ({ dir, p, children }) => {
    const e = inOutCubic(p);
    if (dir === "out") {
      return (
        <AbsoluteFill style={{ transform: `scale(${1 + 0.22 * e})`, transformOrigin: `${x}px ${y}px`, filter: `blur(${5 * e}px)` }}>
          {children}
        </AbsoluteFill>
      );
    }
    const r = lerp(r0, 2300, e);
    const m = `radial-gradient(circle at ${x}px ${y}px, #000 ${Math.max(0, r - 2)}px, transparent ${r}px)`;
    return (
      <>
        <AbsoluteFill style={{ WebkitMaskImage: m, maskImage: m }}>
          <Bg />
          <AbsoluteFill style={{ transform: `scale(${lerp(1.18, 1, e)})`, transformOrigin: `${x}px ${y}px` }}>{children}</AbsoluteFill>
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: x - r,
            top: y - r,
            width: 2 * r,
            height: 2 * r,
            borderRadius: "50%",
            border: `2px solid rgba(255,255,255,0.9)`,
            boxShadow: `0 0 40px ${C.sky}88, inset 0 0 40px ${C.sky}55`,
            opacity: 1 - smooth(0.55, 0.9, p),
          }}
        />
      </>
    );
  };

/** Rack focus: the old scene drifts out of focus as the new one resolves from soft to crisp. */
export const focusPull: React.FC<PresProps> = ({ dir, p, children }) => {
  if (dir === "out") {
    const e = smooth(0, 0.7, p);
    return <AbsoluteFill style={{ filter: `blur(${24 * e}px)`, transform: `scale(${1 + 0.06 * e})`, opacity: 1 - smooth(0.35, 0.75, p) }}>{children}</AbsoluteFill>;
  }
  const e = outExpo(smooth(0.3, 1, p));
  return <AbsoluteFill style={{ filter: `blur(${(1 - e) * 28}px)`, transform: `scale(${lerp(1.1, 1, e)})`, opacity: smooth(0.3, 0.6, p) }}>{children}</AbsoluteFill>;
};
