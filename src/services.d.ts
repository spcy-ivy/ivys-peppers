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
	};
}
