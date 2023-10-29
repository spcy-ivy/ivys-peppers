import { Service, OnInit } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ZirconConfigurationBuilder, ZirconDefaultGroup, ZirconFunctionBuilder, ZirconServer } from "@rbxts/zircon";
import { RoundManager } from "./RoundManager";
import { Events } from "server/network";

@Service()
export class ZirconProvider implements OnInit {
	public constructor(private readonly logger: Logger, private readonly roundManager: RoundManager) {}

	onInit() {
		ZirconServer.Registry.Init(
			ZirconConfigurationBuilder.default()
				.AddFunction(this.TestGamemode, [ZirconDefaultGroup.Creator])
				.AddFunction(this.StopGamemode, [ZirconDefaultGroup.Creator])
				.AddFunction(this.Announce, [ZirconDefaultGroup.Creator])
				//.AddFunction(this.PepperPrompt, [ZirconDefaultGroup.Creator])
				.Build(),
		);
	}

	private TestGamemode = new ZirconFunctionBuilder("test_gamemode")
		.AddArgument("string")
		.Bind((_context, mode) => this.roundManager.RunGamemode(mode));

	private StopGamemode = new ZirconFunctionBuilder("stop_gamemode").Bind((_context) =>
		this.roundManager.StopGamemode(),
	);

	private Announce = new ZirconFunctionBuilder("announce")
		.AddArgument("string")
		.Bind((_context, message) => Events.announce.broadcast(message));

	// private PepperPrompt = new ZirconFunctionBuilder("pepper_prompt").Bind((_context) =>
	// Events.pepper_prompt.broadcast(),
	// );
}
