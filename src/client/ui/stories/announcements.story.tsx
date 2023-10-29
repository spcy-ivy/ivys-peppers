// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox"
import Roact, { useState } from "@rbxts/roact";
import { Announcement } from "../components/announcements/announcement";

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(<Announcement text={"science"} enabled={true} />)

  return () => {
    root.unmount()
  }
}