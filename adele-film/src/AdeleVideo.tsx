import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Scenes } from "./scenes";
import { cardLift, focusPull, irisFrom, logoFlyThrough, push, shrinkToIcon, type Transition, zoomThrough } from "./transitions";
import { C, FONT, SceneStart } from "./ui";
import { CUTS, FPS, framesBefore, musicVolume, SCENES, SFX, VO } from "./timeline";

// The look of each cut, in the order of CUTS in timeline.ts (which holds the timings).
const PRESENTATIONS = [
  zoomThrough(960, 716), // into the ringing phone pill
  shrinkToIcon, // the busy day collapses into the app icon on the drop
  logoFlyThrough, // fly through the symbol into the phone call
  push("x"), // swipe across to WhatsApp
  cardLift,
  irisFrom(860, 560), // opens from the centre of the hub sphere
  push("y"), // rises into the rolling list
  focusPull, // soft focus into the music's breakdown
  zoomThrough(960, 330), // through the clock on the final drop
];
const TRANSITIONS: Transition[] = CUTS.map((c, i) => ({ ...c, Pres: PRESENTATIONS[i] }));


export const SceneFrame: React.FC<{ index: number; dur: number; tin?: Transition; tout?: Transition; children: React.ReactNode }> = ({
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

export const AdeleVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SCENES.map((sc, i) => {
      const Scene = Scenes[sc.id];
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
