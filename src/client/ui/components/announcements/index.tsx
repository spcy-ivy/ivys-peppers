import Roact, { useState } from "@rbxts/roact";
import { Announcement } from "./announcement";
import { Events } from "client/network";
import { useEventListener } from "@rbxts/pretty-react-hooks";

// thats it chief you might have to make your own timer

export function Announcements() {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  // disgusting hack
  // here because I want to refresh the 5 second disable deadline when new text abruptly comes up
  const [disablePromise, setPromise] = useState<Promise<void>>()

  useEventListener(Events.announce, (text: string) => {
    print(`received ${text}`)
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