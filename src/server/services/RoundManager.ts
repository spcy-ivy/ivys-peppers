import { Service } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Option } from "@rbxts/rust-classes";
import { gamemodes } from "server/gamemodes";

/**
 * 1. get gamemode
 *   - [x] gamemode activation/selection
 *   - [x] gamemode cancellation
 *   - [x] announcements
 * 2. pepper prompt
 * 3. load gamemode
 * 4. load pepper shit
 * 5. wait until win condition (w/ promises)
 */

@Service()
export class RoundManager {
	private winCondition: Option<Promise<unknown>>;

	public constructor(private readonly logger: Logger) {
		this.winCondition = Option.none();
	}

	StartRound() {
		this.logger.Info("round started!");
	}

	public RunGamemode(gamemode: string) {
		if (!(gamemode in gamemodes)) {
			this.logger.Error("input gamemode is not valid! use snake_case!");
			return;
		}

		this.logger.Info("testing started!");
		this.winCondition = Option.some(gamemodes[gamemode]());
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
		}
	}
}
