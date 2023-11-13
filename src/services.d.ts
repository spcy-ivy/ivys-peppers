interface ServerScriptService {
	Models: Folder & {
		bomb: Tool & {
			Handle: MeshPart;
		};
		sword: Tool;
	};
	Maps: Folder & {
		lobby_variants: Folder;
	};
}

interface Workspace {
	Lobby: Model;
}
