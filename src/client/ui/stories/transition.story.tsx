// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox";
import Roact, { useState } from "@rbxts/roact";
import { Tiles, TransitionContext } from "../components/transition";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { UserInputService } from "@rbxts/services";

function TransitionStory() {
  const [visible, setVisible] = useState(true);

  useEventListener(UserInputService.InputBegan, (input: InputObject) => {
    if (input.UserInputType !== Enum.UserInputType.MouseButton1) {
      return
    }

    setVisible(!visible)
  })

  return (
    <TransitionContext.Provider value={{ visible: visible }}>
      <Tiles key="tiles" />
    </TransitionContext.Provider>
  )
}

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(
    <TransitionStory />
  );

  return () => {
    root.unmount();
  };
};