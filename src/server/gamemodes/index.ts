import TestMode from "server/gamemodes/modes/TestMode";

export const gamemodes: Record<string, () => Promise<Player[]>> = {
	test_mode: TestMode,
};
