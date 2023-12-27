import { Service, OnStart } from "@flamework/core";
import { PhysicsService, Players } from "@rbxts/services";

const group = "Participant";

@Service()
export class NoPlayerCollision implements OnStart {
	onStart() {
		PhysicsService.RegisterCollisionGroup(group);
		PhysicsService.CollisionGroupSetCollidable(group, group, false);

		// every day i live in hell
		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				character.GetChildren().forEach((child) => {
					if (child.IsA("BasePart")) {
						child.CollisionGroup = group;
					}
				});
			});
		});
	}
}
