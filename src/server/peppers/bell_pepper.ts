import { PepperDefinition } from "types/interfaces/Peppers";

export const BellPepper: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/bell_pepper",
		name: "bell_pepper",
		description: "half health n' speed, high jump!",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth = 50;
		humanoid.Health = humanoid.MaxHealth;
		humanoid.JumpPower = 100;
		humanoid.WalkSpeed = 8;
	},
};
