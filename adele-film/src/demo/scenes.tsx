import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoReveal, SymbolMark, symbolHeight, Wordmark, wipe } from "../brand";
import { Center, IncomingCall, Spinner, TypedBubble, WA, WaBubble } from "../scenes";
import { LOGO_END } from "../transitions";
import { Blob, C, clamp, Dot, FONT, GlowCard, GRAD, Pill, Rise, useCue, useIn, Words } from "../ui";
import { BEAT, VO, word } from "./timeline";

// Frame numbers are relative to the scene's sequence start (which includes its incoming transition);
// `cue(t)` turns an absolute time in seconds (as in timeline.ts) into that frame.

/** Frames of the words of a voice line, from word `from` up to (not including) `to`. */
const useWordCues = () => {
  const cue = useCue();
  return (file: string, from = 0, to?: number) => {
    const v = VO.find((x) => x.file === file)!;
    return v.words.slice(from, to).map((w) => cue(v.at + w));
  };
};
/** Frame at which word `i` of a voice line is spoken. */
const useWord = () => {
  const cue = useCue();
  return (file: string, i: number) => cue(word(file, i));
};

const GREEN = "#127A43";
const GREEN_BG = "#E4F7EC";
const RED = "#C9353A";
const RED_BG = "#FFF1F1";
const ORANGE_BG = "#FDF0E6";

/** Day and time label, top left, like a chapter heading. */
const Chapter: React.FC<{ day: string; time?: string }> = ({ day, time }) => {
  const p = useIn(6, 16);
  return (
    <div style={{ position: "absolute", left: 90, top: 64, display: "flex", alignItems: "center", gap: 18, opacity: p, transform: `translateY(${(1 - p) * -20}px)` }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.orange }}>{day}</div>
      {time && <div style={{ fontSize: 30, fontWeight: 600, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{time}</div>}
    </div>
  );
};

/** A row of icon, title and detail, used for result cards across the film. */
const ResultCard: React.FC<{ at: number; icon: string; title: string; detail: string; tone?: "green" | "brand" | "orange"; w?: number }> = ({
  at,
  icon,
  title,
  detail,
  tone = "brand",
  w = 760,
}) => {
  const p = useIn(at, 14);
  const bg = tone === "green" ? GREEN_BG : tone === "orange" ? ORANGE_BG : "#EAF2FA";
  const fg = tone === "green" ? GREEN : tone === "orange" ? C.orange : C.blue;
  return (
    <div
      style={{
        width: w,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "20px 26px",
        borderRadius: 26,
        background: "#fff",
        boxShadow: "0 16px 44px rgba(18,48,79,0.12)",
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.95 + 0.05 * p})`,
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: 18, background: bg, color: fg, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>{title}</div>
        <div style={{ fontSize: 23, color: C.mute, marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
};

/** A phone running a WhatsApp Business chat on the practice's number. */
const WaPhone: React.FC<{ children: React.ReactNode; h?: number }> = ({ children, h = 880 }) => (
  <GlowCard w={470} h={h} glow={0.6}>
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: WA.wall }}>
      <div style={{ background: WA.header, color: "#fff", padding: "40px 24px 18px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 34, opacity: 0.9 }}>‹</div>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: "#fff", display: "grid", placeItems: "center" }}>
          <SymbolMark width={38} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Riverside Dental</div>
          <div style={{ fontSize: 18, opacity: 0.8 }}>Business account · replies by Adele</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "18px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10, overflow: "hidden" }}>{children}</div>
      <div style={{ background: "#F0F2F5", padding: "14px 18px 26px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 28, height: 52, padding: "0 22px", display: "flex", alignItems: "center", color: "#8696A0", fontSize: 22 }}>Message</div>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: WA.accent }} />
      </div>
    </div>
  </GlowCard>
);

const WaTyping: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: 18, padding: "16px 20px", display: "flex", gap: 7 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: "#8696A0", opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i)) }} />
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------------------------------------- */
/* 0-10s  "It's eight o'clock on Monday morning. Reception doesn't open for half an hour, and the
   phone is already ringing."  Lights off; the desk phone rings into an empty reception. */
const RINGS = [0.5, 3.5, 6.5];

const Open: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWordCues();
  const now = (f - cue(0)) / 30;
  const ringing = RINGS.some((r) => (now >= r && now < r + 0.4) || (now >= r + 0.6 && now < r + 1.0));
  const missed = useIn(cue(8.4), 14);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1B3A5C 0%, #0D1E31 60%, #08131F 100%)", color: "#fff" }}>
      <Center style={{ justifyContent: "flex-start", paddingTop: 120 }}>
        <Rise at={4}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 8, color: C.peach, textAlign: "center" }}>MONDAY</div>
          <div style={{ fontSize: 200, fontWeight: 800, letterSpacing: -8, lineHeight: 1, fontVariantNumeric: "tabular-nums", textAlign: "center" }}>08:00</div>
        </Rise>
      </Center>
      <Center style={{ paddingTop: 210 }}>
        <div style={{ position: "relative", width: 300, height: 300, display: "grid", placeItems: "center" }}>
          {RINGS.map((r) =>
            [0, 1, 2].map((k) => {
              const ph = (now - r - k * 0.25) / 1.6;
              if (ph < 0 || ph > 1) return null;
              return (
                <div
                  key={`${r}-${k}`}
                  style={{ position: "absolute", width: 150 + 260 * ph, height: 150 + 260 * ph, borderRadius: "50%", border: `3px solid ${C.sky}`, opacity: 0.6 * (1 - ph) }}
                />
              );
            }),
          )}
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              background: ringing ? C.sky : "#ffffff14",
              boxShadow: ringing ? `0 0 60px ${C.sky}` : "none",
              display: "grid",
              placeItems: "center",
              fontSize: 70,
              transform: `rotate(${ringing ? 8 * Math.sin(f * 1.6) : 0}deg)`,
            }}
          >
            ✆
          </div>
        </div>
      </Center>
      <div style={{ position: "absolute", top: 800, width: "100%" }}>
        <Words text="Reception doesn't open for half an hour." times={w("open", 6, 13)} size={48} weight={600} color="#ffffffd9" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", opacity: missed, transform: `translateY(${(1 - missed) * 20}px)` }}>
        <Pill style={{ background: "#ffffff14", color: "#fff", boxShadow: "none", fontSize: 26 }}>
          <span style={{ color: "#FF6B6B" }}>●</span> Missed call · 08:00 · Reception closed
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

/* 10-32.5s  "Every unanswered call, every cancellation left empty, every recall nobody had time to send,
   is an empty chair. Your team can't be everywhere. I can. I'm Adele, the AI receptionist for UK dental
   practices, and this is one week at Riverside Dental."  Three gaps land in the week's diary; then the
   lights come up on Adele, and the symbol returns to centre for the fly-through. */
const Cost: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWord();
  const ws = useWordCues();
  const can = w("cost", 23); // "I"
  const lights = interpolate(f, [can, can + 10], [0, 1], clamp);
  const gaps = [
    { at: w("cost", 1), label: "Unanswered call", detail: "Mon 08:00 · went elsewhere", icon: "✆" },
    { at: w("cost", 4), label: "Cancellation left empty", detail: "Tue 14:00 · nobody to call round", icon: "✕" },
    { at: w("cost", 8), label: "Recall never sent", detail: "64 patients overdue", icon: "↻" },
  ];
  // the lockup: symbol and wordmark, then the symbol re-centres for the fly-through
  const lock = interpolate(f, [w("cost", 25), w("cost", 25) + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const outro = interpolate(f, [cue(30.9), cue(31.9)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const L = { cx: 458, cy: 430, width: 320 };
  const at = lock * (1 - outro);
  const sw = LOGO_END.width + (L.width - LOGO_END.width) * at;
  const cx = LOGO_END.cx + (L.cx - LOGO_END.cx) * at;
  const cy = LOGO_END.cy + (L.cy - LOGO_END.cy) * at;
  const draw = interpolate(f, [can, can + 26], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fill = interpolate(f, [can + 14, can + 34], [0, 1], clamp);
  const word = interpolate(f, [w("cost", 26), w("cost", 26) + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const text = word * (1 - Math.min(1, outro * 2));
  const sheen = interpolate(f, [w("cost", 29), w("cost", 29) + 26], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {/* the problem, on a dim page */}
      <AbsoluteFill style={{ opacity: 1 - lights }}>
        <Blob x={1350} y={540} size={760} intensity={0.35} />
        <div style={{ position: "absolute", left: 150, top: 200, display: "flex", flexDirection: "column", gap: 26 }}>
          {gaps.map((g) => (
            <ResultCard key={g.label} at={g.at} icon={g.icon} title={g.label} detail={g.detail} tone="orange" w={720} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 1010, top: 250, width: 780 }}>
          <Words text="is an empty chair." times={ws("cost", 14, 18)} size={104} weight={800} gradientWords={["empty", "chair."]} style={{ justifyContent: "flex-start" }} />
          <div style={{ height: 60 }} />
          <Words text="Your team can't be everywhere." times={ws("cost", 18, 23)} size={60} weight={600} color={C.mute} style={{ justifyContent: "flex-start" }} />
        </div>
      </AbsoluteFill>
      {/* the lights come up on Adele */}
      <AbsoluteFill style={{ opacity: lights }}>
        <Blob x={cx} y={cy} size={820} intensity={0.55} />
        <div style={{ position: "absolute", left: cx - sw / 2, top: cy - symbolHeight(sw) / 2 }}>
          <SymbolMark width={sw} draw={draw} fill={fill} sheen={sheen} glow={0.3 + 0.5 * (1 - fill)} />
        </div>
        <div style={{ position: "absolute", left: L.cx + L.width / 2 + 72, top: L.cy - 75, opacity: text, filter: `blur(${(1 - text) * 8}px)` }}>
          <div style={{ ...wipe(word), transform: `translateX(${(1 - word) * -50 - outro * 40}px)` }}>
            <Wordmark height={150} />
          </div>
        </div>
        <div style={{ position: "absolute", top: 610, width: "100%", opacity: 1 - Math.min(1, outro * 2), filter: `blur(${outro * 10}px)` }}>
          <Words text="The AI receptionist for UK dental practices." times={ws("cost", 27, 34)} size={56} weight={600} gradientWords={["receptionist"]} />
          <div style={{ height: 44 }} />
          <Words text="One week at Riverside Dental" times={ws("cost", 37, 42)} size={40} weight={600} color={C.mute} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 32.5-47.5s  "Patients reach me by phone, WhatsApp, SMS, email or web chat. I keep one history for every
   patient, follow your booking rules, update your PMS and take payments through Stripe." */
const How: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const inputs = [
    { label: "Phone", icon: "✆", at: w("how", 4) },
    { label: "WhatsApp", icon: "💬", at: w("how", 5) },
    { label: "SMS", icon: "✉", at: w("how", 6) },
    { label: "Email", icon: "@", at: w("how", 7) },
    { label: "Web chat", icon: "🖥", at: w("how", 9) },
  ];
  const outputs = [
    { label: "PMS diary", at: w("how", 22) },
    { label: "Patient notes", at: w("how", 22) + 5 },
    { label: "Stripe payments", at: w("how", 26) },
    { label: "Your team", at: w("how", 29) + 6 },
    { label: "Live dashboard", at: w("how", 29) + 11 },
  ];
  const rowY = (i: number) => 250 + i * 128;
  const hub = useIn(8, 16);
  const history = useIn(w("how", 11), 14);
  const rules = useIn(w("how", 18), 14);
  const flow = (f % 40) / 40;
  return (
    <AbsoluteFill>
      <Blob x={960} y={560} size={700} intensity={0.4} />
      <Center style={{ justifyContent: "flex-start", paddingTop: 70 }}>
        <Rise at={4}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.orange, textAlign: "center" }}>HOW I WORK</div>
        </Rise>
      </Center>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <defs>
          <linearGradient id="howIn" gradientUnits="userSpaceOnUse" x1={560} y1={0} x2={760} y2={0}>
            <stop offset="0" stopColor={C.sky} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
          <linearGradient id="howOut" gradientUnits="userSpaceOnUse" x1={1160} y1={0} x2={1360} y2={0}>
            <stop offset="0" stopColor={C.blue} />
            <stop offset="1" stopColor={C.orange} />
          </linearGradient>
        </defs>
        {inputs.map((it, i) => {
          const p = interpolate(f, [it.at, it.at + 12], [0, 1], clamp);
          return <path key={it.label} d={`M 560 ${rowY(i) + 38} C 680 ${rowY(i) + 38}, 660 ${540}, 760 ${540}`} stroke="url(#howIn)" strokeWidth={4} fill="none" strokeDasharray="14 12" strokeDashoffset={-flow * 104} opacity={p} />;
        })}
        {outputs.map((it, i) => {
          const p = interpolate(f, [it.at, it.at + 12], [0, 1], clamp);
          return <path key={it.label} d={`M 1160 540 C 1260 540, 1240 ${rowY(i) + 38}, 1360 ${rowY(i) + 38}`} stroke="url(#howOut)" strokeWidth={4} fill="none" strokeDasharray="14 12" strokeDashoffset={flow * 104} opacity={p} />;
        })}
      </svg>
      {inputs.map((it, i) => (
        <Rise key={it.label} at={it.at} dist={20} style={{ position: "absolute", left: 250, top: rowY(i) }}>
          <Pill style={{ width: 310, fontSize: 32, padding: "16px 28px" }}>
            <span style={{ width: 36, textAlign: "center" }}>{it.icon}</span> {it.label}
          </Pill>
        </Rise>
      ))}
      <div style={{ position: "absolute", left: 760, top: 340, opacity: hub, transform: `scale(${0.9 + 0.1 * hub})` }}>
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: 64,
            background: `linear-gradient(160deg, ${C.navy}, #1A4470)`,
            boxShadow: `0 30px 90px rgba(18,48,79,0.35), 0 0 ${40 + 20 * Math.sin(f / 8)}px ${C.sky}55`,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <SymbolMark width={120} tone="white" />
          <div style={{ fontSize: 48, fontWeight: 800, marginTop: 8 }}>Adele</div>
          <div style={{ fontSize: 22, opacity: 0.8, textAlign: "center", lineHeight: 1.35 }}>
            Practice knowledge base
            <br />
            <span style={{ color: rules > 0.5 ? C.peach : undefined, fontWeight: rules > 0.5 ? 700 : 400 }}>your booking rules</span>
          </div>
        </div>
      </div>
      <Rise at={w("how", 11)} style={{ position: "absolute", left: 740, top: 790 }}>
        <div style={{ width: 440, padding: "18px 22px", borderRadius: 24, background: "#fff", boxShadow: "0 16px 44px rgba(18,48,79,0.14)", opacity: history }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Tom Hughes · one history</div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {["✆ Call · Mon", "💬 WhatsApp · Tue", "@ Email · Fri"].map((c) => (
              <span key={c} style={{ fontSize: 19, padding: "6px 12px", borderRadius: 999, background: "#EEF3F8", color: C.blue, fontWeight: 600 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </Rise>
      {outputs.map((it, i) => (
        <Rise key={it.label} at={it.at} dist={20} style={{ position: "absolute", left: 1360, top: rowY(i) }}>
          <Pill style={{ width: 330, fontSize: 32, padding: "16px 28px", background: "#EEF4FA" }}>
            <Dot size={14} /> {it.label}
          </Pill>
        </Rise>
      ))}
    </AbsoluteFill>
  );
};

/* 47.5-80.5s  MONDAY 08:00. The call nobody was there for, answered this time. */
const TRANSCRIPT: Record<string, { who: "adele" | "patient"; text: string }> = {
  call_a: { who: "adele", text: "Good morning, Riverside Dental. This is Adele, how can I help?" },
  call_b: { who: "patient", text: "Hi, I've just moved to the area. Can I register and book a check-up?" },
  call_c: { who: "adele", text: "Of course. I have Wednesday at nine thirty. Shall I book that?" },
  call_d: { who: "patient", text: "Yes please, perfect." },
  call_e: { who: "adele", text: "Done. I'll send you a secure link for the deposit, with directions and parking." },
};
const CALL = VO.filter((v) => v.file.startsWith("call_"));

const Call: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWord();
  const now = (f - cue(0)) / 30;
  const speaking = CALL.find((v) => now >= v.at && now < v.at + v.dur);
  const answered = f >= cue(BEAT.callAnswer);
  const booked = useIn(cue(BEAT.callBooked), 14);
  const checking = useIn(cue(59.9), 16);
  const results = interpolate(f, [cue(73.2), cue(73.8)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Chapter day="MONDAY" time="08:00" />
      <Blob x={560} y={560} size={760} intensity={0.45} />
      <div style={{ position: "absolute", left: 260, top: 150 }}>
        <Rise at={4}>
          <GlowCard w={440} h={820} glow={answered ? 0.9 : 0.5}>
            <div style={{ height: "100%", background: `linear-gradient(170deg, ${C.navy}, ${C.blue} 70%, ${C.sky})`, color: "#fff", position: "relative" }}>
              {!answered ? <IncomingCall answerAt={cue(BEAT.callAnswer)} /> : <OnCall who={speaking ? TRANSCRIPT[speaking.file].who : undefined} since={cue(BEAT.callAnswer)} booked={booked} />}
            </div>
          </GlowCard>
        </Rise>
      </div>
      {/* the conversation, then what it produced */}
      <div style={{ position: "absolute", left: 860, top: 160, width: 860, display: "flex", flexDirection: "column", gap: 16, opacity: 1 - results, transform: `translateY(${-40 * results}px)` }}>
        <Rise at={cue(BEAT.callAnswer)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 700, color: C.mute, letterSpacing: 2, textTransform: "uppercase" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FF4D4D", opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 10)) }} />
            Live call transcript
          </div>
        </Rise>
        {CALL.map((v) => (
          <React.Fragment key={v.file}>
            <TypedBubble at={cue(v.at)} words={v.words.map((x) => cue(v.at + x))} {...TRANSCRIPT[v.file]} />
            {v.file === "call_b" && (
              <div style={{ height: 60 * checking, opacity: checking, overflow: "hidden" }}>
                <Pill style={{ fontSize: 23, padding: "9px 18px", color: C.blue, background: "#EEF5FB", boxShadow: "none" }}>
                  <Spinner done={f >= cue(60.4)} /> {f >= cue(60.4) ? "New patient check-up free: Wed 09:30" : "Checking the diary…"}
                </Pill>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {results > 0 && (
        <div style={{ position: "absolute", left: 860, top: 190, display: "flex", flexDirection: "column", gap: 20 }}>
          <ResultCard at={w("monday", 0)} icon="✓" tone="green" title="New patient registered" detail="Tom Hughes · details captured on the call" />
          <ResultCard at={w("monday", 1)} icon="▦" title="Added to your diary" detail="Wed 09:30 · New patient check-up" />
          <ResultCard at={w("monday", 4)} icon="£" title="Deposit taken" detail="Paid securely via Stripe" />
          <ResultCard at={w("monday", 6)} icon="✎" title="Summary and next step in notes" detail="Ready for your team at 08:30" />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** In-call screen: Adele's symbol with a live waveform that follows whoever is speaking. */
const OnCall: React.FC<{ who?: "adele" | "patient"; since: number; booked: number }> = ({ who, since, booked }) => {
  const f = useCurrentFrame();
  const secs = Math.floor((f - since) / 30);
  const p = useIn(since, 14);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, opacity: p }}>
      <div style={{ fontSize: 24, opacity: 0.75 }}>On call · 00:{String(secs).padStart(2, "0")}</div>
      <div
        style={{
          marginTop: 60,
          width: 190,
          height: 190,
          borderRadius: 95,
          background: "#ffffff18",
          display: "grid",
          placeItems: "center",
          boxShadow: who === "adele" ? `0 0 ${40 + 20 * Math.sin(f / 3)}px #ffffff55` : "none",
        }}
      >
        <SymbolMark width={124} tone="white" />
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 26 }}>Adele</div>
      <div style={{ fontSize: 24, opacity: 0.75 }}>AI receptionist</div>
      <div style={{ display: "flex", gap: 7, alignItems: "center", height: 130, marginTop: 40 }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const amp = who ? Math.abs(Math.sin(f / 3.2 + i * 0.75) * Math.sin(f / 7.5 + i * 0.33)) : 0.04;
          return <div key={i} style={{ width: 9, borderRadius: 5, background: who === "patient" ? "#ffffffaa" : "#fff", height: 12 + 110 * amp * (who === "patient" ? 0.7 : 1) }} />;
        })}
      </div>
      <div style={{ fontSize: 24, opacity: 0.8, height: 30 }}>{who === "adele" ? "Adele speaking" : who === "patient" ? "Caller speaking" : booked > 0 ? "" : "Listening…"}</div>
      <div style={{ marginTop: 26, opacity: booked, transform: `scale(${0.9 + 0.1 * booked})` }}>
        <Pill style={{ background: "#E9FBF1", color: GREEN, fontSize: 26, boxShadow: "none" }}>✓ Appointment booked</Pill>
      </div>
    </div>
  );
};

/* 80.5-102.5s  MONDAY 08:30. The team walks in to the Adele portal: what was booked since Friday, and
   what needs a person. */
const BOOKED_SINCE_FRIDAY = [
  { when: "Sat 10:14", ch: "💬", who: "Priya S.", what: "Check-up · Thu 11:00", paid: true },
  { when: "Sat 15:32", ch: "🖥", who: "Ben O.", what: "Hygiene · Tue 09:20", paid: false },
  { when: "Sun 09:05", ch: "✆", who: "Grace L.", what: "Check-up · Fri 14:40", paid: true },
  { when: "Sun 19:48", ch: "💬", who: "Daniel K.", what: "Hygiene · Wed 12:00", paid: false },
  { when: "Mon 07:41", ch: "✆", who: "Hannah W.", what: "Check-up · Thu 15:20", paid: false },
  { when: "Mon 08:02", ch: "✆", who: "Tom H.", what: "New patient · Wed 09:30", paid: true },
];

const Portal: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const listAt = w("portal", 17);
  const summary = useIn(w("portal", 28), 16);
  const flagged = w("portal", 38);
  const urgent = w("portal", 52);
  const lights = interpolate(f, [0, 24], [0.55, 1], clamp);
  return (
    <AbsoluteFill>
      <Chapter day="MONDAY" time="08:30" />
      <Blob x={1500} y={300} size={700} intensity={0.35 * lights} />
      <div style={{ position: "absolute", left: 90, top: 170 }}>
        <Rise at={8}>
          <GlowCard w={1740} h={840} glow={0.35}>
            <div style={{ height: "100%", display: "flex" }}>
              {/* sidebar */}
              <div style={{ width: 300, background: C.navy, color: "#fff", padding: "34px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <SymbolMark width={54} tone="white" />
                  <div style={{ fontSize: 30, fontWeight: 800 }}>Adele</div>
                </div>
                {["Today", "Conversations", "Diary", "Recall", "Waitlists", "Settings"].map((n, i) => (
                  <div key={n} style={{ fontSize: 24, fontWeight: i === 0 ? 800 : 500, opacity: i === 0 ? 1 : 0.65, padding: "8px 14px", borderRadius: 12, background: i === 0 ? "#ffffff1c" : "none" }}>
                    {n}
                  </div>
                ))}
                <div style={{ marginTop: "auto", fontSize: 20, opacity: 0.6 }}>Riverside Dental</div>
              </div>
              {/* main */}
              <div style={{ flex: 1, padding: "34px 40px", display: "flex", gap: 34 }}>
                <div style={{ flex: 1.45 }}>
                  <div style={{ fontSize: 34, fontWeight: 800 }}>Booked by Adele since Friday</div>
                  <div style={{ fontSize: 22, color: C.mute, marginTop: 4, marginBottom: 20 }}>Each with a summary of the conversation</div>
                  {BOOKED_SINCE_FRIDAY.map((r, i) => {
                    const p = useIn(listAt + i * 5, 15);
                    const open = i === BOOKED_SINCE_FRIDAY.length - 1 ? summary : 0;
                    return (
                      <div key={r.who} style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)`, marginBottom: 10, borderRadius: 18, background: open > 0.05 ? "#F1F6FB" : "#F7F9FB", padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 23 }}>
                          <div style={{ width: 118, color: C.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.when}</div>
                          <div style={{ width: 30, textAlign: "center" }}>{r.ch}</div>
                          <div style={{ width: 140, fontWeight: 700 }}>{r.who}</div>
                          <div style={{ flex: 1, whiteSpace: "nowrap" }}>{r.what}</div>
                          {r.paid && <div style={{ fontSize: 19, fontWeight: 700, color: GREEN, background: GREEN_BG, padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap" }}>Deposit paid</div>}
                        </div>
                        {open > 0.01 && (
                          <div style={{ height: 70 * open, opacity: open, overflow: "hidden", fontSize: 21, color: C.ink, marginTop: 8 * open, lineHeight: 1.4 }}>
                            <b>Summary:</b> new patient, just moved to the area. Registered, booked a check-up for Wed 09:30, deposit paid. Next step: none.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", gap: 14 }}>
                    Needs your team
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", background: C.orange, borderRadius: 999, padding: "2px 14px", opacity: useIn(flagged, 14) }}>2</span>
                  </div>
                  <div style={{ fontSize: 22, color: C.mute, marginTop: 4, marginBottom: 20 }}>Flagged by Adele for a person</div>
                  {[
                    { t: "Treatment question about implants", d: "Needs a clinician · WhatsApp, Sat 11:20" },
                    { t: "Asked to speak to the practice manager", d: "Call, Sun 18:05 · callback requested" },
                  ].map((c, i) => {
                    const p = useIn(flagged + i * 7, 14);
                    return (
                      <div key={c.t} style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)`, marginBottom: 14, borderRadius: 18, border: `2px solid ${C.orange}55`, background: ORANGE_BG, padding: "16px 20px" }}>
                        <div style={{ fontSize: 25, fontWeight: 800, display: "flex", gap: 10 }}>
                          <span style={{ color: C.orange }}>⚑</span> {c.t}
                        </div>
                        <div style={{ fontSize: 21, color: C.mute, marginTop: 4 }}>{c.d}</div>
                      </div>
                    );
                  })}
                  <Rise at={urgent} dist={20} style={{ marginTop: 26 }}>
                    <Pill style={{ fontSize: 23, padding: "12px 20px", background: "#EEF4FA", boxShadow: "none" }}>
                      <span style={{ color: RED }}>●</span> Urgent calls go straight to your team
                    </Pill>
                  </Rise>
                </div>
              </div>
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* 102.5-128.5s  MONDAY 09:12. A website enquiry, followed up on WhatsApp within minutes; then the same
   reminder as an SMS (charged in parts) and on WhatsApp (one message, one-tap reply). */
const REMINDER =
  "Hi Sam, this is a reminder of your check-up at Riverside Dental on Thursday at 4:15pm with Dr Harris. Free parking is behind the practice on Mill Lane, and the entrance is next to the pharmacy. Directions: maps.app/riverside-dental. Please reply YES to confirm or NO to rearrange.";

const WhatsAppFirst: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWord();
  const compare = interpolate(f, [w("whatsapp", 33) - 6, w("whatsapp", 33) + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const enquiry = useIn(cue(103.3), 14);
  const followed = useIn(w("whatsapp", 9), 14);
  const sms = useIn(w("whatsapp", 42), 16);
  const wa = useIn(w("whatsapp", 50), 16);
  // the SMS is billed in 153-character parts once it runs past 160 characters
  const parts = Math.ceil(REMINDER.length / 153);
  const chunks = Array.from({ length: parts }, (_, i) => REMINDER.slice(i * 153, (i + 1) * 153));
  return (
    <AbsoluteFill>
      <Chapter day="MONDAY" time="09:12" />
      <Blob x={1400} y={540} size={760} intensity={0.4} />
      {/* phase 1: the enquiry and its follow-up */}
      <div style={{ position: "absolute", left: 150, top: 190, opacity: 1 - compare, transform: `translateX(${-80 * compare}px)`, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ opacity: enquiry, transform: `translateY(${(1 - enquiry) * 30}px)` }}>
          <div style={{ width: 760, borderRadius: 26, background: "#fff", boxShadow: "0 16px 44px rgba(18,48,79,0.12)", padding: "22px 28px" }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: C.mute, letterSpacing: 2 }}>🖥 NEW WEBSITE ENQUIRY · 09:12</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>Sam R.</div>
            <div style={{ fontSize: 26, marginTop: 4 }}>"Hi, can I book a check-up next week?"</div>
          </div>
        </div>
        <div style={{ opacity: followed, transform: `translateY(${(1 - followed) * 20}px)` }}>
          <Pill style={{ fontSize: 26 }}>
            <Dot size={12} /> Followed up on WhatsApp at 09:14
          </Pill>
        </div>
        <div style={{ height: 20 }} />
        <ResultCard at={cue(BEAT.waBooked) + 4} icon="▦" title="Added to your diary" detail="Thu 4:15 · Check-up" />
        <ResultCard at={w("whatsapp", 32)} icon="£" title="Deposit taken" detail="Paid securely via Stripe" />
      </div>
      {/* phase 2: the same reminder, two ways */}
      {compare > 0 && (
        <div style={{ position: "absolute", left: 120, top: 170, width: 1100, opacity: compare, transform: `translateX(${(1 - compare) * 60}px)` }}>
          <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 26 }}>The same reminder, two ways</div>
          <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
            <div style={{ width: 520, opacity: sms, transform: `translateY(${(1 - sms) * 30}px)` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.mute, marginBottom: 12 }}>SMS</div>
              <div style={{ background: "#E9E9EB", borderRadius: 24, padding: "18px 22px", fontSize: 20, lineHeight: 1.4, color: C.ink }}>
                {chunks.map((c, i) => (
                  <span key={i}>
                    {c}
                    {i < parts - 1 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0", color: RED, fontSize: 16, fontWeight: 800 }}>
                        <span style={{ flex: 1, borderTop: `2px dashed ${RED}` }} /> part {i + 2} <span style={{ flex: 1, borderTop: `2px dashed ${RED}` }} />
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 25, fontWeight: 800, color: RED }}>
                {parts} parts · charged as {parts} texts
              </div>
            </div>
            <div style={{ width: 520, opacity: wa, transform: `translateY(${(1 - wa) * 30}px)` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: WA.header, marginBottom: 12 }}>WhatsApp</div>
              <div style={{ background: WA.wall, borderRadius: 24, padding: 18 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: "14px 18px", fontSize: 21, lineHeight: 1.4 }}>
                  Hi Sam 👋 Your check-up is on <b>Thursday at 4:15pm</b> with Dr Harris. Free parking behind the practice on Mill Lane.
                  <div style={{ marginTop: 10, color: WA.accent, fontWeight: 700 }}>📍 Directions</div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {["Yes, I'll be there", "No, please rearrange"].map((b) => (
                    <div key={b} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 8px", textAlign: "center", fontSize: 20, fontWeight: 700, color: WA.accent }}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 25, fontWeight: 800, color: GREEN }}>1 message · one-tap reply</div>
            </div>
          </div>
          <Rise at={w("whatsapp", 57)} dist={20} style={{ marginTop: 30 }}>
            <Pill style={{ fontSize: 26 }}>
              <Dot size={12} /> Reminders go by WhatsApp first · SMS optional
            </Pill>
          </Rise>
        </div>
      )}
      <div style={{ position: "absolute", left: 1290, top: 180, transform: `translateX(${compare * 40}px)` }}>
        <Rise at={10}>
          <WaPhone h={840}>
            <WaBubble out at={cue(BEAT.waOffer)} time="09:14" read={f >= cue(BEAT.waReply)}>
              Hi Sam, it's Adele from Riverside Dental 👋 Thanks for your enquiry. I have Tuesday at 10:30 or Thursday at 4:15. Which suits you best?
            </WaBubble>
            <WaTyping from={cue(BEAT.waReply) - 30} to={cue(BEAT.waReply)} />
            <WaBubble at={cue(BEAT.waReply)} time="09:16">
              Thursday please
            </WaBubble>
            <WaBubble out at={cue(BEAT.waBooked)} time="09:16" read={false}>
              You're booked for Thursday at 4:15. Directions and parking details are on their way.
            </WaBubble>
          </WaPhone>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* 128.5-142s  TUESDAY 13:05. A 2pm cancels; the slot goes to the waitlist the practice chose. */
const Tuesday: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWord();
  const cancel = useIn(cue(BEAT.tueCancel), 14);
  const filled = useIn(cue(BEAT.tueFilled), 12);
  const lists = useIn(w("tuesday", 14), 14);
  const rows = [
    { t: "12:00", n: "Lunch", muted: true },
    { t: "13:20", n: "Aisha K. · Filling" },
    { t: "14:00", n: "Mark D. · Check-up", gap: true },
    { t: "14:40", n: "Priya S. · Crown fit" },
    { t: "15:20", n: "Ben O. · Check-up" },
  ];
  return (
    <AbsoluteFill>
      <Chapter day="TUESDAY" time="13:05" />
      <Blob x={1400} y={520} size={720} intensity={0.45} />
      <div style={{ position: "absolute", left: 150, top: 170 }}>
        <Rise at={6}>
          <GlowCard w={820} h={600} glow={0.5}>
            <div style={{ padding: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 22 }}>
                <div style={{ fontSize: 36, fontWeight: 800 }}>Today · Dr Harris</div>
                <div style={{ fontSize: 22, color: C.mute }}>Tuesday</div>
              </div>
              {rows.map((r) => (
                <Slot key={r.t} {...r} cancel={r.gap ? cancel : 0} filled={r.gap ? filled : 0} />
              ))}
            </div>
          </GlowCard>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 150, top: 820, opacity: lists, transform: `translateY(${(1 - lists) * 20}px)`, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.mute }}>Waitlist chosen by you:</div>
        {["Private", "Kids", "All patients"].map((n, i) => (
          <div key={n} style={{ fontSize: 24, fontWeight: 700, padding: "10px 20px", borderRadius: 999, background: i === 0 ? C.blue : "#EEF2F7", color: i === 0 ? "#fff" : C.mute }}>
            {i === 0 ? "✓ " : ""}
            {n}
          </div>
        ))}
      </div>
      <Rise at={w("tuesday", 27)} dist={20} style={{ position: "absolute", left: 150, top: 920 }}>
        <Pill style={{ fontSize: 28 }}>
          <Dot size={12} /> The chair stays full
        </Pill>
      </Rise>
      <div style={{ position: "absolute", left: 1220, top: 180 }}>
        <Rise at={10}>
          <WaPhone h={840}>
            <WaBubble at={0} time="Mon 16:12">
              Hi, is there anything sooner than the 18th? I can come in at short notice.
            </WaBubble>
            <WaBubble out at={0} time="Mon 16:12" read>
              You're on the waitlist, Sarah. I'll message you as soon as something opens up 😊
            </WaBubble>
            <WaBubble out at={cue(BEAT.tueOffer)} time="13:06" read={f >= cue(BEAT.tueReply)}>
              Hi Sarah 👋 A 2pm check-up has come up today with Dr Harris. Would you like it?
            </WaBubble>
            <WaTyping from={cue(BEAT.tueReply) - 30} to={cue(BEAT.tueReply)} />
            <WaBubble at={cue(BEAT.tueReply)} time="13:08">
              Yes please! I can be there 🙌
            </WaBubble>
            <WaBubble out at={cue(BEAT.tueFilled) + 6} time="13:08" read={false}>
              Done ✓ See you at 2pm today.
            </WaBubble>
          </WaPhone>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const Slot: React.FC<{ t: string; n: string; muted?: boolean; cancel: number; filled: number }> = ({ t, n, muted, cancel, filled }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, height: 78, marginBottom: 12 }}>
    <div style={{ width: 80, fontSize: 24, color: C.mute, fontVariantNumeric: "tabular-nums" }}>{t}</div>
    <div style={{ flex: 1, height: "100%", borderRadius: 18, position: "relative", overflow: "hidden", background: muted ? "#F7F8FA" : "#EEF2F7" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 26, fontWeight: 600, color: muted ? C.mute : C.ink, opacity: 1 - cancel }}>{n}</div>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: `3px dashed ${RED}`, background: RED_BG, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 26, fontWeight: 700, color: RED, opacity: cancel * (1 - filled) }}>
        Cancelled · chair empty
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          background: GRAD,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          opacity: filled,
          transform: `scale(${0.9 + 0.1 * filled})`,
          boxShadow: `0 0 ${30 * filled}px ${C.sky}`,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 800 }}>Sarah M. · Check-up</span>
        <span style={{ fontSize: 20, opacity: 0.9 }}>from the waitlist</span>
      </div>
    </div>
  </div>
);

/* 142-152.5s  WEDNESDAY 07:40. The hygienist is off sick; every booked patient is moved. */
const HYGIENE = [
  { t: "08:30", n: "Olivia B.", to: "Thu 08:30", ch: "💬" },
  { t: "09:10", n: "Jack M.", to: "Fri 09:10", ch: "💬" },
  { t: "09:50", n: "Amira H.", to: "Thu 12:10", ch: "✆" },
  { t: "10:30", n: "Leo P.", to: "Mon 10:30", ch: "💬" },
  { t: "11:10", n: "Ruth A.", to: "Fri 11:50", ch: "💬" },
  { t: "13:30", n: "Sophie C.", to: "Thu 15:30", ch: "✆" },
  { t: "14:10", n: "Ian F.", to: "Tue 14:10", ch: "💬" },
  { t: "14:50", n: "Maya N.", to: "Fri 16:10", ch: "💬" },
];

const Wednesday: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const off = useIn(w("wednesday", 2), 14);
  const first = w("wednesday", 6);
  const last = w("wednesday", 20);
  const done = useIn(last + 8, 14);
  return (
    <AbsoluteFill>
      <Chapter day="WEDNESDAY" time="07:40" />
      <Blob x={480} y={560} size={700} intensity={0.35} />
      <div style={{ position: "absolute", left: 150, top: 200, width: 560, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ opacity: off, transform: `translateY(${(1 - off) * 30}px)` }}>
          <div style={{ borderRadius: 28, background: ORANGE_BG, border: `2px solid ${C.orange}55`, padding: "26px 30px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.orange, letterSpacing: 2 }}>STAFF UPDATE · 07:40</div>
            <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>Lucy, hygienist</div>
            <div style={{ fontSize: 30, color: C.mute }}>Off sick today</div>
          </div>
        </div>
        <div style={{ opacity: done, transform: `translateY(${(1 - done) * 20}px)` }}>
          <ResultCard at={last + 8} icon="✓" tone="green" title="All 8 patients moved" detail="Done before the first one left home" w={560} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 790, top: 150 }}>
        <Rise at={8}>
          <GlowCard w={980} h={860} glow={0.4}>
            <div style={{ padding: "30px 36px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 18 }}>Today's hygiene list</div>
              {HYGIENE.map((r, i) => {
                const at = first + ((last - first) * i) / (HYGIENE.length - 1);
                const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
                return (
                  <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 18, height: 80, borderBottom: "1px solid #EEF1F5", fontSize: 26 }}>
                    <div style={{ width: 90, color: C.mute, fontVariantNumeric: "tabular-nums", textDecoration: p > 0.5 ? "line-through" : "none" }}>{r.t}</div>
                    <div style={{ width: 200, fontWeight: 700 }}>{r.n}</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                      <span>{r.ch}</span>
                      <span style={{ color: C.mute }}>moved to</span>
                      <b>{r.to}</b>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: p > 0.5 ? GREEN_BG : "#F2F4F7", color: GREEN, display: "grid", placeItems: "center", fontWeight: 800, transform: `scale(${0.8 + 0.2 * p})` }}>
                      {p > 0.5 ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* 152.5-176.5s  THURSDAY. Two-step confirmation: reminder when booked, WhatsApp two days before, an
   automated call the day before, then flagged to the team. A missed visit is rebooked. */
const Thursday: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const w = useWord();
  const steps = [
    { icon: "🔔", title: "When booked", detail: "Reminder with directions and parking", at: w("thursday", 4), result: "✓ Sent" },
    { icon: "💬", title: "2 days before", detail: "WhatsApp asks Yes or No (SMS optional)", at: w("thursday", 15), result: "No reply" },
    { icon: "✆", title: "1 day before", detail: "No reply? An automated call follows", at: w("thursday", 25), result: "No answer" },
    { icon: "⚑", title: "Still no reply", detail: "Flagged to your team to follow up", at: w("thursday", 33), result: "Flagged" },
  ];
  const X = (i: number) => 230 + i * 470;
  const reached = steps.filter((s) => f >= s.at).length;
  const tokenX = interpolate(f, steps.map((s) => s.at), steps.map((_, i) => X(i)), { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const missed = useIn(w("thursday", 41), 14);
  const rebooked = useIn(cue(BEAT.thuRebook), 12);
  return (
    <AbsoluteFill>
      <Chapter day="THURSDAY" />
      <Blob x={960} y={420} size={820} intensity={0.35} />
      <Center style={{ justifyContent: "flex-start", paddingTop: 140 }}>
        <Words text="Every appointment is confirmed." times={useWordCues()("thursday", 0, 4)} size={64} weight={800} gradientWords={["confirmed."]} />
      </Center>
      <div style={{ position: "absolute", left: X(0), top: 386, width: X(3) - X(0), height: 6, borderRadius: 3, background: "#E3E8EF" }} />
      <div style={{ position: "absolute", left: X(0), top: 386, width: Math.max(0, tokenX - X(0)), height: 6, borderRadius: 3, background: GRAD }} />
      {steps.map((s, i) => {
        const p = useIn(s.at, 14);
        const last = i === steps.length - 1;
        return (
          <div key={s.title} style={{ position: "absolute", left: X(i) - 170, top: 340, width: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                background: i < reached ? (last ? C.orange : C.blue) : "#fff",
                color: i < reached ? "#fff" : C.mute,
                border: `3px solid ${i < reached ? "transparent" : "#E3E8EF"}`,
                display: "grid",
                placeItems: "center",
                fontSize: 40,
                boxShadow: i < reached ? `0 0 30px ${last ? C.orange : C.sky}88` : "none",
                transform: `scale(${0.9 + 0.1 * p})`,
              }}
            >
              {s.icon}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 18, opacity: 0.4 + 0.6 * p }}>{s.title}</div>
            <div style={{ fontSize: 22, color: C.mute, marginTop: 6, lineHeight: 1.35, opacity: 0.4 + 0.6 * p }}>{s.detail}</div>
            <div style={{ marginTop: 14, fontSize: 21, fontWeight: 800, padding: "6px 14px", borderRadius: 999, opacity: p, color: i === 0 ? GREEN : last ? C.orange : C.mute, background: i === 0 ? GREEN_BG : last ? ORANGE_BG : "#F2F4F7" }}>
              {s.result}
            </div>
          </div>
        );
      })}
      {/* the patient travelling the steps */}
      <div style={{ position: "absolute", left: tokenX - 110, top: 290, width: 220, display: "flex", justifyContent: "center", opacity: useIn(w("thursday", 4), 14) }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.navy, background: "#fff", padding: "6px 14px", borderRadius: 999, boxShadow: "0 8px 20px rgba(18,48,79,0.15)", whiteSpace: "nowrap" }}>Mark T. · Fri 09:30</div>
      </div>
      <div style={{ position: "absolute", left: 230, top: 760, display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ opacity: useIn(cue(BEAT.thuFlag), 14), transform: `translateY(${(1 - useIn(cue(BEAT.thuFlag), 14)) * 30}px)` }}>
          <div style={{ width: 620, borderRadius: 22, border: `2px solid ${C.orange}55`, background: ORANGE_BG, padding: "18px 24px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.orange, letterSpacing: 2 }}>PORTAL · NEEDS YOUR TEAM</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>⚑ Mark T. · Fri 09:30 · not confirmed</div>
          </div>
        </div>
        <div style={{ opacity: missed, transform: `translateY(${(1 - missed) * 30}px)` }}>
          <div style={{ width: 760, borderRadius: 22, background: "#fff", boxShadow: "0 16px 44px rgba(18,48,79,0.12)", padding: "18px 24px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: rebooked > 0.5 ? GREEN : RED, letterSpacing: 2 }}>{rebooked > 0.5 ? "REBOOKED · YOUR DNA POLICY" : "MISSED VISIT · DNA"}</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{rebooked > 0.5 ? "Ellie W. · now Mon 11:20" : "Ellie W. · Wed 15:00"}</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: rebooked > 0.5 ? GREEN_BG : RED_BG, color: rebooked > 0.5 ? GREEN : RED, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>
              {rebooked > 0.5 ? "✓" : "!"}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 176.5-197.5s  FRIDAY. Recall day: overdue patients hear from Adele on WhatsApp, by call and by email;
   after a hygiene visit Adele can suggest treatments; lapsed patients get the practice's offer. */
const RECALL = { overdue: 64, whatsapp: 38, call: 16, email: 10, booked: 23 };

const Friday: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const ws = useWordCues();
  const card = useIn(w("friday", 14), 16);
  const lanes = [
    { label: "WhatsApp", icon: "💬", n: RECALL.whatsapp, at: w("friday", 24) },
    { label: "Call", icon: "✆", n: RECALL.call, at: w("friday", 26) },
    { label: "Email", icon: "@", n: RECALL.email, at: w("friday", 29) },
  ];
  const booked = Math.round(interpolate(f, [w("friday", 24), w("friday", 39)], [0, RECALL.booked], { ...clamp, easing: Easing.out(Easing.quad) }));
  return (
    <AbsoluteFill>
      <Chapter day="FRIDAY" time="Recall day" />
      <Blob x={1450} y={560} size={760} intensity={0.4} />
      <div style={{ position: "absolute", left: 120, top: 150, width: 1680 }}>
        <Words text="Recall is where most of your revenue is waiting." times={ws("friday", 5, 14)} size={64} weight={800} gradientWords={["revenue"]} style={{ justifyContent: "flex-start" }} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 300, opacity: card, transform: `translateY(${(1 - card) * 30}px)` }}>
        <GlowCard w={940} h={620} glow={0.4}>
          <div style={{ padding: "30px 36px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.mute, letterSpacing: 2 }}>RECALL CAMPAIGN · EXAMPLE WEEK</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
              <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{RECALL.overdue}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: C.mute }}>patients overdue for check-ups and hygiene</div>
            </div>
            <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
              {lanes.map((l) => {
                const p = interpolate(f, [l.at, l.at + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
                return (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26 }}>
                    <div style={{ width: 210, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {l.icon} {l.label}
                    </div>
                    <div style={{ flex: 1, height: 26, borderRadius: 13, background: "#EEF2F7", overflow: "hidden" }}>
                      <div style={{ width: `${(l.n / RECALL.overdue) * 100 * p}%`, height: "100%", borderRadius: 13, background: GRAD }} />
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{Math.round(l.n * p)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 20, padding: "20px 26px", borderRadius: 22, background: GREEN_BG }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: GREEN, fontVariantNumeric: "tabular-nums", width: 90 }}>{booked}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>booked so far · reported to you</div>
            </div>
          </div>
        </GlowCard>
      </div>
      <div style={{ position: "absolute", left: 1120, top: 330, display: "flex", flexDirection: "column", gap: 24 }}>
        <ResultCard at={w("friday", 30)} icon="✦" title="After hygiene: Emily R." detail="Email suggesting teeth whitening" w={680} />
        <ResultCard at={w("friday", 41)} icon="↻" title="Lapsed 18 months: Paul D." detail="Invited back with your welcome-back offer" tone="orange" w={680} />
      </div>
    </AbsoluteFill>
  );
};

/* 197.5-212.5s  FRIDAY 17:00. The weekly report; then the line the film is built on. */
const Report: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const ws = useWordCues();
  const end = w("report", 17); // "One week."
  const dim = interpolate(f, [end - 6, end + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const channels = [
    { c: "Phone", n: 17 },
    { c: "WhatsApp", n: 12 },
    { c: "Web chat", n: 7 },
    { c: "Email", n: 3 },
    { c: "SMS", n: 2 },
  ];
  const t1 = useIn(w("report", 4), 15);
  const t2 = useIn(w("report", 6), 15);
  const t3 = useIn(w("report", 6) + 8, 15);
  const t4 = useIn(w("report", 11), 15);
  const tile = (p: number): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, borderRadius: 26, padding: "26px 30px", background: "#F4F7FA", height: 310 });
  return (
    <AbsoluteFill>
      <Chapter day="FRIDAY" time="17:00" />
      <AbsoluteFill style={{ filter: `blur(${dim * 14}px)`, opacity: 1 - 0.85 * dim, transform: `scale(${1 - 0.04 * dim})` }}>
        <Blob x={960} y={560} size={800} intensity={0.35} />
        <div style={{ position: "absolute", left: 160, top: 160 }}>
          <Rise at={6}>
            <GlowCard w={1600} h={820} glow={0.35}>
              <div style={{ padding: "34px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
                  <div style={{ fontSize: 38, fontWeight: 800 }}>Practice dashboard</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, background: "#EAF2FA", padding: "6px 16px", borderRadius: 999 }}>Weekly report</div>
                  <div style={{ marginLeft: "auto", fontSize: 22, color: C.mute }}>Example week</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div style={tile(t1)}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>New patient enquiries</div>
                    <div style={{ fontSize: 21, color: C.mute }}>Every enquiry, by channel</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                      {channels.map((c, i) => {
                        const p = interpolate(f, [w("report", 4) + i * 3, w("report", 4) + i * 3 + 20], [0, 1], clamp);
                        return (
                          <div key={c.c} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 21 }}>
                            <div style={{ width: 120 }}>{c.c}</div>
                            <div style={{ height: 18, borderRadius: 9, background: GRAD, width: c.n * 22 * p }} />
                            <div style={{ fontWeight: 800 }}>{Math.round(c.n * p)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={tile(t2)}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Bookings made</div>
                    <div style={{ fontSize: 21, color: C.mute }}>Booked or rebooked by Adele this week</div>
                    <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -5, marginTop: 10, color: C.navy }}>32</div>
                  </div>
                  <div style={tile(t3)}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Chase success rate</div>
                    <div style={{ fontSize: 21, color: C.mute }}>How many follow-ups turn into bookings</div>
                    <div style={{ marginTop: 20, height: 22, borderRadius: 11, background: "#E3E8EF", overflow: "hidden" }}>
                      <div style={{ width: `${62 * t3}%`, height: "100%", background: GRAD }} />
                    </div>
                  </div>
                  <div style={{ ...tile(t4), background: C.navy, color: "#fff" }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Revenue generated</div>
                    <div style={{ fontSize: 21, opacity: 0.75 }}>Value of the bookings Adele made</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 110, marginTop: 16 }}>
                      {[0.35, 0.5, 0.45, 0.7, 1].map((h, i) => (
                        <div key={i} style={{ width: 54, borderRadius: 10, background: i === 4 ? C.orange : "#ffffff55", height: 110 * h * interpolate(f, [w("report", 11) + i * 3, w("report", 11) + i * 3 + 16], [0, 1], clamp) }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </Rise>
        </div>
      </AbsoluteFill>
      {dim > 0 && (
        <Center>
          <Words text="One week." times={ws("report", 17, 19)} size={80} weight={700} color={C.mute} />
          <div style={{ height: 30 }} />
          <Words text="Every call answered." times={ws("report", 19, 22)} size={120} weight={800} />
          <Words text="More chairs filled." times={ws("report", 22, 25)} size={120} weight={800} gradientWords={["More", "chairs", "filled."]} />
        </Center>
      )}
    </AbsoluteFill>
  );
};

/* 212.5-222s  "And you're always in control. Every task runs automatically or manually, your choice, and
   I track your lab work too." */
const Control: React.FC = () => {
  const f = useCurrentFrame();
  const w = useWord();
  const ws = useWordCues();
  const rows = [
    { label: "Missed enquiry follow-up", on: true, at: w("control", 8) },
    { label: "Recall campaigns", on: true, at: w("control", 8) + 6 },
    { label: "Lead chasing", on: false, at: w("control", 10) },
    { label: "Lab work tracking", on: true, at: w("control", 17) },
  ];
  return (
    <AbsoluteFill>
      <Blob x={1350} y={560} size={760} intensity={0.4} />
      <div style={{ position: "absolute", left: 150, top: 300, width: 700 }}>
        <Words text="You stay in control." times={ws("control", 1, 5)} size={92} weight={800} gradientWords={["control."]} style={{ justifyContent: "flex-start" }} />
        <div style={{ height: 30 }} />
        <Words text="Automatic or manual, task by task." times={ws("control", 5, 11)} size={46} weight={600} color={C.mute} style={{ justifyContent: "flex-start" }} />
      </div>
      <div style={{ position: "absolute", left: 960, top: 230 }}>
        <Rise at={6}>
          <GlowCard w={820} h={620} glow={0.45}>
            <div style={{ padding: "34px 40px" }}>
              <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 20 }}>Your rules</div>
              {rows.map((r) => {
                const p = interpolate(f, [r.at, r.at + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
                const on = r.on ? p : 0;
                return (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", height: 100, borderBottom: "1px solid #EEF1F5", fontSize: 30 }}>
                    <div style={{ flex: 1, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 22, color: r.on ? C.blue : C.mute, fontWeight: 700, marginRight: 18, opacity: p }}>{r.on ? "Automatic" : "Manual"}</div>
                    <div style={{ width: 92, height: 52, borderRadius: 26, background: on > 0.5 ? C.blue : "#D5DBE3", position: "relative" }}>
                      <div style={{ position: "absolute", top: 5, left: 5 + 40 * on, width: 42, height: 42, borderRadius: 21, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                );
              })}
              <Rise at={w("control", 17) + 4} dist={14} style={{ marginTop: 22 }}>
                <div style={{ fontSize: 23, color: C.mute }}>
                  Lab work: crown for J. Patel <b style={{ color: GREEN }}>✓ back before Thu 10:00</b>
                </div>
              </Rise>
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* 222-234.5s  "Call recording is yours to control, and I never collect clinical outcome data. We're
   working towards full NHS compliance, with cybersecurity protocols to match." */
const Trust: React.FC = () => {
  const w = useWord();
  const items = [
    { t: "Call recording you control", at: w("trust", 0) },
    { t: "No clinical outcome data collected", at: w("trust", 10) },
    { t: "Follows your rules and policies", at: w("trust", 10) + 14 },
  ];
  const planned = useIn(w("trust", 14), 15);
  return (
    <AbsoluteFill>
      <Blob x={960} y={540} size={820} intensity={0.35} />
      <Center style={{ justifyContent: "flex-start", paddingTop: 130 }}>
        <Rise at={4}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.orange, textAlign: "center" }}>BUILT FOR UK DENTAL PRACTICES</div>
        </Rise>
      </Center>
      <div style={{ position: "absolute", left: 200, top: 300, display: "flex", flexDirection: "column", gap: 26 }}>
        {items.map((it) => (
          <ResultCard key={it.t} at={it.at} icon="✓" tone="green" title={it.t} detail="" w={720} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 1010, top: 300, opacity: planned, transform: `translateY(${(1 - planned) * 30}px)` }}>
        <GlowCard w={720} h={340} glow={0.4}>
          <div style={{ padding: "34px 40px" }}>
            <div style={{ display: "inline-block", fontSize: 22, fontWeight: 800, letterSpacing: 3, color: C.orange, background: ORANGE_BG, padding: "8px 18px", borderRadius: 999 }}>PLANNED</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 20 }}>We're working towards</div>
            {[
              { t: "Full NHS compliance", at: w("trust", 17) },
              { t: "Cybersecurity protocols", at: w("trust", 20) },
            ].map((x) => (
              <Rise key={x.t} at={x.at} dist={16} style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700 }}>
                  <Dot size={16} /> {x.t}
                </div>
              </Rise>
            ))}
          </div>
        </GlowCard>
      </div>
    </AbsoluteFill>
  );
};

/* 234.5-247.5s  "See me on a real practice day. Pilot places from December 2026 are limited. Apply at
   adelecare dot co dot uk." */
const Cta: React.FC = () => {
  const cue = useCue();
  const w = useWord();
  const ws = useWordCues();
  const pilot = useIn(w("cta", 7), 15);
  const apply = useIn(w("cta", 14), 15);
  return (
    <AbsoluteFill>
      <Blob x={960} y={420} size={980} intensity={0.55} />
      <Center style={{ justifyContent: "flex-start", paddingTop: 170 }}>
        <LogoReveal at={cue(234.6)} height={130} />
        <div style={{ height: 60 }} />
        <Words text="See me on a real practice day." times={ws("cta", 0, 7)} size={72} weight={800} gradientWords={["real", "practice", "day."]} />
        <div style={{ height: 50 }} />
        <div style={{ opacity: pilot, transform: `translateY(${(1 - pilot) * 20}px)` }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", background: C.orange, padding: "14px 30px", borderRadius: 999 }}>Pilot places from December 2026 are limited</div>
        </div>
        <div style={{ height: 40 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: apply, transform: `translateY(${(1 - apply) * 20}px)` }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: C.navy }}>adelecare.co.uk</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", background: C.navy, padding: "16px 34px", borderRadius: 999 }}>Apply for a pilot place</div>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

export const DemoScenes: Record<string, React.FC> = {
  open: Open,
  cost: Cost,
  how: How,
  call: Call,
  portal: Portal,
  whatsapp: WhatsAppFirst,
  tuesday: Tuesday,
  wednesday: Wednesday,
  thursday: Thursday,
  friday: Friday,
  report: Report,
  control: Control,
  trust: Trust,
  cta: Cta,
};

/** "Chairs filled this week", top right, counting up as the week's bookings land (an example week). */
export const ChairCounter: React.FC<{ value: number; show: number; bump: number }> = ({ value, show, bump }) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const pulse = spring({ frame: f - bump, fps, config: { damping: 10, stiffness: 160 } });
  const pop = bump > 0 && f >= bump ? 1 + 0.12 * Math.sin(Math.min(1, pulse) * Math.PI) : 1;
  return (
    <div style={{ position: "absolute", right: 70, top: 46, opacity: show, transform: `translateY(${(1 - show) * -20}px)`, fontFamily: FONT, color: C.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 24px", borderRadius: 26, background: "rgba(255,255,255,0.92)", boxShadow: "0 12px 34px rgba(18,48,79,0.14)" }}>
        <div style={{ fontSize: 54, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums", transform: `scale(${pop})`, minWidth: 64, textAlign: "center" }}>{value}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Chairs filled this week</div>
          <div style={{ fontSize: 17, color: C.mute }}>Example week</div>
        </div>
      </div>
    </div>
  );
};
