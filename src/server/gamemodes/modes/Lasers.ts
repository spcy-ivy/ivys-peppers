import { Events } from "server/network";
import { initializeGamemode } from "../helpers/initializeGamemode";
import { store } from "server/store";
import { selectSurvivors } from "server/store/survivors";
import { TweenService, Workspace } from "@rbxts/services";
import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";

const roundLength = 30;
const laserDamage = 10;
const laserTravelLength = 4;

function createLaser() {
	const rotation = math.random(0, 1) * 90;
	const laser = new Instance("Part");

	laser.Size = new Vector3(100, 1, 1);
	laser.Orientation = Vector3.yAxis.mul(rotation);
	laser.Position = laser.CFrame.LookVector.mul(50);
	laser.Anchored = true;
	laser.CanCollide = false;
	laser.Color = Color3.fromRGB(168, 82, 71);
	laser.Material = Enum.Material.Neon;

	laser.Touched.Connect((other) =>
		other.Parent?.FindFirstChildWhichIsA("Humanoid")?.TakeDamage(
			laserDamage,
		),
	);

	TweenService.Create(
		laser,
		new TweenInfo(
			laserTravelLength,
			Enum.EasingStyle.Linear,
			Enum.EasingDirection.Out,
			-1,
			true,
			0,
		),
		{
			Position: laser.CFrame.LookVector.mul(-50),
		},
	).Play();

	laser.Parent = Workspace;

	return laser;
}

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	Dependency<RoundManager>().SetVariant("flat");

	obliterator.AddPromise(
		Promise.each([1, 2, 3, 4, 5, 6], () => {
			return Promise.delay(2).andThen(() => {
				obliterator.Add(createLaser());
			});
		}),
	);

	obliterator.AddPromise(
		Promise.delay(roundLength).andThen(() => {
			endGame.Fire(...store.getState(selectSurvivors).asPtr());
		}),
	);

	Events.startTimer.broadcast(roundLength);

	return endGamePromise;
}

export = winCondition;
