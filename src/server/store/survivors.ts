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
		...state,
		survivors: state.survivors.push(player),
	}),

	removeSurvivor: (state, player: Player) => ({
		...state,
		survivors: state.survivors.retain((current) => current !== player),
	}),

	setSurvivors: (state, players: Player[]) => ({
		...state,
		survivors: Vec.vec<Player>(...players),
	}),

	setAllSurvivors: (state) => ({
		...state,
		survivors: Vec.vec<Player>(...Players.GetPlayers()),
	}),

	clearSurvivors: (state) => ({
		...state,
		survivors: Vec.vec<Player>(),
	}),
});

export const selectSurvivors = (state: ServerState) => state.survivorsSlice.survivors;
