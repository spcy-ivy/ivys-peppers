import { Players, ServerScriptService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { alternativeMap } from "../helpers/alternativeMap";
import Log from "@rbxts/log";
import { Events } from "server/network";

const roundLength = 30;
const hammer = ServerScriptService.Models.hammer;
const kothVariants = ServerScriptService.Maps.KOTH.GetChildren();

async function winCondition(): Promise<Player[]> {
	const [_obliterator, endGame, endGamePromise] = initializeGamemode();

	const variantModel = kothVariants[
		math.random(0, kothVariants.size() - 1)
	] as Model;
	const unclonedTimezone = variantModel.FindFirstChild("timezone");

	if (unclonedTimezone === undefined) {
		Log.Error(
			"koth variant {variant} does not have a *child* named 'timezone'",
			variantModel.Name,
		);
		endGame.Fire();
	}

	if (!unclonedTimezone?.IsA("BasePart")) {
		Log.Error("timezone is not a basepart");
		endGame.Fire();
	}

	const clone = alternativeMap(variantModel);
	const timezone = clone.FindFirstChild("timezone");

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

	Events.startTimer.broadcast(roundLength);
	const times: Record<string, number> = {};

	for (let i = 0; i < roundLength; i++) {
		const overlapping = Workspace.GetPartsInPart(timezone as BasePart);
		const characters: Model[] = [];

		overlapping.forEach((part) => {
			if (!part.Parent?.IsA("Model")) {
				return;
			}

			if (!part.Parent.FindFirstChildWhichIsA("Humanoid")) {
				return;
			}

			if (characters.includes(part.Parent)) {
				return;
			}

			characters.push(part.Parent);
		});

		characters.forEach((character) => {
			const player = Players.GetPlayerFromCharacter(character);

			if (player === undefined) {
				return;
			}

			if (times[player.Name] !== undefined) {
				times[player.Name]++;
			} else {
				times[player.Name] = 1;
			}
		});

		task.wait(1);
	}

	const survivors = store.getState(selectSurvivors);
	let bestExistingPlayer: Player;
	let bestTime = 0;

	for (const [name, value] of pairs(times)) {
		if (value < bestTime) {
			continue;
		}

		// contains method suddenly disappeared?? thats funny...
		const filteredSurvivors = survivors.retain(
			(player) => player.Name === name,
		);
		const player = filteredSurvivors.get(0);
		if (player.isNone()) {
			continue;
		}

		bestTime = value;
		bestExistingPlayer = player.unwrap();
	}

	endGame.Fire();

	return endGamePromise.tap(() => {
		Events.stopTimer.broadcast();

		if (bestTime === 0) {
			Events.announce.broadcast("omg all of u are SO bad");
		} else {
			Events.announce.broadcast(
				`${bestExistingPlayer.Name} wins with ${bestTime}!!`,
			);
		}
	});
}

export = winCondition;
