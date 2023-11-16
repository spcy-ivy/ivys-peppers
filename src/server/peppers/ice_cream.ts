import { PepperDefinition } from "types/interfaces/Peppers";

export const IceCream: PepperDefinition = {
	option: {
		icon: "",
		name: "ice_cream",
		description: "health 1.25x but walk and jump 0.75x",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth = 125;
		humanoid.Health = humanoid.MaxHealth;
		// actual number is like 37.5 but who cares
		humanoid.JumpPower = 35;
		humanoid.WalkSpeed = 12;
	},
};
