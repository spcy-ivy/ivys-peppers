interface ServerScriptService {
	Models: Folder & {
		bomb: Tool & {
			Handle: MeshPart & {
				Stem: UnionOperation & {
					ParticleEmitter: ParticleEmitter;
					WeldConstraint: WeldConstraint;
				};
				Decal: Decal;
				Top: MeshPart & {
					WeldConstraint: WeldConstraint;
				};
			};
		};
		sword: Tool & {
			Handle: Part & {
				SwordLunge: Sound;
				Unsheath: Sound;
				Mesh: SpecialMesh;
				SwordSlash: Sound;
			};
			MouseIcon: LocalScript;
			SwordScript: Script;
		};
	};
}
