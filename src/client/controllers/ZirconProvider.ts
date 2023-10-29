import { Controller, OnInit } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ZirconClient } from "@rbxts/zircon";

@Controller()
export class ZirconProvider implements OnInit {
	public constructor(private readonly logger: Logger) {}

	onInit() {
		ZirconClient.Init({
			Keys: [Enum.KeyCode.Backquote],
		});
	}
}
