import { PepperDefinition } from "types/interfaces/Peppers";

export const Tabasco: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/pepper",
		name: "tabasco",
		description: "not the sauce. half health, no jump, high speed!",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth /= 2;
		humanoid.Health = humanoid.MaxHealth;
		humanoid.JumpPower = 0;
		humanoid.WalkSpeed = 32;
	},
};
