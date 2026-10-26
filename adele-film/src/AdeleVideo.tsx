import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Scenes } from "./scenes";
import { cardLift, focusPull, irisFrom, logoFlyThrough, push, shrinkToIcon, type Transition, zoomThrough } from "./transitions";
import { C, FONT, SceneStart } from "./ui";
import { FPS, SCENES, SFX, TOTAL, VO } from "./timeline";

// One transition per cut, in order. Each is centred on its cut unless `anchor` says otherwise.
const TRANSITIONS: Transition[] = [
  { at: 5.5, frames: 18, Pres: zoomThrough(960, 716) }, // into the ringing phone pill
  { at: 12.5, frames: 22, anchor: 1, Pres: shrinkToIcon }, // the busy day collapses into the app icon on the drop
  { at: 19.5, frames: 26, Pres: logoFlyThrough }, // fly through the symbol into the phone call
  { at: 38.5, frames: 16, Pres: push("x") }, // swipe across to WhatsApp
  { at: 52.5, frames: 24, Pres: cardLift },
  { at: 59.5, frames: 22, Pres: irisFrom(860, 560) }, // opens from the centre of the hub sphere
  { at: 67, frames: 16, Pres: push("y") }, // rises into the rolling list
  { at: 74, frames: 30, Pres: focusPull }, // soft focus into the music's breakdown
  { at: 80.5, frames: 18, Pres: zoomThrough(960, 330) }, // through the clock on the final drop
];

// Music sits around 0.32 and ducks to 0.12 while anyone is speaking.
const musicVolume = (f: number) => {
  const t = f / FPS;
  let duck = 0;
  for (const v of VO) {
    duck = Math.max(
      duck,
      interpolate(t, [v.at - 0.35, v.at, v.at + v.dur, v.at + v.dur + 0.6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    );
  }
  const fade = interpolate(f, [0, FPS, TOTAL - 2 * FPS, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (0.32 - 0.2 * duck) * fade;
};

const SceneFrame: React.FC<{ index: number; dur: number; tin?: Transition; tout?: Transition; children: React.ReactNode }> = ({
  index,
  dur,
  tin,
  tout,
  children,
}) => {
  const f = useCurrentFrame();
  // a slow push-in keeps every shot alive between transitions
  const shot = <AbsoluteFill style={{ transform: `scale(${1 + 0.025 * (f / dur)})`, fontFamily: FONT, color: C.ink }}>{children}</AbsoluteFill>;
  if (tin && f < tin.frames) {
    const P = tin.Pres;
    return <P dir="in" p={f / (tin.frames - 1)} id={`tr${index}in`}>{shot}</P>;
  }
  if (tout && f >= dur - tout.frames) {
    const P = tout.Pres;
    return <P dir="out" p={(f - (dur - tout.frames)) / (tout.frames - 1)} id={`tr${index}out`}>{shot}</P>;
  }
  return shot;
};

const before = (t: Transition) => Math.round(t.frames * (t.anchor ?? 0.5));

export const AdeleVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SCENES.map((sc, i) => {
      const Scene = Scenes[sc.id];
      const tin = TRANSITIONS[i - 1];
      const tout = TRANSITIONS[i];
      const pre = tin ? before(tin) : 0;
      const post = tout ? tout.frames - before(tout) : 0;
      return (
        <Sequence key={sc.id} from={sc.start - pre} durationInFrames={sc.dur + pre + post} name={sc.id}>
          <SceneStart.Provider value={(sc.start - pre) / FPS}>
            <SceneFrame index={i} dur={sc.dur + pre + post} tin={tin} tout={tout}>
              <Scene />
            </SceneFrame>
          </SceneStart.Provider>
        </Sequence>
      );
    })}
    <Audio src={staticFile("music.mp3")} volume={musicVolume} />
    {VO.map((v) => (
      <Sequence key={v.file} from={v.start} name={`vo ${v.file}`}>
        <Audio src={staticFile(`voiceover/${v.file}.mp3`)} />
      </Sequence>
    ))}
    {SFX.map((x, i) => (
      <Sequence key={i} from={x.start} name={`sfx ${x.file}`}>
        <Audio src={staticFile(`sfx/${x.file}.wav`)} volume={x.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
