import { config, SpringOptions } from "@rbxts/ripple";

export const springs: { [config: string]: SpringOptions } = {
	...config.spring,
	bubbly: { tension: 300, friction: 20, mass: 1.2 },
	responsive: { tension: 600, friction: 34, mass: 0.7 },
};
// getting rid of satisfies since eslint/prettier doesnt like it lmao
// satisfies { [config: string]: SpringOptions };
