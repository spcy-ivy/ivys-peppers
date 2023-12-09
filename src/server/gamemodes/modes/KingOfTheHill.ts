import { ServerScriptService } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";

const hammer = ServerScriptService.Models.hammer;

async function winCondition(): Promise<Player[]> {
	const [_obliterator, _endGame, endGamePromise] = initializeGamemode();

	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then(
				(character) => (hammer.Clone().Parent = character),
			);
		});

	return endGamePromise;
}

export = winCondition;
