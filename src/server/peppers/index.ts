import { PepperDefinition } from "types/interfaces/Peppers";
import { Tabasco } from "./tabasco";
import { BellPepper } from "./bell_pepper";
import { Jalapeno } from "./jalapeno";

export const peppers =
	//: Record<string, PepperDefinition>
	{
		tabasco: Tabasco,
		bell_pepper: BellPepper,
		jalapeno: Jalapeno,
	};
