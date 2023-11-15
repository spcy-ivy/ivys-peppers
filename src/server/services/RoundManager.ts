import { Service, OnStart } from "@flamework/core";
import { Players, Workspace, ServerScriptService } from "@rbxts/services";
import { Logger } from "@rbxts/log";
import { promiseR6 } from "@rbxts/promise-character";
import { Option } from "@rbxts/rust-classes";
import { Events } from "server/network";
import { gamemodes } from "server/gamemodes";
import { peppers } from "server/peppers";
import { store } from "server/store";
import { selectVariant } from "server/store/lobbyVariants";

// i really want to split this up but cant because then itd be unnecessary abstraction
// why is being a programmer so painful

@Service()
export class RoundManager implements OnStart {
	private winCondition: Option<Promise<Player[]>> = Option.none();

	private pepperNames: string[] = [];
	private gamemodeNames: string[] = [];

	private canApplyPepper = false;
	private pepperApplied: Player[] = [];

	private lobby: Model = Workspace.Lobby;
	private loadedVariant: Option<Model> = Option.none();
	private variants = ServerScriptService.Maps.lobby_variants;

	private automatedRound: Option<Promise<Player[]>> = Option.none();
	private automating = false;

	public constructor(private readonly logger: Logger) {
		for (const [key, _value] of pairs(peppers)) {
			this.pepperNames.push(key);
		}

		for (const [key, _value] of pairs(gamemodes)) {
			this.gamemodeNames.push(key);
		}
	}

	onStart() {
		Events.confirmPepper.connect((player, pepperName) => {
			this.logger.Info("{player} attempted to apply {pepper}", player, pepperName);

			if (!this.canApplyPepper) return;
			if (!(pepperName in peppers)) return;
			if (this.pepperApplied.includes(player)) return;

			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => {
				peppers[pepperName as keyof typeof peppers].effect(character);
				this.pepperApplied.push(player);
			});
		});

		// HACKY AND TERRIBLE CODE AHEAD!!! BEWARE!!
		// wont revise because im lazy
		store.subscribe(selectVariant, (variant) => {
			if (variant.isNone()) {
				this.logger.Info("load the lobby!!");

				if (this.loadedVariant.isSome()) {
					this.loadedVariant.unwrap().Destroy();
					this.loadedVariant = Option.none();
				}

				this.lobby.Parent = Workspace;
				return;
			}

			const map = this.variants.FindFirstChild(variant.unwrap());

			if (!map) {
				this.logger.Warn(
					`for some sick and twisted reason a registered variant wasnt in the folder, wont load, cursed variant was ${variant.unwrap()}`,
				);
				return;
			}

			const clone = map.Clone();
			this.loadedVariant = Option.some(clone as Model);
			clone.Parent = Workspace;
			this.lobby.Parent = undefined;

			this.logger.Info("loaded variant {variant}!!!!", variant.unwrap());
		});

		// this.BeginAutomation();
	}

	public BeginAutomation() {
		this.logger.Info("starting round automation");

		this.automating = true;
		while (this.automating) {
			// dunno if cancelling this will exactly work... but cant live life without risk
			const round = new Promise((_resolve, _reject, onCancel) => {
				onCancel(() => {
					this.canApplyPepper = false;
					Events.cancelPepperPrompt.broadcast();
					this.CancelGamemode();
				});

				store.setAllSurvivors();
				this.PepperPrompt();
			})
				.andThenCall(Promise.delay, 5)
				.andThenCall(() => this.RandomGamemode())
				.then((survivors) => new Promise((resolve) => resolve(survivors)))
				.catch((reason) => {
					this.logger.Warn("round errored with reason {reason}", reason);
				}) as Promise<Player[]>;
			// ^^^^^^^^^^^^^^^^^^^^
			// need a stupid `as` statement because APPPAARREENNTTTLYYY the fucking compiler wont stop fucking whining
			// TS compiler is so annoying sometimes

			this.automatedRound = Option.some(round);
			round.expect();
		}
	}

	public CancelAutomation() {
		this.logger.Info("cancelling automation");

		this.automating = false;
		if (this.automatedRound.isSome()) {
			this.automatedRound.unwrap().cancel();
			this.automatedRound = Option.none();
		}
	}

	private StopGamemode() {
		store.clearSurvivors();
		this.winCondition = Option.none();
		store.setDefaultLobby();

		Players.GetPlayers().forEach((player) => {
			if (!player.Character) return;
			player.LoadCharacter();
		});
	}

	public RunGamemode(gamemode: string): Player[] {
		if (!(gamemode in gamemodes)) {
			this.logger.Error("input gamemode is not valid! use snake_case!");
			return [];
		}

		if (this.winCondition.isSome()) {
			this.logger.Error("a gamemode is already running!");
			return [];
		}

		this.logger.Info("Testing started!");
		const condition = gamemodes[gamemode as keyof typeof gamemodes]();
		this.winCondition = Option.some(condition);

		this.logger.Info("Currently running {gamemode} mode", gamemode);
		Events.announce.broadcast(`gamemode is ${gamemode}!`);

		const winnersPromise = this.winCondition.unwrap();

		winnersPromise.catch((err) => this.logger.Error("Gamemode caught error: {error}", err));
		const winners = winnersPromise.expect();

		this.StopGamemode();
		this.logger.Info("Finished testing! The winners are {winners}", winners);
		return winners ? winners : [];
	}

	public CancelGamemode() {
		if (this.winCondition.isSome()) {
			const winnersPromise = this.winCondition.unwrap();
			winnersPromise.cancel();
			this.StopGamemode();

			this.logger.Info("Ended gamemode and cleared survivors!");
		}
	}

	public RandomGamemode(): Player[] {
		const randomGamemode = () => this.gamemodeNames[math.random(0, this.gamemodeNames.size() - 1)];
		return this.RunGamemode(randomGamemode());
	}

	public ApplyPepper(player: Player, pepper: string) {
		if (!(pepper in peppers)) {
			this.logger.Error("input pepper is not valid! use snake_case!");
			return;
		}

		const definition = peppers[pepper as keyof typeof peppers];
		const model = player.Character || player.CharacterAdded.Wait()[0];

		this.logger.Info("Applying pepper effect");
		promiseR6(model).then((character) => {
			definition.effect(character);
		});
	}

	public PepperPrompt() {
		this.pepperApplied.clear();

		// oh my god lord forgive me for this heresy
		// APPARENTLY when it compiles it adds 1 so I have to negate the random params :(
		const randomPepper = () =>
			peppers[this.pepperNames[math.random(0, this.pepperNames.size() - 1)] as keyof typeof peppers];

		this.canApplyPepper = true;

		// this hurts me more than it hurts you
		Events.pepperPrompt.broadcast([randomPepper().option, randomPepper().option, randomPepper().option]);

		task.wait(5);

		this.canApplyPepper = false;
		Events.cancelPepperPrompt.broadcast();
	}
}
