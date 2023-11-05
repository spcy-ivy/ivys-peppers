import { combineProducers, CombineStates } from "@rbxts/reflex";
import { survivorsSlice } from "./survivors";

const slices = {
	survivorsSlice,
};

export const store = combineProducers(slices);
export type ServerState = CombineStates<typeof slices>;
