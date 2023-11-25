import { PepperDefinition } from "types/interfaces/Peppers";

export const GhostPepper: PepperDefinition = {
	option: {
		icon: "rbxgameasset://Images/ghost_pepper",
		name: "ghost_pepper",
		description: "half jump funny float, also literal interpretation lol",
	},
	effect: (rig) => {
		const rootpart = rig.HumanoidRootPart;
		const linearVelocity = new Instance("LinearVelocity");
		linearVelocity.Attachment0 = rootpart.RootAttachment;
		linearVelocity.MaxForce = 2000;
		linearVelocity.VectorVelocity = Vector3.yAxis.mul(1000);
		linearVelocity.Parent = rootpart;

		rig.Humanoid.JumpPower = 20;
	},
};
