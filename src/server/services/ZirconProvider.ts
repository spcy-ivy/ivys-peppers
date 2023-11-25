import { Service, OnInit } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ZirconConfigurationBuilder, ZirconDefaultGroup, ZirconFunctionBuilder, ZirconServer } from "@rbxts/zircon";
import { RoundManager } from "./RoundManager";
import { Events } from "server/network";
import { store } from "server/store";

// extremely ugly and unreadable code ahead... BEWARE!!

@Service()
export class ZirconProvider implements OnInit {
	public constructor(private readonly logger: Logger, private readonly roundManager: RoundManager) {}

	onInit() {
		ZirconServer.Registry.Init(
			ZirconConfigurationBuilder.default()
				.CreateGroup(254, ZirconDefaultGroup.Admin, (group) => {
					return group.BindToUserIds([
						5199512481, // pnmpki2
						543918313, // pnmpki
						3814464357, // me
					]);
				})
				.AddFunction(this.TestGamemode, [ZirconDefaultGroup.Admin])
				.AddFunction(this.CancelGamemode, [ZirconDefaultGroup.Admin])
				.AddFunction(this.RandomGamemode, [ZirconDefaultGroup.Admin])
				.AddFunction(this.Announce, [ZirconDefaultGroup.Admin])
				.AddFunction(this.TestPepper, [ZirconDefaultGroup.Admin])
				.AddFunction(this.PepperPrompt, [ZirconDefaultGroup.Admin])
				.AddFunction(this.AddSurvivor, [ZirconDefaultGroup.Admin])
				.AddFunction(this.RemoveSurvivor, [ZirconDefaultGroup.Admin])
				.AddFunction(this.ClearSurvivors, [ZirconDefaultGroup.Admin])
				.AddFunction(this.ListSurvivors, [ZirconDefaultGroup.Admin])
				.AddFunction(this.SetAllSurvivors, [ZirconDefaultGroup.Admin])
				.AddFunction(this.BeginAutomation, [ZirconDefaultGroup.Admin])
				.AddFunction(this.CancelAutomation, [ZirconDefaultGroup.Admin])
				.AddFunction(this.SetVariant, [ZirconDefaultGroup.Admin])
				.AddFunction(this.SetLobby, [ZirconDefaultGroup.Admin])
				.Build(),
		);
	}

	private TestGamemode = new ZirconFunctionBuilder("test_gamemode").AddArgument("string").Bind((_context, mode) => {
		this.roundManager.RunGamemode(mode);
	});

	private CancelGamemode = new ZirconFunctionBuilder("cancel_gamemode").Bind((_context) =>
		this.roundManager.CancelGamemode(),
	);

	private RandomGamemode = new ZirconFunctionBuilder("random_gamemode").Bind((_context) => {
		this.roundManager.RandomGamemode();
	});

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

	private SetAllSurvivors = new ZirconFunctionBuilder("set_all_survivors").Bind((_context) => {
		store.setAllSurvivors();
	});

	private BeginAutomation = new ZirconFunctionBuilder("begin_automation").Bind((_context) => {
		this.roundManager.BeginAutomation();
	});

	private CancelAutomation = new ZirconFunctionBuilder("cancel_automation").Bind((_context) => {
		this.roundManager.CancelAutomation();
	});

	private SetVariant = new ZirconFunctionBuilder("set_variant").AddArgument("string").Bind((_context, variant) => {
		this.roundManager.SetVariant(variant);
	});

	private SetLobby = new ZirconFunctionBuilder("set_lobby").Bind((_context) => {
		this.roundManager.SetDefaultVariant();
	});
}
