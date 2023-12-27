import { Players, PhysicsService } from "@rbxts/services";
import { OnStart, Service } from "@flamework/core";

const group = "Player";

@Service()
export class NoPlayerCollision implements OnStart {
	onStart() {
		PhysicsService.RegisterCollisionGroup(group);
		PhysicsService.CollisionGroupSetCollidable(group, group, false);

		// jesus christ lord up above thats a lot of nesting
		Players.PlayerAdded.Connect((player) =>
			player.CharacterAdded.Connect((character) => {
				character.ChildAdded.Connect((child) => {
					if (child.IsA("BasePart")) child.CollisionGroup = group;
				});

				// "wow why are you repeating yourself here" shut up imaginary person i made up in my head its literally only two uses
				character.ChildAdded.Connect((child) => {
					if (child.IsA("BasePart")) child.CollisionGroup = group;
				});
			}),
		);
	}
}
