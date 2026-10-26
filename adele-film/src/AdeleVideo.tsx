import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { Scenes } from "./scenes";
import { SceneShell } from "./ui";
import { FPS, OVERLAP, SCENES, TOTAL, VO } from "./timeline";

// Music sits around 0.32 and ducks to 0.14 while Adele is speaking.
const musicVolume = (f: number) => {
  const t = f / FPS;
  let duck = 0;
  for (const v of VO) {
    duck = Math.max(duck, interpolate(t, [v.at - 0.35, v.at, v.at + v.dur, v.at + v.dur + 0.6], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }));
  }
  const fade = interpolate(f, [0, FPS, TOTAL - 3 * FPS, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (0.32 - 0.18 * duck) * fade;
};

export const AdeleVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#FBFBFD" }}>
    {SCENES.map((sc, i) => {
      const Scene = Scenes[sc.id];
      const last = i === SCENES.length - 1;
      return (
        <Sequence key={sc.id} from={sc.start} durationInFrames={sc.dur + (last ? 0 : OVERLAP)} name={sc.id}>
          <SceneShell dur={sc.dur + (last ? 0 : OVERLAP)} first={i === 0} last={last}>
            <Scene />
          </SceneShell>
        </Sequence>
      );
    })}
    <Audio src={staticFile("music.mp3")} volume={musicVolume} />
    {VO.map((v, i) => (
      <Sequence key={i} from={v.start} name={`vo${i}`}>
        <Audio src={staticFile(`voiceover/line${i}.wav`)} volume={1} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
