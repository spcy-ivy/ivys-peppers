import { ServerScriptService } from "@rbxts/services";
import { store } from "server/store";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { Events } from "server/network";

const sword = ServerScriptService.Models.sword;

async function winCondition(): Promise<Player[]> {
	const [_obliterator, _endGame, endGamePromise] = initializeGamemode();

	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => (sword.Clone().Parent = character));
		});

	return endGamePromise.tap((winners) => {
		task.wait(1); // waits so that the players can see who won
		Events.announce.broadcast(`${winners[0]} is the last standing!`);
	});
}

export = winCondition;
