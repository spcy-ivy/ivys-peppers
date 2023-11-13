import { store } from "server/store";

export const lobbyVariant = () => {
	// 50% chance
	const random = math.random(1, 2);
	print(random);
	if (random === 1) {
		store.setRandomLobby();
	}
};
