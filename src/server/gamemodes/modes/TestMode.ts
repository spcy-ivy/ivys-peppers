// this is the template for all of the gamemodes!
// yeah yeah stupid overabstraction at least I dont have to write a million lines of boilerplate
import { initializeGamemode } from "../helpers/initializeGamemode";

async function winCondition(): Promise<Player[]> {
	const [_obliterator, _endGame, endGamePromise] = initializeGamemode();
	return endGamePromise;
}

export = winCondition;