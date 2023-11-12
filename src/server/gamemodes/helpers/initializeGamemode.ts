// YEAH YEAH I KNOW ITS OVERABSTRACTION
// SHUT UP IT REMOVES BOILERPLATE :sob:
import { Players } from "@rbxts/services";
import { Signal } from "@rbxts/beacon";
import { Janitor } from "@rbxts/janitor";
import { promiseR6 } from "@rbxts/promise-character";
import { store } from "server/store";
import { selectSurvivors, survivorsSlice } from "server/store/survivors";
import Log from "@rbxts/log";

export function initializeGamemode(): [Janitor<void>, Signal<Player[]>, Promise<Player[]>] {
	const endGame = new Signal<Player[]>();
	const obliterator = new Janitor();

	obliterator.Add(endGame);

	// apparently it doesnt work with the selector :eyeroll:
	obliterator.Add(
		store.subscribe((state) => {
			const survivors = state.survivorsSlice.survivors;
			if (survivors.len() < 2) endGame.Fire(...survivors.asPtr());
		}),
	);

	const retrieved = store.getState(selectSurvivors);

	if (retrieved.len() < 2) {
		Log.Error("not enough players!");
		endGame.Fire();
	}

	retrieved.iter().forEach((player) => {
		const character = player.Character || player.CharacterAdded.Wait()[0];
		promiseR6(character).then((model) =>
			model.Humanoid.Died.Once(() => {
				print("died!!");
				print(store.getState(selectSurvivors));
				store.removeSurvivor(player);
				print(store.getState(selectSurvivors));
			}),
		);
	});

	obliterator.Add(Players.PlayerRemoving.Connect((player) => store.removeSurvivor(player)));

	const endGamePromise = new Promise<Player[]>((resolve, _reject, onCancel) => {
		onCancel(() => {
			Log.Info("gamemode has been cancelled!");
			obliterator.Destroy();
		});

		const winners = endGame.Wait();
		obliterator.Destroy();

		resolve(winners);
	});

	return [obliterator, endGame, endGamePromise];
}
