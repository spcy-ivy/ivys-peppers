import { combineProducers, InferState } from "@rbxts/reflex";
import { survivorsSlice } from "./survivors";

export type ServerStore = typeof store;
export type ServerState = InferState<ServerStore>;

export const store = combineProducers({
	survivorsSlice,
});
