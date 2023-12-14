import { ServerScriptService } from "@rbxts/services";
import { store } from "server/store";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { lobbyVariant } from "../helpers/lobbyVariant";
import { Events } from "server/network";

const sword = ServerScriptService.Tools.sword;

async function winCondition(): Promise<Player[]> {
	const [_obliterator, _endGame, endGamePromise] = initializeGamemode();

	lobbyVariant();
	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then(
				(character) => (sword.Clone().Parent = character),
			);
		});

	return endGamePromise.tap((winners) => {
		Events.announce.broadcast(`${winners[0]} is the last standing!`);
	});
}

export = winCondition;
