import { Players } from "@rbxts/services";
import { createProducer } from "@rbxts/reflex";
import { Vec } from "@rbxts/rust-classes";
import { ServerState } from ".";

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
		survivors: state.survivors.retain((current) => current !== player),
	}),

	setSurvivors: (_state, players: Player[]) => ({
		survivors: Vec.vec<Player>(...players),
	}),

	setAllSurvivors: (_state) => ({
		survivors: Vec.vec<Player>(...Players.GetPlayers()),
	}),

	clearSurvivors: () => ({
		survivors: Vec.vec<Player>(),
	}),
});

export const selectSurvivors = (state: ServerState) => {
	return state.survivorsSlice.survivors;
};
