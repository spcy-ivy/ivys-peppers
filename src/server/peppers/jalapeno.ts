import { PepperDefinition } from "types/interfaces/Peppers";

export const Jalapeno: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/jalapeno",
		name: "jalapeno",
		description: "walk and jump 1.25x but health is 25",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth = 25;
		humanoid.Health = humanoid.MaxHealth;
		humanoid.JumpPower = 75;
		humanoid.WalkSpeed = 24;
	},
};
