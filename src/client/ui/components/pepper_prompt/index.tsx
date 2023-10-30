import Roact, { useEffect, useState } from "@rbxts/roact";
import { Events } from "client/network";
import { Cards } from "./cards";
import { PepperOption } from "types/interfaces/Peppers";

export function PepperPrompt() {
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

	const disappear = () => setEnabled(false);

	useEffect(() => {
		const connection = Events.pepper_prompt.connect((passed_cards) => {
			setEnabled(true);
			setCards(passed_cards);
			task.wait(5);
			setEnabled(false);
		});

		return () => connection.Disconnect();
	});

	return (
		<screengui IgnoreGuiInset={true}>
			<Cards enabled={enabled} cards={cards} pressedCallback={disappear} />
		</screengui>
	);
}
