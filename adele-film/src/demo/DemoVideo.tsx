import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SceneFrame } from "../AdeleVideo";
import { cardLift, focusPull, irisFrom, logoFlyThrough, push, type Transition, zoomThrough } from "../transitions";
import { C, clamp, SceneStart } from "../ui";
import { ChairCounter, DemoScenes } from "./scenes";
import { CHAIRS, CUTS, FPS, framesBefore, musicVolume, RECALL_COUNT_END, SCENES, SFX, VO } from "./timeline";

// The look of each cut, in the order of CUTS in timeline.ts.
const PRESENTATIONS = [
  focusPull, // the lights come up
  logoFlyThrough, // through the symbol into how Adele works
  zoomThrough(960, 540), // into Monday's ringing phone
  push("x"), // on through Monday
  push("x"),
  cardLift, // Tuesday
  push("y"), // Wednesday
  irisFrom(960, 540), // Thursday
  zoomThrough(960, 540), // Friday
  focusPull, // five o'clock
  cardLift, // control
  push("y"), // trust
  zoomThrough(960, 540), // the invitation
];
const TRANSITIONS: Transition[] = CUTS.map((c, i) => ({ ...c, Pres: PRESENTATIONS[i] }));

/** The week's running total of chairs filled, shown from Monday's call to the weekly report. */
const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const show = interpolate(t, [47.9, 48.4, 212.1, 212.5], [0, 1, 1, 0], clamp);
  if (show <= 0) return null;
  const last = CHAIRS[CHAIRS.length - 1];
  const before = CHAIRS.filter((c) => t >= c.at);
  let value = before.length ? before[before.length - 1].total : 0;
  if (t >= last.at) {
    // recall bookings tick up over a few seconds rather than all at once
    const prev = CHAIRS[CHAIRS.length - 2].total;
    value = Math.round(interpolate(t, [last.at, RECALL_COUNT_END], [prev, last.total], clamp));
  }
  const bump = before.length ? Math.round(before[before.length - 1].at * FPS) : -1;
  return <ChairCounter value={value} show={show} bump={bump} />;
};

export const DemoVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SCENES.map((sc, i) => {
      const Scene = DemoScenes[sc.id];
      const tin = TRANSITIONS[i - 1];
      const tout = TRANSITIONS[i];
      const pre = tin ? framesBefore(tin) : 0;
      const post = tout ? tout.frames - framesBefore(tout) : 0;
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
    <Counter />
    <Audio src={staticFile("music-demo.mp3")} volume={musicVolume} />
    {VO.map((v) => (
      <Sequence key={v.file} from={v.start} name={`vo ${v.file}`}>
        <Audio src={staticFile(`voiceover-demo/${v.file}.mp3`)} />
      </Sequence>
    ))}
    {SFX.map((x, i) => (
      <Sequence key={i} from={x.start} name={`sfx ${x.file}`}>
        <Audio src={staticFile(`sfx/${x.file}.wav`)} volume={x.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
