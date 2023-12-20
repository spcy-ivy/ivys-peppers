import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";

export const lobbyVariant = (variant: string) => {
	const roundManager = Dependency<RoundManager>();
	roundManager.SetVariant(variant);
};
