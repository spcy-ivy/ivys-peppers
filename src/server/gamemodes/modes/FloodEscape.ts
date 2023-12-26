import {
	Players,
	ServerScriptService,
	TweenService,
	Workspace,
} from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import Log from "@rbxts/log";
import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { Events } from "server/network";
import colorscheme from "shared/colorscheme";

const roundLength = 10;
const floodVariants = ServerScriptService.Maps.flood_escape.GetChildren();
const lavaHeight = 50;
const yOffset = -3; // for the lava

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	const variantModel = floodVariants[
		math.random(0, floodVariants.size() - 1)
	] as Model;
	const unclonedWinPlatform = variantModel.FindFirstChild("win_platform");

	if (unclonedWinPlatform === undefined) {
		Log.Error(
			"koth variant {variant} does not have a *child* named 'win_platform'",
			variantModel.Name,
		);
		endGame.Fire();
	}

	if (!unclonedWinPlatform?.IsA("BasePart")) {
		Log.Error("win_platform is not a basepart");
		endGame.Fire();
	}

	const clone = Dependency<RoundManager>().LoadAlternativeMap(variantModel);
	const winPlatform = clone.FindFirstChild("win_platform") as BasePart;

	store
		.getState(selectSurvivors)
		.iter()
		.forEach((player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			promiseR6(model).then((character) => {
				character.PivotTo(new CFrame(40, 5, 40));
			});
		});

	const winners: Player[] = [];

	winPlatform.Touched.Connect((touched) => {
		const character = touched.Parent;
		if (!character?.FindFirstChildWhichIsA("Humanoid")) {
			return;
		}

		const player = Players.GetPlayerFromCharacter(touched.Parent as Model);

		if (player && !winners.includes(player)) {
			winners.push(player);

			const highlight = new Instance("Highlight");
			highlight.FillColor = colorscheme.green;
			highlight.Parent = character;
		}
	});

	const lava = obliterator.Add(new Instance("Part"));
	lava.Anchored = true;
	lava.CanCollide = false;
	lava.Size = new Vector3(95, 1, 95);
	lava.Position = Vector3.yAxis.mul(yOffset);
	lava.Color = colorscheme.lighter_background;
	lava.Material = Enum.Material.Neon;

	lava.Touched.Connect((touched) => {
		const character = touched.Parent;
		const humanoid = character?.FindFirstChildWhichIsA("Humanoid");

		if (!humanoid) {
			return;
		}

		const player = Players.GetPlayerFromCharacter(touched.Parent as Model);

		if (player && !winners.includes(player)) {
			humanoid.TakeDamage(1);
		}
	});

	lava.Parent = Workspace;

	obliterator.AddPromise(
		Promise.delay(2).then(() => {
			obliterator
				.Add(
					TweenService.Create(
						lava,
						// lmao the worlds most random time tracking method
						new TweenInfo(roundLength + roundLength / 2),
						{
							Position: Vector3.yAxis.mul(
								(lavaHeight + yOffset) / 2,
							),
							Size: new Vector3(95, lavaHeight - yOffset, 95),
						},
					),
				)
				.Play();
		}),
	);

	obliterator.AddPromise(
		Promise.delay(roundLength).then(() => {
			endGame.Fire(...winners);
		}),
	);

	Events.startTimer.broadcast(roundLength);

	return endGamePromise;
}

export = winCondition;
