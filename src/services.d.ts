interface ServerScriptService {
	Tools: Folder & {
		bomb: Tool & {
			Handle: MeshPart;
		};
		sword: Tool;
		hammer: Tool;
	};
	Maps: Folder & {
		nothing: Model;
		lobby_variants: Folder;
		KOTH: Folder;
		flood_escape: Folder;
	};
}

interface Workspace {
	Lobby: Model;
}
