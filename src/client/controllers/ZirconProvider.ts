import { Controller, OnInit } from "@flamework/core";
import { ZirconClient } from "@rbxts/zircon";

@Controller()
export class ZirconProvider implements OnInit {
	onInit() {
		ZirconClient.Init({
			Keys: [Enum.KeyCode.F2],
		});
	}
}
