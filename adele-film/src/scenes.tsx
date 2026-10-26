import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  Blob,
  Bubble,
  C,
  clamp,
  Dot,
  GlowCard,
  GRAD,
  Logo,
  Pill,
  Rise,
  RollList,
  stepper,
  Typing,
  useFrame,
  useIn,
  Words,
} from "./ui";

// All frame numbers below are on the scene's own clock (30fps, scaled by its speed in timeline.ts).

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

/* 0-5.5s  "Your practice was built on care. Not on answering the phone." */
const Intro: React.FC = () => {
  const f = useFrame();
  const swap = 105;
  const a = interpolate(f, [swap - 8, swap + 4], [1, 0], clamp);
  const grow = interpolate(f, [0, 240], [0.85, 1.15]);
  return (
    <AbsoluteFill>
      <Blob size={1100 * grow} intensity={interpolate(f, [0, 30], [0, 0.9], clamp)} />
      <Center style={{ opacity: a, filter: `blur(${(1 - a) * 12}px)` }}>
        <Words text="Your practice was built on care." at={30} every={5} size={140} gradientWords={["care"]} style={{ maxWidth: 1500 }} />
      </Center>
      {f >= swap - 4 && (
        <Center>
          <Words text="Not on answering" at={swap} every={4} size={140} />
          <Words text="the phone." at={swap + 18} every={5} size={140} color={C.ink} />
          <Rise at={swap + 40} style={{ marginTop: 50 }}>
            <Ringing at={swap + 40} />
          </Rise>
        </Center>
      )}
    </AbsoluteFill>
  );
};

const Ringing: React.FC<{ at: number }> = ({ at }) => {
  const f = useFrame();
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
  const f = useFrame();
  const items = ["Chair is full", "Phone ringing", "Voicemail full", "Recall overdue", "Enquiry missed", "Team stretched"];
  const act = stepper(f, [0, 52, 84, 112, 140, 178], 9);
  const missed = [
    { at: 40, t: "Missed call", s: "07700 900 412 · 09:12" },
    { at: 70, t: "Missed call", s: "07700 900 877 · 09:14" },
    { at: 100, t: "Voicemail (3)", s: "Mailbox nearly full" },
    { at: 130, t: "Recall overdue", s: "38 patients this month" },
    { at: 165, t: "New enquiry", s: "Website form · no reply yet" },
  ];
  return (
    <AbsoluteFill>
      <Blob x={1420} y={540} size={700} intensity={0.55} />
      <div style={{ position: "absolute", left: 170, top: 300, width: 820 }}>
        <RollList items={items} active={act} size={84} rowH={100} />
      </div>
      <div style={{ position: "absolute", right: 210, top: 140 }}>
        <Rise at={10}>
          <GlowCard w={520} h={800}>
            <div style={{ padding: "54px 34px", display: "flex", flexDirection: "column", gap: 18, background: `linear-gradient(${C.navy}, ${C.blue})`, height: "100%" }}>
              <div style={{ color: "#fff", fontSize: 96, fontWeight: 600, textAlign: "center", letterSpacing: -3 }}>09:15</div>
              <div style={{ color: "#ffffffaa", fontSize: 26, textAlign: "center", marginTop: -10, marginBottom: 20 }}>Tuesday</div>
              {missed.map((m, i) => {
                const p = useIn(m.at, 15);
                return (
                  <div
                    key={i}
                    style={{
                      opacity: p,
                      transform: `translateY(${(1 - p) * -30}px) scale(${0.92 + 0.08 * p})`,
                      background: "rgba(255,255,255,0.88)",
                      borderRadius: 26,
                      padding: "18px 22px",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: i < 2 ? "#FF4D4D" : GRAD, color: "#fff", display: "grid", placeItems: "center", fontSize: 28 }}>
                      {i < 2 ? "✆" : i === 2 ? "◉" : "!"}
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 700 }}>{m.t}</div>
                      <div style={{ fontSize: 21, color: C.mute }}>{m.s}</div>
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

/* 11.5-17.5s  "Meet Adele. The AI receptionist for UK dental practices." */
const LogoScene: React.FC = () => {
  const f = useFrame();
  const burst = interpolate(f, [0, 40, 90], [0.3, 1.4, 0.75], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lp = useIn(28, 13);
  return (
    <AbsoluteFill>
      <Blob size={900 * burst} intensity={interpolate(f, [0, 20, 70, 110], [0, 1, 1, 0.35], clamp)} spin={1.6} />
      <Center>
        <div style={{ transform: `scale(${0.7 + 0.3 * lp})`, opacity: lp, filter: `blur(${(1 - lp) * 20}px)` }}>
          <Logo size={200} />
        </div>
        <div style={{ height: 50 }} />
        <Words text="The AI receptionist for UK dental practices." at={62} every={4} size={58} weight={600} gradientWords={["receptionist"]} />
      </Center>
    </AbsoluteFill>
  );
};

/* 17.5-23.5s  "She answers calls, WhatsApp and web chat, in a warm, natural voice." */
const Channels: React.FC = () => {
  const f = useFrame();
  const starts = [0, 70, 100];
  const act = stepper(f, starts, 10);
  const idx = Math.round(act);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 200, top: 290, width: 760 }}>
        <RollList items={["Calls", "WhatsApp", "Web chat", "Calls"]} active={act} size={110} rowH={130} />
      </div>
      <div style={{ position: "absolute", right: 220, top: 160 }}>
        <Rise at={6}>
          <GlowCard w={620} h={760}>
            {idx === 0 && <CallUI />}
            {idx === 1 && <WhatsAppUI start={starts[1]} />}
            {idx === 2 && <WebChatUI start={starts[2]} />}
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const CallUI: React.FC = () => {
  const f = useFrame();
  const secs = 12 + Math.floor(f / 30);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <Logo size={64} />
      <div style={{ fontSize: 30, color: C.mute }}>On a call · 00:{String(secs).padStart(2, "0")}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", height: 160 }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              borderRadius: 5,
              background: GRAD,
              height: 20 + 120 * Math.abs(Math.sin(f / 4 + i * 0.7) * Math.sin(f / 9 + i * 0.3)),
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, textAlign: "center", padding: "0 50px", lineHeight: 1.35 }}>
        “Good morning, Riverside Dental. This is Adele, how can I help?”
      </div>
    </div>
  );
};

const ChatFrame: React.FC<{ title: string; sub: string; head: string; children: React.ReactNode }> = ({ title, sub, head, children }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{ background: head, color: "#fff", padding: "30px 32px", display: "flex", gap: 18, alignItems: "center" }}>
      <div style={{ width: 58, height: 58, borderRadius: 29, background: "#ffffff33", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>a</div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 22, opacity: 0.85 }}>{sub}</div>
      </div>
    </div>
    <div style={{ flex: 1, padding: 30, display: "flex", flexDirection: "column", gap: 16, justifyContent: "flex-end" }}>{children}</div>
  </div>
);

const WhatsAppUI: React.FC<{ start: number }> = ({ start }) => (
  <ChatFrame title="Riverside Dental" sub="online" head="#128C7E">
    <Bubble from="patient" at={start + 2}>Hi, I've chipped a tooth 😬 any chance today?</Bubble>
    <Bubble from="adele" at={start + 18}>So sorry to hear that! I have 16:30 today with Dr Shah. Shall I book it?</Bubble>
  </ChatFrame>
);

const WebChatUI: React.FC<{ start: number }> = ({ start }) => {
  const f = useFrame();
  return (
    <ChatFrame title="Chat with Adele" sub="Riverside Dental · replies instantly" head={GRAD}>
      <Bubble from="patient" at={start + 2}>Do you do Invisalign consultations?</Bubble>
      {f < start + 26 ? f > start + 10 && <Typing /> : <Bubble from="adele" at={start + 26}>We do! Free 30-minute consultations. Would you like the next available?</Bubble>}
    </ChatFrame>
  );
};

/* 23.5-29.5s  "She books straight into your diary, follows your booking rules, and takes the deposit." */
const Booking: React.FC = () => {
  const f = useFrame();
  const slot = useIn(150, 14);
  const paid = useIn(205, 12);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const times = ["09:00", "10:20", "11:40", "14:00", "15:40", "17:00"];
  const busy = new Set(["0-0", "0-2", "1-1", "1-3", "2-0", "2-4", "3-1", "3-2", "4-0", "4-3", "4-5", "1-5", "2-2"]);
  const rules = ["Check-up · 30 min", "New patients: deposit", "Dr Shah: no Weds"];
  return (
    <AbsoluteFill>
      <Blob x={620} y={560} size={650} intensity={0.45} />
      <div style={{ position: "absolute", left: 150, top: 150, width: 640, display: "flex", flexDirection: "column", gap: 18 }}>
        <Bubble from="patient" at={8}>Can I book a check-up next week?</Bubble>
        {f > 24 && f < 44 ? <Typing /> : null}
        <Bubble from="adele" at={44}>Of course. Tuesday 10:20 or Thursday 15:40?</Bubble>
        <Bubble from="patient" at={92}>Thursday please!</Bubble>
        <Bubble from="adele" at={130}>Booked ✓ I've sent a link for your deposit.</Bubble>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
          {rules.map((r, i) => (
            <Rise key={r} at={60 + i * 10} dist={20}>
              <Pill style={{ fontSize: 24, padding: "10px 18px" }}>
                <Dot size={12} />
                {r}
              </Pill>
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 150, top: 170 }}>
        <Rise at={0}>
          <GlowCard w={900} h={740} glow={0.6}>
            <div style={{ padding: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>Diary · next week</div>
                <div style={{ opacity: paid, transform: `scale(${0.8 + 0.2 * paid})` }}>
                  <Pill style={{ background: "#E9FBF1", color: "#127A43", fontSize: 24, padding: "10px 18px", boxShadow: "none" }}>✓ Deposit paid</Pill>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "90px repeat(5, 1fr)", gap: 10 }}>
                <div />
                {days.map((d) => (
                  <div key={d} style={{ fontSize: 24, fontWeight: 700, color: C.mute, textAlign: "center" }}>
                    {d}
                  </div>
                ))}
                {times.map((t, ti) => (
                  <React.Fragment key={t}>
                    <div style={{ fontSize: 22, color: C.mute, alignSelf: "center" }}>{t}</div>
                    {days.map((_, di) => {
                      const target = di === 3 && ti === 4;
                      const isBusy = busy.has(`${di}-${ti}`);
                      return (
                        <div key={di} style={{ height: 82, borderRadius: 14, background: isBusy ? "#ECEBF2" : "#F8F8FB", position: "relative", overflow: "hidden" }}>
                          {target && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: GRAD,
                                color: "#fff",
                                padding: "10px 12px",
                                fontSize: 19,
                                fontWeight: 700,
                                lineHeight: 1.2,
                                opacity: slot,
                                transform: `scale(${0.6 + 0.4 * slot})`,
                                boxShadow: `0 0 ${30 * slot}px ${C.pink}`,
                              }}
                            >
                              Check-up
                              <br />
                              <span style={{ fontWeight: 500 }}>Emma R.</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </GlowCard>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* 29.5-35.5s  "Every channel runs through one assistant, and straight into your PMS." */
const Hub: React.FC = () => {
  const f = useFrame();
  const cx = 860;
  const cy = 560;
  const chans = ["📞 Calls", "💬 WhatsApp", "🌐 Web chat", "✉️ Email", "📱 SMS"];
  const pms = useIn(120, 14);
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
          transform: `scale(${0.95 + 0.04 * Math.sin(f / 10)}) rotate(${f * 0.6}deg)`,
          filter: "blur(2px)",
        }}
      />
      <div style={{ position: "absolute", left: cx - 200, top: cy - 34, width: 400, display: "flex", justifyContent: "center" }}>
        <Logo size={62} dark />
      </div>
      {chans.map((c, i) => {
        const p = useIn(14 + i * 8, 14);
        const ang = (i / chans.length) * Math.PI * 2 + f * 0.006 - Math.PI / 2;
        const r = 380 * p;
        return (
          <div key={c} style={{ position: "absolute", left: cx + Math.cos(ang) * r * 1.15, top: cy + Math.sin(ang) * r * 0.78, transform: "translate(-50%,-50%)", opacity: p }}>
            <Pill>{c}</Pill>
          </div>
        );
      })}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <defs>
          <linearGradient id="fl" x1="0" x2="1">
            <stop offset="0" stopColor={C.pink} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
        </defs>
        <path d={`M ${cx + 220} ${cy} C 1300 ${cy}, 1320 ${cy}, 1450 ${cy}`} stroke="url(#fl)" strokeWidth={8} fill="none" strokeDasharray="22 18" strokeDashoffset={-flow * 40 * 4} opacity={pms} />
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

/* 35.5-43.5s  "She asks every patient to confirm. Your team only steps in if there's still no reply." */
const Confirm: React.FC = () => {
  const rows = [
    { at: 16, n: "Emma R.", d: "Thu 15:40 · Check-up", s: "Confirmed", ok: true },
    { at: 30, n: "James T.", d: "Thu 16:20 · Hygiene", s: "Confirmed", ok: true },
    { at: 44, n: "Aisha K.", d: "Fri 09:00 · Filling", s: "Confirmed", ok: true },
    { at: 58, n: "Tom W.", d: "Fri 10:20 · Check-up", s: "Rebooked to Mon", ok: true },
    { at: 120, n: "Priya S.", d: "Fri 11:40 · Crown fit", s: "No reply · team alerted", ok: false },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 330, width: 700 }}>
        <Words text="Every patient asked." at={8} every={5} size={92} style={{ justifyContent: "flex-start" }} />
        <div style={{ height: 30 }} />
        <Words text="Only exceptions reach your team." at={118} every={4} size={56} weight={600} color={C.mute} gradientWords={["exceptions"]} style={{ justifyContent: "flex-start" }} />
      </div>
      <div style={{ position: "absolute", right: 170, top: 170 }}>
        <Rise at={0}>
          <GlowCard w={860} h={740}>
            <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 10 }}>Confirmations · tomorrow</div>
              {rows.map((r) => {
                const p = useIn(r.at, 15);
                return (
                  <div
                    key={r.n}
                    style={{
                      opacity: p,
                      transform: `translateY(${(1 - p) * 30}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      padding: "20px 22px",
                      borderRadius: 22,
                      background: r.ok ? "#F7F7FA" : "#FFF2E8",
                      border: r.ok ? "2px solid transparent" : `2px solid ${C.orange}`,
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 28, background: r.ok ? "#DDF7E8" : "#FFE1CC", display: "grid", placeItems: "center", fontSize: 28, color: r.ok ? "#127A43" : "#B4500A", fontWeight: 800 }}>
                      {r.ok ? "✓" : "!"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{r.n}</div>
                      <div style={{ fontSize: 22, color: C.mute }}>{r.d}</div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: r.ok ? "#127A43" : "#B4500A" }}>{r.s}</div>
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

/* 43.5-49.5s  "And she works your patient list too. Missed enquiries, recalls, and lapsed patients." */
const ListScene: React.FC = () => {
  const f = useFrame();
  const items = [
    "Checking today's diary",
    "Calling back missed enquiries",
    "Sending recall invites",
    "Welcoming back lapsed patients",
    "Following up treatment plans",
    "Filling a cancellation",
  ];
  const act = stepper(f, [0, 66, 98, 122, 175, 222], 10);
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

/* 49.5-60s  "See Adele on a real practice day. Apply for a pilot place at adelecare.co.uk." */
const Cta: React.FC = () => {
  const f = useFrame();
  const typed = "adelecare.co.uk";
  const n = Math.floor(interpolate(f, [120, 170], [0, typed.length], clamp));
  const pill = useIn(105, 14);
  const press = interpolate(f, [205, 212, 222], [1, 0.9, 1], clamp);
  const outro = useIn(250, 16);
  return (
    <AbsoluteFill>
      <Blob size={1000} intensity={interpolate(f, [0, 30, 240, 280], [0.2, 0.85, 0.85, 0.25], clamp)} />
      <Center style={{ opacity: 1 - outro, filter: `blur(${outro * 14}px)` }}>
        <Words text="See Adele on a real practice day." at={20} every={5} size={100} gradientWords={["real"]} style={{ maxWidth: 1800 }} />
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
            boxShadow: "0 20px 60px rgba(40,10,60,0.18), inset 0 0 0 2px #ffffffaa",
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
      <Center style={{ opacity: outro, transform: `scale(${0.9 + 0.1 * outro})` }}>
        <Logo size={180} />
        <div style={{ marginTop: 34, fontSize: 40, fontWeight: 600, color: C.mute }}>adelecare.co.uk</div>
      </Center>
    </AbsoluteFill>
  );
};

export const Scenes: Record<string, React.FC> = {
  intro: Intro,
  problem: Problem,
  logo: LogoScene,
  channels: Channels,
  booking: Booking,
  hub: Hub,
  confirm: Confirm,
  list: ListScene,
  cta: Cta,
};
