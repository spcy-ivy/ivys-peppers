// ALWAYS PUT DEV MODE BEFORE ANY IMPORTS!!!!!!
declare const _G: Record<string, unknown>;
_G.__DEV__ = true;

import { createRoot } from "@rbxts/react-roblox";
import Roact, { useState } from "@rbxts/roact";
import { Announcement } from "../components/announcements";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { UserInputService } from "@rbxts/services";

function AnnouncementStory() {
	const [enabled, setEnabled] = useState(true);

	useEventListener(UserInputService.InputBegan, (input: InputObject) => {
		if (input.UserInputType !== Enum.UserInputType.MouseButton1) {
			return;
		}

		setEnabled(!enabled);
	});

	return (
		<Announcement
			text={"wenomechainsama tumajarbisaun"}
			enabled={enabled}
		/>
	);
}

export = (target: Instance) => {
	const root = createRoot(target);

	root.render(<AnnouncementStory />);

	return () => {
		root.unmount();
	};
};
