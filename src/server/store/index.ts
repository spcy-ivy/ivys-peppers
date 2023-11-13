import { combineProducers, InferState } from "@rbxts/reflex";
import { survivorsSlice } from "./survivors";
import { lobbyVariantsSlice } from "./lobbyVariants";

export type ServerStore = typeof store;
export type ServerState = InferState<ServerStore>;

export const store = combineProducers({
	survivorsSlice,
	lobbyVariantsSlice,
});
