import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppNotification} from "@/models/AppNotification";
import {
    deleteNotificationThunk,
    fetchNotificationsThunk,
    fetchUnreadCountThunk,
    markAllReadThunk,
    markReadThunk,
    markUnreadThunk
} from "@/redux/notifications/notificationsThunk";

interface NotificationsState {
    /** Newest first; page 0 replaces, later pages append. */
    items: AppNotification[];
    page: number;
    hasMore: boolean;
    loading: boolean;
    currentRequestId: string | null;
    /** Socket deliveries received after the current list request started. */
    receivedDuringFetch: number[];
    unreadCount: number;
    /** True once the unread count has been fetched for the current session. */
    initialized: boolean;
}

const initialState: NotificationsState = {
    items: [],
    page: 0,
    hasMore: false,
    loading: false,
    currentRequestId: null,
    receivedDuringFetch: [],
    unreadCount: 0,
    initialized: false,
};

const findItem = (state: NotificationsState, id: number) =>
    state.items.find(n => n.id === id);

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        notificationReceived(state, action: PayloadAction<AppNotification>) {
            if (!findItem(state, action.payload.id)) {
                state.items.unshift(action.payload);
                if (state.loading) {
                    state.receivedDuringFetch.push(action.payload.id);
                }
                if (action.payload.readAt === null) {
                    state.unreadCount++;
                }
            }
        },
        // Optimistic toggles; the matching thunk reconciles on fulfilled/rejected.
        markReadLocal(state, action: PayloadAction<number>) {
            const item = findItem(state, action.payload);
            if (item && item.readAt === null) {
                item.readAt = new Date().toISOString();
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markUnreadLocal(state, action: PayloadAction<number>) {
            const item = findItem(state, action.payload);
            if (item && item.readAt !== null) {
                item.readAt = null;
                state.unreadCount++;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationsThunk.pending, (state, action) => {
                state.loading = true;
                state.currentRequestId = action.meta.requestId;
                state.receivedDuringFetch = [];
            })
            .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) return;
                state.loading = false;
                if (action.payload.number === 0) {
                    // A response can predate a socket delivery. Keep those new
                    // notifications even when they are absent from page zero.
                    const fetchedIds = new Set(action.payload.content.map(n => n.id));
                    const receivedIds = new Set(state.receivedDuringFetch);
                    const newItems = state.items.filter(n => receivedIds.has(n.id) && !fetchedIds.has(n.id));
                    state.items = [...newItems, ...action.payload.content];
                } else {
                    const known = new Set(state.items.map(n => n.id));
                    state.items.push(...action.payload.content.filter(n => !known.has(n.id)));
                }
                state.page = action.payload.number;
                state.hasMore = !action.payload.last;
                state.currentRequestId = null;
                state.receivedDuringFetch = [];
            })
            .addCase(fetchNotificationsThunk.rejected, (state, action) => {
                if (state.currentRequestId !== action.meta.requestId) return;
                state.loading = false;
                state.currentRequestId = null;
                state.receivedDuringFetch = [];
            })
            .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
                state.initialized = true;
            })
            .addCase(markReadThunk.fulfilled, (state, action) => {
                const item = findItem(state, action.payload.id);
                if (item) {
                    item.readAt = action.payload.readAt;
                }
            })
            .addCase(markUnreadThunk.fulfilled, (state, action) => {
                const item = findItem(state, action.payload.id);
                if (item) {
                    item.readAt = action.payload.readAt;
                }
            })
            .addCase(markAllReadThunk.fulfilled, (state) => {
                const now = new Date().toISOString();
                state.items.forEach(n => {
                    if (n.readAt === null) {
                        n.readAt = now;
                    }
                });
                state.unreadCount = 0;
            })
            .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
                const item = findItem(state, action.payload);
                if (item && item.readAt === null) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.items = state.items.filter(n => n.id !== action.payload);
            });
    },
});

export const {notificationReceived, markReadLocal, markUnreadLocal} = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
