// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox"
import Roact from "@rbxts/roact";
import { Cards } from "../components/pepper_prompt/cards";

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(<Cards enabled={true} />)

  return () => {
    root.unmount()
  }
}