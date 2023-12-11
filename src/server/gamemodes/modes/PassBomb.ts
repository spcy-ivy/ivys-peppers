import { Players, ServerScriptService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import Log from "@rbxts/log";
import { Option } from "@rbxts/rust-classes";
import { lobbyVariant } from "../helpers/lobbyVariant";
import { Events } from "server/network";

//const round_length = 120;
const roundLength = 30;
const bombBase = ServerScriptService.Models.bomb;

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	const bomb = bombBase.Clone();
	const handle = bomb.Handle;
	let assigned: Option<Player> = Option.none();

	obliterator.Add(bomb);

	const assign_bomb = (player: Player) => {
		assigned = Option.some(player);
		const character = player.Character || player.CharacterAdded.Wait()[0];
		bomb.Parent = character;
	};

	const assign_bomb_to_random = () => {
		const survivors = store.getState(selectSurvivors);
		const random = survivors.get(math.random(0, survivors.len() - 1));

		if (random.isNone()) {
			Log.Error(
				"lmao apparently we errored trying to select a player???",
			);
			endGame.Fire();
			return;
		}

		assign_bomb(random.unwrap());
	};

	// yknow.. when the player holding the bomb leaves/dies
	obliterator.Add(
		store.subscribe(selectSurvivors, (survivors) => {
			if (assigned.isNone()) return;

			const holding = assigned.unwrap();
			const found = survivors.iter().any((player) => player === holding);

			if (found) assign_bomb_to_random();
		}),
	);

	// when the bomb gets destroyed for some reason (it can fall off of the void)
	obliterator.Add(bomb.Destroying.Connect(() => endGame.Fire()));

	// not adding onto janitor since the instance is already in it (and destroying instance auto disconnects all of its events)
	handle.Touched.Connect((touched) => {
		if (assigned.isNone()) return;
		const holding = assigned.unwrap();

		const humanoid = touched.Parent?.FindFirstChildWhichIsA("Humanoid");
		if (!humanoid) return;

		const model = humanoid.Parent;
		const player = Players.GetPlayerFromCharacter(model);
		if (!player) return;
		if (holding === player) return;

		assigned = Option.some(player);
		bomb.Parent = model;

		handle.CanTouch = false;
		task.wait(0.5);
		handle.CanTouch = true;
	});

	obliterator.AddPromise(
		Promise.delay(roundLength).then(() => {
			const survivors = store.getState(selectSurvivors);

			if (assigned.isSome()) {
				const explosion = new Instance("Explosion");
				explosion.Position = bomb.Handle.Position;
				explosion.Parent = Workspace;

				endGame.Fire(
					...survivors
						.retain((current) => current !== assigned.unwrap())
						.asPtr(),
				);
			} else {
				Log.Error("cant get person holding bomb so NOBODY wins!!!");
				endGame.Fire();
			}
		}),
	);

	lobbyVariant();
	assign_bomb_to_random();
	Events.startTimer.broadcast(roundLength);

	return endGamePromise.tap(() => {
		Events.stopTimer.broadcast();
		task.wait(1); // waits so that the players can see who won
		Events.announce.broadcast(`${assigned.unwrap()} has lost!`);
	});
}

export = winCondition;
