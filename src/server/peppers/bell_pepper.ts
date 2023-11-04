import { PepperDefinition } from "types/interfaces/Peppers";

export const BellPepper: PepperDefinition = {
	option: {
		icon: "",
		name: "bell pepper",
		description: "dunno what this does yet lol",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
	},
};
