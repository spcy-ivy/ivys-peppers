import Roact, { useState, Binding, useEffect } from "@rbxts/roact";
import { Events } from "client/network";
import { isBinding, useEventListener } from "@rbxts/pretty-react-hooks";
import { useMotion } from "../hooks/use-motion";
import { springs } from "../utils/springs";
import colorscheme from "shared/colorscheme";

interface AnnouncementProps {
  text?: string | Binding<number>;
  enabled?: boolean | Binding<boolean>;
}

export function Announcement({
  text = "demo",
  enabled = true,
}: AnnouncementProps) {
  const [position, motion] = useMotion(0);

  useEffect(() => {
    const appear = isBinding(enabled) ? enabled.getValue() : enabled;

    if (appear) {
      motion.spring(1, springs.gentle);
    } else {
      motion.spring(0, springs.responsive);
    }
  }, [enabled]);

  return (
    <textlabel
      TextScaled={true}
      AutomaticSize={Enum.AutomaticSize.X}
      AnchorPoint={Vector2.xAxis.mul(0.5)}
      Position={position.map((alpha) =>
        UDim2.fromScale(0.5, -0.1).Lerp(
          UDim2.fromScale(0.5, 0.02),
          alpha,
        ),
      )}
      Transparency={position.map((alpha) => 1 - alpha)}
      Size={position.map((alpha) =>
        UDim2.fromScale(0, 0).Lerp(UDim2.fromScale(0, 0.1), alpha),
      )}
      Font={colorscheme.font}
      BackgroundColor3={colorscheme.background}
      TextColor3={colorscheme.foreground}
      Text={isBinding(text) ? text.map(tostring) : text}
    >
      <uistroke
        key="stroke"
        Transparency={position.map((alpha) => 1 - alpha)}
        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
        Color={colorscheme.selection_background}
        Thickness={3}
      />
    </textlabel>
  );
}

export function Announcements() {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  // disgusting hack, not an elegant solution at all.
  // here because I want to refresh the 5 second disable deadline when new text abruptly comes up
  // this is the simplest solution I could find though, so it stays
  const [disablePromise, setPromise] = useState<Promise<void>>();

  useEventListener(Events.announce, (text: string) => {
    setText(text);
    setEnabled(true);
    disablePromise?.cancel();
    setPromise(Promise.delay(5).then(() => setEnabled(false)));
  });

  return (
    <screengui key="announcements" IgnoreGuiInset={true} ResetOnSpawn={false}>
      <Announcement text={text} enabled={enabled} />
    </screengui>
  );
}