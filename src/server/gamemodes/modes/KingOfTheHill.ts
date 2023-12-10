import { ServerScriptService } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { alternativeMap } from "../helpers/alternativeMap";

const hammer = ServerScriptService.Models.hammer;
const kothVariants = ServerScriptService.Maps.KOTH.GetChildren();

async function winCondition(): Promise<Player[]> {
	const [_obliterator, _endGame, endGamePromise] = initializeGamemode();

	alternativeMap(
		kothVariants[math.random(0, kothVariants.size() - 1)] as Model,
	);

	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => {
				hammer.Clone().Parent = character;
				character.PivotTo(
					new CFrame(
						new Vector3(
							math.random(-40, 40),
							5,
							math.random(-40, 40),
						),
					),
				);
			});
		});

	return endGamePromise;
}

export = winCondition;
