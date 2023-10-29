import { Networking } from "@flamework/networking";
import { CardOption } from "client/ui/components/pepper_prompt/cards";

interface ClientToServerEvents {}

interface ServerToClientEvents {
	announce(text: string): void;
	pepper_prompt(cards: CardOption[]): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
