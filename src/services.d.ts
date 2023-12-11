interface ServerScriptService {
	Models: Folder & {
		bomb: Tool & {
			Handle: MeshPart;
		};
		sword: Tool;
		hammer: Tool;
	};
	Maps: Folder & {
		lobby_variants: Folder;
		KOTH: Folder;
	};
}

interface Workspace {
	Lobby: Model;
}
