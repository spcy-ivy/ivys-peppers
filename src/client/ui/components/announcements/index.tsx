import Roact, { useEffect, useState } from "@rbxts/roact";
import { Announcement } from "./announcement";
import { Events } from "client/network";

export function Announcements() {
	const [text, setText] = useState("science!!!");
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const connection = Events.announce.connect((text) => {
			setText(text);
			setEnabled(true);
			task.wait(5);
			setEnabled(false);
		});

		return () => connection.Disconnect();
	});

	return (
		<screengui IgnoreGuiInset={true}>
			<Announcement text={text} enabled={enabled} />
		</screengui>
	);
}
