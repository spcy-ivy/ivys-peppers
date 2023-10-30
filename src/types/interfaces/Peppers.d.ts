import { CharacterRigR6 } from "@rbxts/promise-character";

export interface PepperOption {
	icon: string;
	name: string;
	description: string;
}

export interface PepperDefinition {
	option: PepperOption;
	effect: (rig: CharacterRigR6) => void;
}
