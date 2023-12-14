import { Players, ServerScriptService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { alternativeMap } from "../helpers/alternativeMap";
import Log from "@rbxts/log";
import { Events } from "server/network";

const roundLength = 30;
const hammer = ServerScriptService.Tools.hammer;
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
	const timezone = clone.FindFirstChild("timezone") as BasePart;

	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => {
				hammer.Clone().Parent = character;
				character.PivotTo(timezone.CFrame.add(Vector3.yAxis.mul(3)));
			});
		});

	Events.startTimer.broadcast(roundLength);
	const times: Map<string, number> = new Map();

	for (let i = 0; i < roundLength; i++) {
		const overlapping = Workspace.GetPartsInPart(timezone);
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

			if (times.has(player.Name)) {
				// as number because we already checked if it was there
				times.set(player.Name, (times.get(player.Name) as number) + 1);
			} else {
				times.set(player.Name, 1);
			}
		});

		task.wait(1);
	}

	const survivors = store.getState(selectSurvivors);
	let bestExistingPlayer: Player | undefined = undefined;
	let bestTime = 0;

	for (const [name, value] of times) {
		if (value < bestTime) {
			continue;
		}

		const foundPlayer = survivors
			.iter()
			.find((player) => player.Name === name);
		if (foundPlayer.isNone()) {
			continue;
		}

		bestTime = value;
		bestExistingPlayer = foundPlayer.unwrap();
	}

	if (bestExistingPlayer !== undefined) {
		endGame.Fire(bestExistingPlayer);
	} else {
		endGame.Fire();
	}

	return endGamePromise.tap(() => {
		if (bestExistingPlayer !== undefined) {
			Events.announce.broadcast(
				`${bestExistingPlayer.Name} wins with ${bestTime}!!`,
			);
		} else {
			Events.announce.broadcast("omg all of u are SO bad");
		}
	});
}

export = winCondition;
