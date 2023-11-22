import { useState } from "@rbxts/roact";

// needs extends defined bc old.filter wont stop whining about it
export function useArray<T extends defined>(defaultValue: T[]) {
	const [array, setArray] = useState<T[]>(defaultValue);

	const push = (element: T) => setArray((old) => [...old, element]);
	const remove = (index: number) => setArray((old) => old.filter((_, i) => i !== index));

	return { array, set: setArray, push, remove };
}
