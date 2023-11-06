import { PepperDefinition } from "types/interfaces/Peppers";

export const CarolinaReaper: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/carolina_reaper",
		name: "carolina reaper",
		description: "fast but cant jump and 1 health lol",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
		humanoid.MaxHealth = 1;
		humanoid.Health = humanoid.MaxHealth;
		humanoid.JumpPower = 0;
		humanoid.WalkSpeed = 64;
	},
}
