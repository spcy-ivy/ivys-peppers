import { Flamework, Modding } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";
import Zircon from "@rbxts/zircon";

Log.SetLogger(Logger.configure().WriteTo(Zircon.Log.Console()).Create());
// Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create());

Modding.registerDependency<Logger>((ctor) => {
	return Log.ForContext(ctor);
});

Flamework.addPaths("src/server/components");
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared/components");

Flamework.ignite();
