import { PepperDefinition } from "types/interfaces/Peppers";

export const Jalapeno: PepperDefinition = {
	option: {
		icon: "",
		name: "jalapeno",
		description: "dunno what this does yet lol",
	},
	effect: (rig) => {
		const humanoid = rig.Humanoid;
	},
};
