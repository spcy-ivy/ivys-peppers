import { Signal } from "@rbxts/beacon";
import { Janitor } from "@rbxts/janitor";
import Log from "@rbxts/log";
import { promiseR6 } from "@rbxts/promise-character";
import { Players } from "@rbxts/services";

async function winCondition(): Promise<Player[]> {
	const survivors = Players.GetPlayers();
	const obliterator = new Janitor();
	const endGame = new Signal<undefined>();

	obliterator.Add(endGame);

	const removeSurvivor = (player: Player) => {
		survivors.remove(survivors.indexOf(player, 0));

		if (survivors.size() < 2) endGame.Fire(undefined);
	};

	survivors.forEach((player) => {
		const character = player.Character || player.CharacterAdded.Wait()[0];
		promiseR6(character).then((model) => model.Humanoid.Died.Once(() => removeSurvivor(player)));
	});

	obliterator.Add(Players.PlayerRemoving.Connect(removeSurvivor));

	return new Promise<Player[]>((resolve, _reject, onCancel) => {
		onCancel(() => {
			obliterator.Destroy();
			Log.Info("gamemode has been cancelled!");
		});

		endGame.Wait();
		obliterator.Destroy();
		resolve(survivors);
	});
}

export = winCondition;
