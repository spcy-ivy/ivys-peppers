import { Signal } from "@rbxts/beacon";
import { Janitor } from "@rbxts/janitor";
import Log from "@rbxts/log";
import { promiseR6 } from "@rbxts/promise-character";
import { Players } from "@rbxts/services";
import { store } from "server/store";

async function winCondition(): Promise<Player[]> {
	const obliterator = new Janitor();
	const endGame = new Signal<undefined>();

	obliterator.Add(endGame);

	obliterator.Add(
		store.observe(
			(state) => state.survivorsSlice,
			(survivors) => {
				if (survivors.len() < 2) endGame.Fire(undefined);
			},
		),
	);

	const retrieved = store.getState().survivorsSlice.survivors;

	/*
	if (retrieved.len() < 2) {
		return new Promise<Player[]>((resolve) => {
			Log.Error("not enough players!");
			resolve([]);
		});
	}
  */

	retrieved.iter().forEach((player) => {
		const character = player.Character || player.CharacterAdded.Wait()[0];
		promiseR6(character).then((model) => model.Humanoid.Died.Once(() => store.removeSurvivor(player)));
	});

	obliterator.Add(Players.PlayerRemoving.Connect((player) => store.removeSurvivor(player)));

	return new Promise<Player[]>((resolve, _reject, onCancel) => {
		onCancel(() => {
			obliterator.Destroy();
			Log.Info("gamemode has been cancelled!");
		});

		endGame.Wait();
		obliterator.Destroy();

		const survivors = store.getState().survivorsSlice.survivors;
		resolve(survivors.asPtr());
	});
}

export = winCondition;
