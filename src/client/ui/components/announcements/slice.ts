import { createProducer } from "@rbxts/reflex";

export interface AnnouncementsState {
	readonly announcements: readonly string[];
}

const initialState: AnnouncementsState = {
	announcements: [],
};

export const announcementsSlice = createProducer(initialState, {
	addAnnouncement: (state, announcement: string) => ({
		...state,
		announcements: [announcement, ...state.announcements],
	}),

  removeAnnouncement: (state, id: number) => ({
    ...state,
    announcements: state.announcements.filter((alert) -> alert.id !== id)

  })
});