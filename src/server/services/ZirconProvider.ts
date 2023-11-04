import { Service, OnInit } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ZirconConfigurationBuilder, ZirconDefaultGroup, ZirconFunctionBuilder, ZirconServer } from "@rbxts/zircon";
import { RoundManager } from "./RoundManager";
import { Events } from "server/network";
import { store } from "server/store";

@Service()
export class ZirconProvider implements OnInit {
	public constructor(private readonly logger: Logger, private readonly roundManager: RoundManager) {}

	onInit() {
		ZirconServer.Registry.Init(
			ZirconConfigurationBuilder.default()
				.AddFunction(this.TestGamemode, [ZirconDefaultGroup.Creator])
				.AddFunction(this.CancelGamemode, [ZirconDefaultGroup.Creator])
				.AddFunction(this.Announce, [ZirconDefaultGroup.Creator])
				.AddFunction(this.TestPepper, [ZirconDefaultGroup.Creator])
				.AddFunction(this.PepperPrompt, [ZirconDefaultGroup.Creator])
				.AddFunction(this.AddSurvivor, [ZirconDefaultGroup.Creator])
				.AddFunction(this.RemoveSurvivor, [ZirconDefaultGroup.Creator])
				.AddFunction(this.ClearSurvivors, [ZirconDefaultGroup.Creator])
				.AddFunction(this.ListSurvivors, [ZirconDefaultGroup.Creator])
				.Build(),
		);
	}

	private TestGamemode = new ZirconFunctionBuilder("test_gamemode")
		.AddArgument("string")
		.Bind((_context, mode) => this.roundManager.RunGamemode(mode));

	private CancelGamemode = new ZirconFunctionBuilder("cancel_gamemode").Bind((_context) =>
		this.roundManager.CancelGamemode(),
	);

	private Announce = new ZirconFunctionBuilder("announce")
		.AddArgument("string")
		.Bind((_context, message) => Events.announce.broadcast(message));

	private TestPepper = new ZirconFunctionBuilder("test_pepper")
		.AddArgument("string")
		.Bind((context, pepper) => this.roundManager.ApplyPepper(context.GetExecutor(), pepper));

	private PepperPrompt = new ZirconFunctionBuilder("pepper_prompt").Bind((_context) =>
		this.roundManager.PepperPrompt(),
	);

	private AddSurvivor = new ZirconFunctionBuilder("add_survivor").AddArgument("player").Bind((_context, player) => {
		store.addSurvivor(player);
	});

	private RemoveSurvivor = new ZirconFunctionBuilder("remove_survivor")
		.AddArgument("player")
		.Bind((_context, player) => {
			store.removeSurvivor(player);
		});

	private ClearSurvivors = new ZirconFunctionBuilder("clear_survivors").Bind((_context) => {
		store.clearSurvivors();
	});

	private ListSurvivors = new ZirconFunctionBuilder("list_survivors").Bind((_context) => {
		this.logger.Info("survivors: {survivors}", store.getState().survivorsSlice.survivors.asPtr());
	});
}
