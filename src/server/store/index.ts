import { combineProducers } from "@rbxts/reflex";
import { survivorsSlice } from "./survivors";
function createStore() {
	const store = combineProducers({
		survivorsSlice,
	});

	return store;
}

export const store = createStore();
