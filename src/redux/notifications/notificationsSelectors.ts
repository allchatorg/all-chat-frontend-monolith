import {RootState} from "@/redux/store";

export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsHasMore = (state: RootState) => state.notifications.hasMore;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;
export const selectNotificationsPage = (state: RootState) => state.notifications.page;
export const selectNotificationsInitialized = (state: RootState) => state.notifications.initialized;
