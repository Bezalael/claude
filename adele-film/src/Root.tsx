import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import { Composition } from "remotion";
import { AdeleVideo } from "./AdeleVideo";
import { DemoVideo } from "./demo/DemoVideo";
import * as demo from "./demo/timeline";
import { FPS, TOTAL } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AdeleCare" component={AdeleVideo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="AdeleDemo" component={DemoVideo} durationInFrames={demo.TOTAL} fps={demo.FPS} width={1920} height={1080} />
  </>
);
