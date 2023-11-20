import Roact, { useEffect, useState } from "@rbxts/roact";
import { Events } from "client/network";
import { Cards } from "./cards";
import { PepperOption } from "types/interfaces/Peppers";

export function PepperPrompt() {
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

  const disappear = (option: PepperOption) => {
    setEnabled(false);
    // wait for fade out animation
    task.delay(1, () => setVisible(false));
    Events.confirmPepper.fire(option.name);
  };

  useEffect(() => {
    const prompt_connection = Events.pepperPrompt.connect((passed_cards) => {
      setVisible(true);
      setEnabled(true);
      setCards(passed_cards);
    });

    const cancel_connection = Events.cancelPepperPrompt.connect(() => {
      setEnabled(false);
      // wait for fade out animation
      task.delay(1, () => setVisible(false));
    });

    return () => {
      prompt_connection.Disconnect();
      cancel_connection.Disconnect();
    };
  });

  return (
    <screengui Enabled={visible} IgnoreGuiInset={true} ResetOnSpawn={false}>
      <Cards enabled={enabled} cards={cards} pressedCallback={disappear} />
    </screengui>
  );
}