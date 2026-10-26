import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoReveal, SymbolMark, symbolHeight, wipe, Wordmark } from "./brand";
import { VO } from "./timeline";
import { AppIcon, ICON, LOGO_END } from "./transitions";
import { Blob, Bubble, C, clamp, Dot, GlowCard, GRAD, Pill, Rise, RollList, stepper, useCue, useIn, Words } from "./ui";

// Frame numbers are relative to the scene's sequence start, which begins with its incoming transition.
// `cue(t)` converts an absolute time in seconds (as in timeline.ts) into that frame, so cues stay in sync with the voice.

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

/* 0-5.5s  "Your practice was built on care. Not on answering the phone." */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const swap = cue(2.45);
  const a = interpolate(f, [swap - 8, swap + 4], [1, 0], clamp);
  const grow = interpolate(f, [0, 180], [0.85, 1.12]);
  return (
    <AbsoluteFill>
      <Blob size={1100 * grow} intensity={interpolate(f, [0, 30], [0, 0.9], clamp)} />
      <Center style={{ opacity: a, filter: `blur(${(1 - a) * 12}px)` }}>
        <Words text="Your practice was built on care." at={cue(0.6)} every={4} size={140} gradientWords={["care"]} style={{ maxWidth: 1500 }} />
      </Center>
      {f >= swap - 4 && (
        <Center>
          <Words text="Not on answering" at={swap} every={4} size={140} />
          <Words text="the phone." at={swap + 14} every={5} size={140} />
          <Rise at={cue(3.4)} style={{ marginTop: 50 }}>
            <Ringing at={cue(3.4)} />
          </Rise>
        </Center>
      )}
    </AbsoluteFill>
  );
};

const Ringing: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const shake = Math.sin((f - at) * 1.6) * 6 * (Math.floor((f - at) / 12) % 2 === 0 ? 1 : 0);
  return (
    <Pill style={{ fontSize: 34, transform: `rotate(${shake * 0.4}deg)` }}>
      <span style={{ fontSize: 38, transform: `rotate(${shake}deg)`, display: "inline-block" }}>📞</span>
      Incoming call · Reception
    </Pill>
  );
};

/* 5.5-11.5s  "But the chair is full, the phone keeps ringing, and recalls slip when the team is stretched." */
const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const items = ["Chair is full", "Phone ringing", "Voicemail full", "Recall overdue", "Enquiry missed", "Team stretched"];
  const act = stepper(f, [0, cue(7.0), cue(7.7), cue(8.4), cue(9.0), cue(9.6)], 9);
  const missed = [
    { at: cue(6.3), t: "Missed call", s: "07700 900 412 · 09:12", icon: "✆", red: true },
    { at: cue(6.9), t: "Missed call", s: "07700 900 877 · 09:14", icon: "✆", red: true },
    { at: cue(7.6), t: "Voicemail (3)", s: "Mailbox nearly full", icon: "◉", red: false },
    { at: cue(8.3), t: "Recall overdue", s: "38 patients this month", icon: "!", red: false },
    { at: cue(9.0), t: "New enquiry", s: "Website form · no reply yet", icon: "!", red: false },
  ];
  return (
    <AbsoluteFill>
      <Blob x={1420} y={540} size={700} intensity={0.55} />
      <div style={{ position: "absolute", left: 170, top: 300, width: 820 }}>
        <RollList items={items} active={act} size={84} rowH={100} />
      </div>
      <div style={{ position: "absolute", right: 210, top: 140 }}>
        <Rise at={6}>
          <GlowCard w={520} h={800}>
            <div style={{ padding: "54px 34px", display: "flex", flexDirection: "column", gap: 18, background: `linear-gradient(${C.navy}, ${C.blue})`, height: "100%" }}>
              <div style={{ color: "#fff", fontSize: 96, fontWeight: 600, textAlign: "center", letterSpacing: -3 }}>09:15</div>
              <div style={{ color: "#ffffffaa", fontSize: 26, textAlign: "center", marginTop: -10, marginBottom: 20 }}>Tuesday</div>
              {missed.map((m, i) => (
                <Notification key={i} {...m} />
              ))}
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const Notification: React.FC<{ at: number; t: string; s: string; icon: string; red: boolean }> = ({ at, t, s, icon, red }) => {
  const p = useIn(at, 15);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * -30}px) scale(${0.92 + 0.08 * p})`,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 26,
        padding: "18px 22px",
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: red ? "#FF4D4D" : GRAD, color: "#fff", display: "grid", placeItems: "center", fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{t}</div>
        <div style={{ fontSize: 21, color: C.mute }}>{s}</div>
      </div>
    </div>
  );
};

/* 11.5-18.5s  "Hi, I'm Adele. The AI receptionist for UK dental practices."
   Arrives as the app icon (from shrinkToIcon), opens into the symbol, builds the lockup,
   then hands the symbol back to the centre for the fly-through. */
const LogoScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = useCue();
  const punch = spring({ frame: f - cue(11.5), fps, config: { damping: 9, stiffness: 180 } });
  const iconScale = 1 + 0.07 * Math.sin(Math.min(1, punch) * Math.PI);
  const open = interpolate(f, [cue(11.75), cue(12.65)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lock = interpolate(f, [cue(12.9), cue(13.7)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const word = interpolate(f, [cue(13.05), cue(14.0)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sheen = interpolate(f, [cue(14.1), cue(15.0)], [0, 1], clamp);
  const outro = interpolate(f, [cue(17.0), cue(17.95)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // symbol: inside the icon -> centre (LOGO_END) -> lockup position -> back to centre for the fly-through
  const L = { cx: 458, cy: 470, width: 320 };
  const at = lock * (1 - outro);
  const w = interpolate(open, [0, 1], [ICON.symbol, LOGO_END.width]) + (L.width - LOGO_END.width) * at;
  const cx = LOGO_END.cx + (L.cx - LOGO_END.cx) * at;
  const cy = LOGO_END.cy + (L.cy - LOGO_END.cy) * at;
  const brand = interpolate(open, [0.25, 0.7], [0, 1], clamp);
  const text = word * (1 - outro);
  const s = open < 1 ? iconScale : 1;
  return (
    <AbsoluteFill>
      <Blob x={cx} y={cy} size={760} intensity={0.4 + 0.15 * brand} />
      {open < 1 && (
        <Center>
          <div style={{ transform: `scale(${iconScale * (1 + 0.9 * open)})`, opacity: 1 - open }}>
            <AppIcon />
          </div>
        </Center>
      )}
      <div style={{ position: "absolute", left: cx - w / 2, top: cy - symbolHeight(w) / 2, width: w, height: symbolHeight(w), transform: `scale(${s})` }}>
        <SymbolMark width={w} sheen={sheen} glow={0.25 * brand} style={{ position: "absolute", left: 0, top: 0, opacity: brand }} />
        <SymbolMark width={w} tone="white" style={{ position: "absolute", left: 0, top: 0, opacity: 1 - brand }} />
      </div>
      <div style={{ position: "absolute", left: 298 + 320 + 72, top: 470 - 75, opacity: text, filter: `blur(${(1 - text) * 8}px)` }}>
        <div style={{ ...wipe(word), transform: `translateX(${(1 - word) * -50 - outro * 40}px)` }}>
          <Wordmark height={150} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 640, width: "100%", opacity: 1 - outro, filter: `blur(${outro * 10}px)` }}>
        <Words text="The AI receptionist for UK dental practices." at={cue(13.5)} every={4} size={58} weight={600} gradientWords={["receptionist"]} />
      </div>
    </AbsoluteFill>
  );
};

/* 18.5-35.5s  The hero moment: a patient rings, Adele answers, finds a slot and books it. */
const CALL = VO.filter((v) => v.file.startsWith("call_"));
const TRANSCRIPT: Record<string, { who: "adele" | "patient"; text: string }> = {
  call_a: { who: "adele", text: "Good morning, Riverside Dental. This is Adele, how can I help?" },
  call_b: { who: "patient", text: "Hi, I've cracked a tooth. Could I come in today?" },
  call_c: { who: "adele", text: "Oh no, I'm sorry. I can see you at 2:40 today. Shall I book that?" },
  call_d: { who: "patient", text: "Yes please, perfect." },
};
const ANSWER_AT = 20.2;
const CHECKING_AT = 28.9;
const FOUND_AT = 29.9;
const BOOKED_AT = 33.75;

const Call: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const now = (f - cue(0)) / 30; // absolute seconds
  const speaking = CALL.find((v) => now >= v.at && now < v.at + v.dur);
  const answered = f >= cue(ANSWER_AT);
  const booked = useIn(cue(BOOKED_AT), 14);
  const checking = useIn(cue(CHECKING_AT), 16);
  return (
    <AbsoluteFill>
      <Blob x={560} y={560} size={760} intensity={0.45} />
      <div style={{ position: "absolute", left: 300, top: 80 }}>
        <Rise at={4}>
          <GlowCard w={470} h={880} glow={answered ? 0.9 : 0.5}>
            <div style={{ height: "100%", background: `linear-gradient(170deg, ${C.navy}, ${C.blue} 70%, ${C.sky})`, color: "#fff", position: "relative" }}>
              {!answered ? <IncomingCall answerAt={cue(ANSWER_AT)} /> : <OnCall speaking={speaking?.file} since={cue(ANSWER_AT)} booked={booked} />}
            </div>
          </GlowCard>
        </Rise>
      </div>
      <Rise at={cue(19.4)} style={{ position: "absolute", left: 300, top: 990, width: 470, display: "flex", justifyContent: "center" }}>
        <Pill style={{ fontSize: 26, padding: "10px 22px" }}>
          <Dot size={12} /> {answered ? "Adele answered on the 2nd ring" : "A patient is calling"}
        </Pill>
      </Rise>

      <div style={{ position: "absolute", left: 900, top: 110, width: 820, display: "flex", flexDirection: "column", gap: 18 }}>
        <Rise at={cue(20.0)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 700, color: C.mute, letterSpacing: 2, textTransform: "uppercase" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FF4D4D", opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 10)) }} />
            Live call transcript
          </div>
        </Rise>
        {CALL.map((v) => (
          <React.Fragment key={v.file}>
            <TypedBubble at={cue(v.at)} dur={v.dur} {...TRANSCRIPT[v.file]} />
            {v.file === "call_b" && (
              <div style={{ height: 64 * checking, opacity: checking, overflow: "hidden" }}>
                <Pill style={{ fontSize: 24, padding: "10px 20px", color: C.blue, background: "#EEF5FB", boxShadow: "none" }}>
                  <Spinner done={f >= cue(FOUND_AT)} /> {f >= cue(FOUND_AT) ? "14:40 with Dr Shah is free" : "Checking today's diary…"}
                </Pill>
              </div>
            )}
          </React.Fragment>
        ))}
        <div style={{ opacity: booked, transform: `translateY(${(1 - booked) * 30}px) scale(${0.96 + 0.04 * booked})`, marginTop: 8 }}>
          <GlowCard w={820} h={150} glow={0.5 * booked}>
            <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 24, padding: "0 32px" }}>
              <div style={{ width: 76, height: 76, borderRadius: 38, background: "#DDF7E8", color: "#127A43", display: "grid", placeItems: "center", fontSize: 40, fontWeight: 800 }}>✓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 800 }}>Booked · Today 14:40</div>
                <div style={{ fontSize: 24, color: C.mute }}>Dr Shah · Emergency appointment</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <Pill style={{ fontSize: 20, padding: "6px 14px", boxShadow: "none", background: "#F2F5F9" }}>✓ In your PMS</Pill>
                <Pill style={{ fontSize: 20, padding: "6px 14px", boxShadow: "none", background: "#F2F5F9" }}>✓ SMS sent</Pill>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Spinner: React.FC<{ done: boolean }> = ({ done }) => {
  const f = useCurrentFrame();
  if (done) return <span style={{ color: "#127A43", fontWeight: 800 }}>✓</span>;
  return <div style={{ width: 20, height: 20, borderRadius: 10, border: `3px solid ${C.sky}44`, borderTopColor: C.blue, transform: `rotate(${f * 12}deg)` }} />;
};

/** Transcript bubble that types itself in word by word across the length of the spoken line. */
const TypedBubble: React.FC<{ at: number; dur: number; who: "adele" | "patient"; text: string }> = ({ at, dur, who, text }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const n = Math.ceil(interpolate(f, [at, at + dur * 30 * 0.92], [0, words.length], clamp));
  if (f < at) return null;
  return (
    <Bubble from={who} at={at} size={32}>
      <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.6, marginBottom: 4 }}>{who === "adele" ? "Adele" : "Patient"}</div>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0 }}>
          {w}{" "}
        </span>
      ))}
    </Bubble>
  );
};

/** Incoming call screen; the accept button pulses and Adele picks up. */
const IncomingCall: React.FC<{ answerAt: number }> = ({ answerAt }) => {
  const f = useCurrentFrame();
  const press = interpolate(f, [answerAt - 8, answerAt - 3, answerAt], [1, 0.86, 1], clamp);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 110 }}>
      <div style={{ fontSize: 24, opacity: 0.75, letterSpacing: 1 }}>Riverside Dental · Main line</div>
      <div style={{ fontSize: 54, fontWeight: 700, marginTop: 16, letterSpacing: -1 }}>07700 900 412</div>
      <div style={{ fontSize: 26, opacity: 0.75, marginTop: 6 }}>incoming call…</div>
      <div style={{ position: "relative", width: 220, height: 220, marginTop: 90, display: "grid", placeItems: "center" }}>
        {[0, 1, 2].map((i) => {
          const ph = ((f + i * 14) % 42) / 42;
          return <div key={i} style={{ position: "absolute", width: 120 + 160 * ph, height: 120 + 160 * ph, borderRadius: "50%", border: "2px solid #ffffff", opacity: 0.5 * (1 - ph) }} />;
        })}
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "#ffffff22", display: "grid", placeItems: "center", fontSize: 54 }}>👤</div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        <div style={{ width: 100, height: 100, borderRadius: 50, background: "#FF4D4D", display: "grid", placeItems: "center", fontSize: 44, transform: "rotate(135deg)" }}>✆</div>
        <div style={{ width: 100, height: 100, borderRadius: 50, background: "#34C759", display: "grid", placeItems: "center", fontSize: 44, transform: `scale(${press * (1 + 0.06 * Math.sin(f / 4))})`, boxShadow: "0 0 30px #34C75988" }}>✆</div>
      </div>
    </div>
  );
};

/** In-call screen: Adele's symbol with a live waveform that follows whoever is speaking. */
const OnCall: React.FC<{ speaking?: string; since: number; booked: number }> = ({ speaking, since, booked }) => {
  const f = useCurrentFrame();
  const secs = Math.floor((f - since) / 30);
  const who = speaking ? TRANSCRIPT[speaking].who : undefined;
  const p = useIn(since, 14);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 90, opacity: p }}>
      <div style={{ fontSize: 24, opacity: 0.75 }}>On call · 00:{String(secs).padStart(2, "0")}</div>
      <div
        style={{
          marginTop: 70,
          width: 200,
          height: 200,
          borderRadius: 100,
          background: "#ffffff18",
          display: "grid",
          placeItems: "center",
          boxShadow: who === "adele" ? `0 0 ${40 + 20 * Math.sin(f / 3)}px #ffffff55` : "none",
        }}
      >
        <SymbolMark width={130} tone="white" />
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 28 }}>Adele</div>
      <div style={{ fontSize: 24, opacity: 0.75 }}>AI receptionist</div>
      <div style={{ display: "flex", gap: 7, alignItems: "center", height: 140, marginTop: 50 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const amp = who ? Math.abs(Math.sin(f / 3.2 + i * 0.75) * Math.sin(f / 7.5 + i * 0.33)) : 0.04;
          return <div key={i} style={{ width: 9, borderRadius: 5, background: who === "patient" ? "#ffffffaa" : "#fff", height: 12 + 120 * amp * (who === "patient" ? 0.7 : 1) }} />;
        })}
      </div>
      <div style={{ fontSize: 24, opacity: 0.8, height: 30 }}>{who === "adele" ? "Adele speaking" : who === "patient" ? "Patient speaking" : booked > 0 ? "" : "Listening…"}</div>
      <div style={{ marginTop: 30, opacity: booked, transform: `scale(${0.9 + 0.1 * booked})` }}>
        <Pill style={{ background: "#E9FBF1", color: "#127A43", fontSize: 26, boxShadow: "none" }}>✓ Appointment booked</Pill>
      </div>
    </div>
  );
};

/* 35.5-42.5s  "I answer calls, WhatsApp and web chat, and book straight into your PMS." */
const Hub: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const cx = 860;
  const cy = 560;
  const chans = ["📞 Calls", "💬 WhatsApp", "🌐 Web chat", "✉️ Email", "📱 SMS"];
  const pms = useIn(cue(39.0), 14);
  const flow = (f % 40) / 40;
  return (
    <AbsoluteFill>
      <Rise at={0} style={{ position: "absolute", top: 90, width: "100%" }}>
        <Words text="One assistant. Every channel." at={4} every={5} size={80} gradientWords={["One"]} />
      </Rise>
      <div
        style={{
          position: "absolute",
          left: cx - 210,
          top: cy - 210,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #CFE6F6 0%, ${C.sky} 30%, ${C.blue} 65%, ${C.navy} 100%)`,
          boxShadow: `0 0 120px ${C.sky}aa`,
          transform: `scale(${0.95 + 0.04 * Math.sin(f / 10)})`,
        }}
      />
      <div style={{ position: "absolute", left: cx - 110, top: cy - symbolHeight(220) / 2 }}>
        <SymbolMark width={220} tone="white" />
      </div>
      {chans.map((c, i) => (
        <Orbit key={c} label={c} i={i} n={chans.length} cx={cx} cy={cy} at={cue(36.4) + i * 7} />
      ))}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <defs>
          <linearGradient id="fl" x1="0" x2="1">
            <stop offset="0" stopColor={C.sky} />
            <stop offset="1" stopColor={C.orange} />
          </linearGradient>
        </defs>
        <path d={`M ${cx + 220} ${cy} C 1300 ${cy}, 1320 ${cy}, 1450 ${cy}`} stroke="url(#fl)" strokeWidth={8} fill="none" strokeDasharray="22 18" strokeDashoffset={-flow * 160} opacity={pms} />
      </svg>
      <div style={{ position: "absolute", left: 1460, top: cy - 140, opacity: pms, transform: `translateX(${(1 - pms) * 60}px)` }}>
        <GlowCard w={330} h={280} glow={0.5}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ fontSize: 64 }}>🗂️</div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>Your PMS</div>
            <div style={{ fontSize: 22, color: C.mute }}>Bookings · notes · payments</div>
          </div>
        </GlowCard>
      </div>
    </AbsoluteFill>
  );
};

const Orbit: React.FC<{ label: string; i: number; n: number; cx: number; cy: number; at: number }> = ({ label, i, n, cx, cy, at }) => {
  const f = useCurrentFrame();
  const p = useIn(at, 14);
  const ang = (i / n) * Math.PI * 2 + f * 0.006 - Math.PI / 2;
  const r = 380 * p;
  return (
    <div style={{ position: "absolute", left: cx + Math.cos(ang) * r * 1.15, top: cy + Math.sin(ang) * r * 0.78, transform: "translate(-50%,-50%)", opacity: p }}>
      <Pill>{label}</Pill>
    </div>
  );
};

/* 42.5-50.5s  "I ask every patient to confirm. Your team only steps in if there's no reply." */
const Confirm: React.FC = () => {
  const cue = useCue();
  const rows = [
    { at: cue(43.3), n: "Emma R.", d: "Thu 15:40 · Check-up", s: "Confirmed", ok: true },
    { at: cue(43.8), n: "James T.", d: "Thu 16:20 · Hygiene", s: "Confirmed", ok: true },
    { at: cue(44.3), n: "Aisha K.", d: "Fri 09:00 · Filling", s: "Confirmed", ok: true },
    { at: cue(44.8), n: "Tom W.", d: "Fri 10:20 · Check-up", s: "Rebooked to Mon", ok: true },
    { at: cue(45.9), n: "Priya S.", d: "Fri 11:40 · Crown fit", s: "No reply · team alerted", ok: false },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 330, width: 700 }}>
        <Words text="Every patient asked." at={cue(43.1)} every={5} size={92} style={{ justifyContent: "flex-start" }} />
        <div style={{ height: 30 }} />
        <Words text="Only exceptions reach your team." at={cue(45.8)} every={4} size={56} weight={600} color={C.mute} gradientWords={["exceptions"]} style={{ justifyContent: "flex-start" }} />
      </div>
      <div style={{ position: "absolute", right: 170, top: 170 }}>
        <Rise at={0}>
          <GlowCard w={860} h={740}>
            <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 10 }}>Confirmations · tomorrow</div>
              {rows.map((r) => (
                <ConfirmRow key={r.n} {...r} />
              ))}
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const ConfirmRow: React.FC<{ at: number; n: string; d: string; s: string; ok: boolean }> = ({ at, n, d, s, ok }) => {
  const p = useIn(at, 15);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "20px 22px",
        borderRadius: 22,
        background: ok ? "#F7F7FA" : "#FFF2E8",
        border: ok ? "2px solid transparent" : `2px solid ${C.orange}`,
      }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 28, background: ok ? "#DDF7E8" : "#FFE1CC", display: "grid", placeItems: "center", fontSize: 28, color: ok ? "#127A43" : "#B4500A", fontWeight: 800 }}>
        {ok ? "✓" : "!"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{n}</div>
        <div style={{ fontSize: 22, color: C.mute }}>{d}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: ok ? "#127A43" : "#B4500A" }}>{s}</div>
    </div>
  );
};

/* 50.5-57.5s  "And I work your patient list too. Missed enquiries, recalls, and lapsed patients." */
const ListScene: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const items = [
    "Checking today's diary",
    "Calling back missed enquiries",
    "Sending recall invites",
    "Welcoming back lapsed patients",
    "Following up treatment plans",
    "Filling a cancellation",
  ];
  const act = stepper(f, [0, cue(52.9), cue(53.9), cue(54.6), cue(55.8), cue(56.6)], 10);
  return (
    <AbsoluteFill>
      <Blob x={1500} y={300} size={520} intensity={0.35} />
      <Blob x={360} y={850} size={480} intensity={0.3} />
      <Center>
        <div style={{ width: 1700 }}>
          <RollList items={items} active={act} size={84} rowH={112} align="center" />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* 57.5-67s  "See me on a real practice day. Apply for a pilot place at adelecare.co.uk." */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCue();
  const typed = "adelecare.co.uk";
  const n = Math.floor(interpolate(f, [cue(61.5), cue(63.0)], [0, typed.length], clamp));
  const pill = useIn(cue(59.6), 14);
  const press = interpolate(f, [cue(63.2), cue(63.45), cue(63.75)], [1, 0.9, 1], clamp);
  const outro = useIn(cue(63.7), 16);
  const url = useIn(cue(65.0), 16);
  return (
    <AbsoluteFill>
      <Blob size={1000} intensity={interpolate(f, [0, 30, cue(63.5), cue(64.5)], [0.2, 0.85, 0.85, 0.3], clamp)} />
      <Center style={{ opacity: 1 - outro, filter: `blur(${outro * 14}px)` }}>
        <Words text="See Adele on a real practice day." at={cue(58.2)} every={5} size={100} gradientWords={["real"]} style={{ maxWidth: 1800 }} />
        <div style={{ height: 70 }} />
        <div
          style={{
            opacity: pill,
            transform: `translateY(${(1 - pill) * 40}px) scale(${0.9 + 0.1 * pill})`,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "16px 16px 16px 44px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(18,48,79,0.18), inset 0 0 0 2px #ffffffaa",
            width: 760,
          }}
        >
          <span style={{ flex: 1, fontSize: 48, fontWeight: 600 }}>
            {typed.slice(0, n)}
            <span style={{ opacity: f % 30 < 15 && n < typed.length ? 1 : 0 }}>|</span>
          </span>
          <div style={{ padding: "18px 30px", borderRadius: 999, background: C.ink, color: "#fff", fontSize: 30, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${press})` }}>
            Apply for a pilot →
          </div>
        </div>
      </Center>
      {f >= cue(63.6) && (
        <Center>
          <LogoReveal at={cue(63.7)} height={120} />
          <div style={{ marginTop: 44, fontSize: 40, fontWeight: 600, color: C.mute, opacity: url, transform: `translateY(${(1 - url) * 16}px)` }}>adelecare.co.uk</div>
        </Center>
      )}
    </AbsoluteFill>
  );
};

export const Scenes: Record<string, React.FC> = {
  intro: Intro,
  problem: Problem,
  logo: LogoScene,
  call: Call,
  hub: Hub,
  confirm: Confirm,
  list: ListScene,
  cta: Cta,
};
