import { ServerScriptService, TweenService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { Events } from "server/network";
import colorscheme from "shared/colorscheme";
import { promiseR6 } from "@rbxts/promise-character";

const roundLength = 30;
const partSize = 7.5;
const fadeTime = 0.3;
const respawnTime = 5;
const startingPosition = new Vector3(-45 + partSize / 2, 1, -45 + partSize / 2);

const nothing = ServerScriptService.Maps.nothing;

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	const map = new Instance("Model");
	map.Name = "spleef";

	for (let y = 0; y < 90 / partSize; y++) {
		for (let x = 0; x < 90 / partSize; x++) {
			const part = new Instance("Part");
			part.Anchored = true;
			part.Size = new Vector3(partSize, 1, partSize);

			if (x % 2 === 0) {
				part.Color = colorscheme.background;
			} else {
				part.Color = colorscheme.lighter_background;
			}

			part.TopSurface = Enum.SurfaceType.Smooth;
			part.BottomSurface = Enum.SurfaceType.Smooth;

			part.Position = new Vector3(
				startingPosition.X + x * partSize,
				1,
				// confusing naming i know
				startingPosition.Z + y * partSize,
			);

			part.Touched.Connect((_touched) => {
				part.CanTouch = false;

				// dude this is gross
				// the formatter did this so dont blame me
				const tween = TweenService.Create(
					part,
					new TweenInfo(fadeTime),
					{
						Transparency: 1,
					},
				);

				tween.Play();
				tween.Completed.Wait();
				part.CanCollide = false;
				task.wait(respawnTime);

				part.CanTouch = true;
				part.CanCollide = true;
				part.Transparency = 0;
			});

			part.Parent = map;
		}
	}

	obliterator.AddPromise(
		Promise.delay(roundLength).andThen(() => {
			endGame.Fire(...store.getState(selectSurvivors).asPtr());
		}),
	);
	obliterator.Add(map);

	map.Parent = Workspace;
	Dependency<RoundManager>().LoadAlternativeMap(nothing);

	store
		.getState(selectSurvivors)
		.iter()
		.forEach(async (player) => {
			const model = player.Character || player.CharacterAdded.Wait()[0];
			const character = await promiseR6(model);

			character.PivotTo(new CFrame(Vector3.yAxis.mul(10)));
			character.HumanoidRootPart.Anchored = true;
			task.wait(3);
			character.HumanoidRootPart.Anchored = false;
		});

	Events.startTimer.broadcast(roundLength);

	return endGamePromise;
}

export = winCondition;
