import { Networking } from "@flamework/networking";
import { PepperOption } from "types/interfaces/Peppers";

interface ClientToServerEvents {
	confirmPepper(pepperName: string): void;
}

interface ServerToClientEvents {
	announce(text: string): void;

	pepperPrompt(cards: PepperOption[]): void;
	cancelPepperPrompt(): void;

	transition(): void;
	cancelTransition(): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<
	ClientToServerEvents,
	ServerToClientEvents
>();
export const GlobalFunctions = Networking.createFunction<
	ClientToServerFunctions,
	ServerToClientFunctions
>();
