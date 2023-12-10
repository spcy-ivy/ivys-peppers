import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";

export const alternativeMap = (map: Model) => {
	const roundManager = Dependency<RoundManager>();
	roundManager.loadAlternativeMap(map);
};