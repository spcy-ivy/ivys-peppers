// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox";
import Roact from "@rbxts/roact";
import { Display, useCountdown } from "../components/timer";
import { useMountEffect } from "@rbxts/pretty-react-hooks";

function DisplayStory() {
  const countdown = useCountdown();

  useMountEffect(() => {
    // print("DO YOU WORK?!?!?!?")
    countdown.setTime(10);
    countdown.start();
  })

  return (
    <Display epoch={countdown.value} visible={true} />
  )
}

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(<DisplayStory />);

  return () => {
    root.unmount();
  };
};