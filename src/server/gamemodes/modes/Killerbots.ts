import { TweenService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { promiseR6 } from "@rbxts/promise-character";
import { Events } from "server/network";
import { randomLobbyVariant } from "../helpers/randomLobbyVariant";

const roundLength = 30;
const missileTravelLength = 0.5;

async function createMissile(player: Player, killerbot: Part) {
	const model = player.Character || player.CharacterAdded.Wait()[0];
	const character = await promiseR6(model);
	const rootpart = character.HumanoidRootPart;

	const missile = new Instance("Part");
	missile.CFrame = CFrame.lookAt(killerbot.Position, rootpart.Position);
	missile.Size = new Vector3(1, 1, 4);
	missile.Anchored = true;
	missile.BrickColor = new BrickColor(21);

	missile.FrontSurface = Enum.SurfaceType.Studs;
	missile.BackSurface = Enum.SurfaceType.Studs;
	missile.TopSurface = Enum.SurfaceType.Studs;
	missile.BottomSurface = Enum.SurfaceType.Studs;
	missile.LeftSurface = Enum.SurfaceType.Studs;
	missile.RightSurface = Enum.SurfaceType.Studs;

	missile.Parent = Workspace;

	const tween = TweenService.Create(
		missile,
		new TweenInfo(missileTravelLength, Enum.EasingStyle.Linear),
		{
			Position: rootpart.Position.add(
				new Vector3(
					math.random(-10, 10),
					math.random(-10, 10),
					math.random(-10, 10),
				),
			),
		},
	);

	tween.Play();
	tween.Completed.Wait();

	const explosion = new Instance("Explosion");
	explosion.Position = missile.Position;
	explosion.Parent = Workspace;

	missile.Destroy();
}

function createKillerbot() {
	const killerbot = new Instance("Part");
	killerbot.Shape = Enum.PartType.Ball;
	killerbot.Reflectance = 0.2;
	killerbot.Color = Color3.fromRGB(253, 234, 141);
	killerbot.Size = Vector3.one.mul(4);
	killerbot.Anchored = true;
	killerbot.CanCollide = false;
	killerbot.Position = new Vector3(
		math.random(-40, 40),
		20,
		math.random(-40, 40),
	);

	killerbot.FrontSurface = Enum.SurfaceType.Weld;
	killerbot.BackSurface = Enum.SurfaceType.Weld;
	killerbot.TopSurface = Enum.SurfaceType.Weld;
	killerbot.BottomSurface = Enum.SurfaceType.Weld;
	killerbot.LeftSurface = Enum.SurfaceType.Weld;
	killerbot.RightSurface = Enum.SurfaceType.Weld;

	const loop = task.defer(() => {
		for (;;) {
			task.wait(1);

			const tween = TweenService.Create(killerbot, new TweenInfo(1), {
				Position: new Vector3(
					math.random(-40, 40),
					20,
					math.random(-40, 40),
				),
			});

			tween.Play();
			tween.Completed.Wait();

			const survivors = store.getState(selectSurvivors);
			const chosenPlayer = survivors.get(math.random(0, survivors.len()));
			if (chosenPlayer.isSome()) {
				createMissile(chosenPlayer.unwrap(), killerbot);
			}
		}
	});

	killerbot.Parent = Workspace;

	return () => {
		task.cancel(loop);
		killerbot.Destroy();
	};
}

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	obliterator.AddPromise(
		Promise.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], () => {
			return Promise.delay(1).andThen(() => {
				obliterator.Add(createKillerbot());
			});
		}),
	);

	obliterator.AddPromise(
		Promise.delay(roundLength).andThen(() => {
			endGame.Fire(...store.getState(selectSurvivors).asPtr());
		}),
	);

	randomLobbyVariant();
	Events.startTimer.broadcast(roundLength);

	return endGamePromise;
}

export = winCondition;
