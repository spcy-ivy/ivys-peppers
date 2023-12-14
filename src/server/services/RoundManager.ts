import { Service, OnStart } from "@flamework/core";
import { Players, Workspace, ServerScriptService } from "@rbxts/services";
import { Logger } from "@rbxts/log";
import { promiseR6 } from "@rbxts/promise-character";
import { Option } from "@rbxts/rust-classes";
import { Events } from "server/network";
import { gamemodes } from "server/gamemodes";
import { peppers } from "server/peppers";
import { store } from "server/store";

// i really want to split this up but cant because then itd be unnecessary abstraction
// "wahh wahhh each piece of code should only do one job wahh wahh" SHUT UP!!!!!
// I NEED THIS ALL IN ONE MODULE SO THAT NAVIGATION ISNT A PAIN!!!!! I DONT WANT TO JUMP BETWEEN ONE MILLION SCRIPTS JUST TO GET WHAT HAPPENS IN **ONE ROUND**
// USE BIG FILES LIKE A REAL MAN!!!! EVERYTHING IS CONNECTED!!!!
//
// why is being a programmer so painful

@Service()
export class RoundManager implements OnStart {
	private winCondition: Option<Promise<Player[]>> = Option.none();

	private pepperNames: string[] = [];
	private gamemodeNames: string[] = [];

	private canApplyPepper = false;
	private pepperApplied: Player[] = [];

	private variant: Option<string> = Option.none();
	private variantNames: string[] = [];
	private lobby: Model = Workspace.Lobby;
	private alternativeModel: Option<Model> = Option.none();
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

		this.variants
			.GetChildren()
			.forEach((map) => this.variantNames.push(map.Name));
	}

	onStart() {
		Events.confirmPepper.connect((player, pepperName) => {
			this.logger.Info(
				"{player} attempted to apply {pepper}",
				player,
				pepperName,
			);

			if (!this.canApplyPepper) return;
			if (!(pepperName in peppers)) return;
			if (this.pepperApplied.includes(player)) return;

			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => {
				peppers[pepperName as keyof typeof peppers].effect(character);
				this.pepperApplied.push(player);
			});
		});

		this.BeginAutomation();
	}

	public BeginAutomation() {
		this.logger.Info("starting round automation");

		this.automating = true;
		while (this.automating) {
			do {
				task.wait(5);
			} while (Players.GetPlayers().size() < 2);

			const round = new Promise((resolve, _reject, onCancel) => {
				onCancel(() => {
					this.canApplyPepper = false;
					Events.cancelPepperPrompt.broadcast();
					this.CancelGamemode();
				});

				store.setAllSurvivors();
				this.PepperPrompt();
				resolve(undefined);
			})
				.andThenCall(Promise.delay, 5)
				// hhhhhhhhhhhh have to do this stinky arrow syntax bc the compiler wont stop WHINING
				.andThenCall(() => Events.transition.broadcast())
				.andThenCall(Promise.delay, 1.5)
				.andThenCall(() => Events.cancelTransition.broadcast())
				.andThenCall(() => this.RandomGamemode())
				// hacky and bad... but it works...
				.then(
					(survivors) => new Promise((resolve) => resolve(survivors)),
				)
				.catch((reason) => {
					this.logger.Warn(
						"round errored with reason {reason}",
						reason,
					);
				}) as Promise<Player[]>;
			//   ^^^^^^^^^^^^^^^^^^^^
			// need a stupid `as` statement because APPPAARREENNTTTLYYY the fucking compiler wont stop fucking whining
			// TS compiler is so annoying sometimes

			this.automatedRound = Option.some(round);
			round.await();
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
		this.SetLobby();

		Players.GetPlayers().forEach((player) => {
			if (!player.Character) return;
			player.LoadCharacter();
		});
	}

	// what the fuck was I thinking with this string input?????
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

		winnersPromise.catch((err) =>
			this.logger.Error("Gamemode caught error: {error}", err),
		);
		const winners = winnersPromise.expect();

		this.StopGamemode();
		this.logger.Info(
			"Finished testing! The winners are {winners}",
			winners,
		);
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
		const randomGamemode = () =>
			this.gamemodeNames[math.random(0, this.gamemodeNames.size() - 1)];
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
			peppers[
				this.pepperNames[
					math.random(0, this.pepperNames.size() - 1)
				] as keyof typeof peppers
			];

		this.canApplyPepper = true;

		// this hurts me more than it hurts you
		Events.pepperPrompt.broadcast([
			randomPepper().option,
			randomPepper().option,
			randomPepper().option,
		]);

		task.wait(5);

		this.canApplyPepper = false;
		Events.cancelPepperPrompt.broadcast();
	}

	public LoadAlternativeMap(map: Model) {
		if (this.alternativeModel.isSome()) {
			this.alternativeModel.unwrap().Destroy();
			this.alternativeModel = Option.none();
		}

		const clone = map.Clone();
		this.alternativeModel = Option.some(clone as Model);
		clone.Parent = Workspace;
		this.lobby.Parent = undefined;

		this.logger.Info(
			"loaded alternative map named {alternative}!!!!",
			map.Name,
		);

		return clone;
	}

	private UpdateVariantModel() {
		if (this.variant.isNone()) {
			this.logger.Error("there is no variant!");
			return;
		}

		const map = this.variants.FindFirstChild(this.variant.unwrap());

		if (!map) {
			this.logger.Warn(
				`for some sick and twisted reason a registered variant wasnt in the folder, wont load, cursed variant was ${this.variant.unwrap()}`,
			);
			return;
		}

		this.LoadAlternativeMap(map as Model);
	}

	public SetVariant(variant: string) {
		if (!this.variantNames.includes(variant)) {
			this.logger.Warn(`${variant} is not a lobby variant!`);
			return;
		}

		this.variant = Option.some(variant);
		this.UpdateVariantModel();
	}

	public SetRandomVariant() {
		// why minus one??? I DONT KNOW!!! IT JUST WORKS!!! DONT TOUCH IT!!!!
		// also probably because .size() returns a value one larger than actual size
		this.SetVariant(
			this.variantNames[math.random(0, this.variantNames.size() - 1)],
		);
	}

	public SetLobby() {
		this.variant = Option.none();

		if (this.alternativeModel.isSome()) {
			this.alternativeModel.unwrap().Destroy();
			this.alternativeModel = Option.none();
		}

		this.logger.Info("load the lobby!!");
		this.lobby.Parent = Workspace;
	}
}
