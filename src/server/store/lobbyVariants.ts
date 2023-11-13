import { ServerScriptService } from "@rbxts/services";
import { createProducer } from "@rbxts/reflex";
import { Option } from "@rbxts/rust-classes";
import Log from "@rbxts/log";
import { ServerState } from ".";

const variantNames: string[] = [];

ServerScriptService.Maps.lobby_variants.GetChildren().forEach((map) => {
	variantNames.push(map.Name);
});

export type LobbyVariantsState = {
	variant: Option<string>;
};

const initialState: LobbyVariantsState = {
	variant: Option.none(),
};

export const lobbyVariantsSlice = createProducer(initialState, {
	setLobby: (state, variant: string) => {
		if (!variantNames.includes(variant)) {
			Log.Warn(`${variant} is not a lobby variant!`);
			return state;
		}

		return { ...state, variant: Option.some(variant) };
	},

	setRandomLobby: (state) => ({
		...state,
		variant: Option.some(variantNames[math.random(0, variantNames.size() - 1)]),
	}),

	setDefaultLobby: (state) => ({ ...state, variant: Option.none() }),
});

export const selectVariant = (state: ServerState) => state.lobbyVariantsSlice.variant;
