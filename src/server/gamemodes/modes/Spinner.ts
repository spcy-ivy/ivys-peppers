import { TweenService, Workspace } from "@rbxts/services";
import { initializeGamemode } from "../helpers/initializeGamemode";

const cycles = 2;
const delay = 2;
const damage = 50;

async function winCondition(): Promise<Player[]> {
	const [obliterator, endGame, endGamePromise] = initializeGamemode();

	const spinnerPart = new Instance("Part");
	spinnerPart.Size = new Vector3(1, 1, 50);
	spinnerPart.Position = Vector3.yAxis;
	spinnerPart.Anchored = true;
	spinnerPart.Touched.Connect((touched) => touched.Parent?.FindFirstChildWhichIsA("Humanoid")?.TakeDamage(damage));
	spinnerPart.Parent = Workspace;

	obliterator.Add(spinnerPart);

	for (let i = 0; i < cycles; i++) {
		TweenService.Create(spinnerPart, new TweenInfo(1), {
			Orientation: spinnerPart.Orientation.add(Vector3.yAxis.mul(180)),
		}).Play();

		task.wait(delay);
	}

	endGame.Fire();

	return endGamePromise;
}

export = winCondition;
