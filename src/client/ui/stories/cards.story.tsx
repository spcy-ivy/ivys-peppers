// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox";
import Roact from "@rbxts/roact";
import { Cards } from "../components/pepper_prompt/cards";
import { PromptContext } from "../components/pepper_prompt/promptContext";

export = (target: Instance) => {
  const root = createRoot(target);

  root.render(
    <PromptContext.Provider value={{
      enabled: true,
      pressedCallback: () => print("SHIT!")
    }}>
      <Cards key="cards" />
    </PromptContext.Provider>
  );

  return () => {
    root.unmount();
  };
};