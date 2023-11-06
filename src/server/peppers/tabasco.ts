import { PepperDefinition } from "types/interfaces/Peppers";

export const Tabasco: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/tabasco",
		name: "tabasco",
		description: "half health n' jump, high speed!",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth = 50;
		humanoid.Health = humanoid.MaxHealth;
		humanoid.JumpPower = 25;
		humanoid.WalkSpeed = 32;
	},
};
