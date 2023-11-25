import Roact, { useState } from "@rbxts/roact";
import { Announcement } from "./announcement";
import { Events } from "client/network";
import { useEventListener } from "@rbxts/pretty-react-hooks";

export function Announcements() {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  // disgusting hack, not an elegant solution at all.
  // here because I want to refresh the 5 second disable deadline when new text abruptly comes up
  // this is the simplest solution I could find though, so it stays
  const [disablePromise, setPromise] = useState<Promise<void>>()

  useEventListener(Events.announce, (text: string) => {
    setText(text);
    setEnabled(true);
    disablePromise?.cancel()
    setPromise(Promise.delay(5).then(() => setEnabled(false)))
  })

  return (
    <screengui IgnoreGuiInset={true} ResetOnSpawn={false}>
      <Announcement
        text={text}
        enabled={enabled}
      />
    </screengui>
  );
}