import { Service } from "@flamework/core";
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
 * 2. pepper prompt
 * 3. [x] load gamemode
 * 4. [x] load pepper shit
 * 5. [x] wait until win condition (w/ promises)
 */

@Service()
export class RoundManager {
	private winCondition: Option<Promise<unknown>>;
	private pepperNames: string[] = [];

	public constructor(private readonly logger: Logger) {
		this.winCondition = Option.none();

		for (const [key, _value] of pairs(peppers)) {
			this.pepperNames.push(key);
		}
	}

	StartRound() {
		this.logger.Info("round started!");
	}

	public RunGamemode(gamemode: string) {
		if (!(gamemode in gamemodes)) {
			this.logger.Error("input gamemode is not valid! use snake_case!");
			return;
		}

		this.logger.Info("Testing started!");
		const condition = gamemodes[gamemode as keyof typeof gamemodes]();
		this.winCondition = Option.some(condition);
		this.logger.Info("Currently running {gamemode} mode", gamemode);

		// wacky syntax hahaha
		const winnersPromise = this.winCondition.unwrap();
		winnersPromise.catch((err) => this.logger.Error("Gamemode caught error: {error}", err));
		const winners = winnersPromise.expect();

		this.logger.Info("Finished testing! The winners are {winners}", winners);
	}

	public StopGamemode() {
		if (this.winCondition.isSome()) {
			const winnersPromise = this.winCondition.unwrap();
			winnersPromise.cancel();
			store.clearSurvivors();

			this.logger.Info("Ended gamemode and cleared survivors!");
		}
	}

	public ApplyPepper(player: Player, pepper: string) {
		if (!(pepper in peppers)) {
			this.logger.Error("input pepper is not valid! use snake_case!");
			return;
		}

		// holy shit what is this typed bullfuckery
		const definition = peppers[pepper as keyof typeof peppers];
		const model = player.Character || player.CharacterAdded.Wait()[0];

		this.logger.Info("Applying pepper effect");
		promiseR6(model).then((character) => {
			definition.effect(character);
		});
	}

	public PepperPrompt() {
		// oh my god lord forgive me for this heresy
		// APPARENTLY when it compiles it adds 1 so I have to negate the random params :(
		const randomPepper = () =>
			peppers[this.pepperNames[math.random(0, this.pepperNames.size() - 1)] as keyof typeof peppers];

		Events.pepper_prompt.broadcast([randomPepper().option, randomPepper().option, randomPepper().option]);
	}
}
