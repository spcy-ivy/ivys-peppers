import { Controller, OnStart } from "@flamework/core";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import Roact, { StrictMode } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { Events } from "client/network";
import { Announcements } from "client/ui/components/announcements";
import { PepperPrompt } from "client/ui/components/pepper_prompt";

@Controller()
export class UI implements OnStart {
	onStart() {
		const root = createRoot(new Instance("Folder"));
		const target = Players.LocalPlayer.WaitForChild("PlayerGui");

		root.render(
			createPortal(
				<StrictMode>
					<Announcements />
					<PepperPrompt />
				</StrictMode>,
				target,
			),
		);
	}
}
