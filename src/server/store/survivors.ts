import { createProducer } from "@rbxts/reflex";
import { Vec } from "@rbxts/rust-classes";

export type SurvivorsState = {
	survivors: Vec<Player>;
};

const initialState: SurvivorsState = {
	survivors: Vec.vec<Player>(),
};

export const survivorsSlice = createProducer(initialState, {
	addSurvivor: (state, player: Player) => ({
		survivors: state.survivors.push(player),
	}),

	removeSurvivor: (state, player: Player) => ({
		// the [0] is the vec where the condition is met
		// good god functional programming is so cursed yet so beautiful...
		survivors: state.survivors.iter().partition((current) => current !== player)[0],
	}),

	setSurvivors: (_state, players: Player[]) => ({
		survivors: Vec.vec<Player>(...players),
	}),

	clearSurvivors: () => ({
		survivors: Vec.vec<Player>(),
	}),
});
