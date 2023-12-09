import { createContext } from "@rbxts/roact";
import { PepperOption } from "types/interfaces/Peppers";

interface PromptContext {
	enabled: boolean;
	pressedCallback: (option: PepperOption) => void;
}

export const PromptContext = createContext<PromptContext>({
	enabled: true,
	pressedCallback: () => print("no callback yet!"),
});
