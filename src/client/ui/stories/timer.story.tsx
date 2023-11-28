// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox";
import Roact from "@rbxts/roact";
import { Timer } from "../components/timer";

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(<Timer />);

  return () => {
    root.unmount();
  };
};