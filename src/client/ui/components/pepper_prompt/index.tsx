import Roact, { useState } from "@rbxts/roact";
import { Events } from "client/network";
import { Cards } from "./cards";
import { PepperOption } from "types/interfaces/Peppers";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { PromptContext } from "./promptContext";

export function PepperPrompt() {
  // TODO: swap the usage of visible and enabled because jesus its confusing
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [cards, setCards] = useState<PepperOption[]>([
    {
      icon: "",
      name: "first",
      description: "you didnt set this!",
    },
    {
      icon: "",
      name: "second",
      description: "this either!",
    },
    {
      icon: "",
      name: "third",
      description: "SET IT NOW!!!!",
    },
  ]);

  useEventListener(Events.pepperPrompt, (passed_cards) => {
    setVisible(true);
    setEnabled(true);
    setCards(passed_cards);
  });

  useEventListener(Events.cancelPepperPrompt, () => {
    setEnabled(false);
    // wait for fade out animation
    task.wait(1);
    setVisible(false);
    task.wait(0.15);
    setEnabled(false);
  });

  return (
    <PromptContext.Provider
      value={{
        enabled: enabled,
        pressedCallback: (option: PepperOption) => {
          setEnabled(false);
          // wait for fade out animation
          task.delay(1, () => setVisible(false));
          Events.confirmPepper.fire(option.name);
        },
      }}
    >
      {visible && (
        <screengui IgnoreGuiInset={true} ResetOnSpawn={false}>
          <Cards cards={cards} />
        </screengui>
      )}
    </PromptContext.Provider>
  );
}