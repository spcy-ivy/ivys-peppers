import { Networking } from "@flamework/networking";
import { PepperOption } from "types/interfaces/Peppers";

interface ClientToServerEvents {}

interface ServerToClientEvents {
	announce(text: string): void;
	pepper_prompt(cards: PepperOption[]): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
