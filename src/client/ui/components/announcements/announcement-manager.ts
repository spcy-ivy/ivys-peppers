// thanks littensy for the code >:) https://github.com/littensy/slither/blob/main/src/client/store/alert/alert-slice.ts
import { createProducer } from "@rbxts/reflex";
import { Announcement } from "types/interfaces/Announcement";

interface State {
	announcements: Announcement[];
}

let currentId = 0;

const initialState: State = {
	announcements: [],
};

export const AnnouncementsSlice = createProducer(initialState, {
	addAnnouncement: (state, announcement: Announcement) => ({
		...state,
		announcements: [...state.announcements, announcement],
	}),

	removeAnnouncement: (state, id: number) => ({
		...state,
		announcements: state.announcements.filter((announcements) => announcements.id !== id),
	}),

	setAnnouncementVisible: (state, id: number, visible: boolean) => ({
		...state,
		announcements: state.announcements.map((announcement) =>
			announcement.id === id ? { ...announcement, visible } : announcement,
		),
	}),
});

export const selectAlerts = (state: State) => {
	return state.announcements;
};

export function sendText(text: string) {
	const alert = {
		text: text,
		visible: true,
		id: currentId++,
	};

	print(currentId);

	AnnouncementsSlice.addAnnouncement(alert);

	Promise.delay(5).then(() => {
		dismissAlert(alert.id);
	});
}

async function dismissAlert(id: number) {
	AnnouncementsSlice.setAnnouncementVisible(id, false);

	return Promise.delay(1).then(() => {
		AnnouncementsSlice.removeAnnouncement(id);
		return id;
	});
}
