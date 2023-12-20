import { Dependency } from "@flamework/core";
import { RoundManager } from "server/services/RoundManager";

export const randomLobbyVariant = () => {
	// putting inside because apparently it gets the dependency before it initializes
	const roundManager = Dependency<RoundManager>();

	// 50% chance
	const random = math.random(1, 2);
	print(random);
	if (random === 1) {
		roundManager.SetRandomVariant();
	}
};
