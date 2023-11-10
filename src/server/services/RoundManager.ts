import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Logger } from "@rbxts/log";
import { promiseR6 } from "@rbxts/promise-character";
import { Option } from "@rbxts/rust-classes";
import { Events } from "server/network";
import { gamemodes } from "server/gamemodes";
import { peppers } from "server/peppers";
import { store } from "server/store";

/**
 * 1. [x] get gamemode
 *   - [x] gamemode activation/selection
 *   - [x] gamemode cancellation
 *   - [x] announcements
 * 2. [x] pepper prompt
 * 3. [x] load gamemode
 * 4. [x] load pepper shit
 * 5. [x] wait until win condition (w/ promises)
 */

@Service()
export class RoundManager implements OnStart {
	private winCondition: Option<Promise<unknown>> = Option.none();
	private pepperNames: string[] = [];
	private gamemodeNames: string[] = [];
	private canApplyPepper = false;
	private pepperApplied: Player[] = [];

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
	}

	StartRound() {
		this.logger.Info("round started!");
	}

	private StopGamemode() {
		store.clearSurvivors();
		this.winCondition = Option.none();

		Players.GetPlayers().forEach((player) => {
			if (!player.Character) return;
			player.LoadCharacter();
		});
	}

	public RunGamemode(gamemode: string) {
		if (!(gamemode in gamemodes)) {
			this.logger.Error("input gamemode is not valid! use snake_case!");
			return;
		}

		if (this.winCondition.isSome()) {
			this.logger.Error("a gamemode is already running!");
			return;
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
	}

	public CancelGamemode() {
		if (this.winCondition.isSome()) {
			const winnersPromise = this.winCondition.unwrap();
			winnersPromise.cancel();
			this.StopGamemode();

			this.logger.Info("Ended gamemode and cleared survivors!");
		}
	}

	public RandomGamemode() {
		const randomGamemode = () => this.gamemodeNames[math.random(0, this.gamemodeNames.size() - 1)];
		this.RunGamemode(randomGamemode());
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
