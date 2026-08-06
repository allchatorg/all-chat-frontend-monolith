import {createAsyncThunk} from "@reduxjs/toolkit";
import {AppNotification, UnreadCount} from "@/models/AppNotification";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {
    deleteNotification,
    getNotifications,
    getUnreadCount,
    markAllNotificationsRead,
    markNotificationRead,
    markNotificationUnread
} from "@/api/notifications/notificationsAPI";

export const fetchNotificationsThunk = createAsyncThunk<PaginatedResponse<AppNotification>, {
    page: number;
    size: number
}>(
    "notifications/fetch",
    async ({page, size}, {rejectWithValue}) => {
        try {
            return await getNotifications(page, size);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUnreadCountThunk = createAsyncThunk<UnreadCount, void>(
    "notifications/fetchUnreadCount",
    async (_, {rejectWithValue}) => {
        try {
            return await getUnreadCount();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markReadThunk = createAsyncThunk<AppNotification, number>(
    "notifications/markRead",
    async (id, {rejectWithValue}) => {
        try {
            return await markNotificationRead(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markUnreadThunk = createAsyncThunk<AppNotification, number>(
    "notifications/markUnread",
    async (id, {rejectWithValue}) => {
        try {
            return await markNotificationUnread(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markAllReadThunk = createAsyncThunk<void, void>(
    "notifications/markAllRead",
    async (_, {rejectWithValue}) => {
        try {
            await markAllNotificationsRead();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteNotificationThunk = createAsyncThunk<number, number>(
    "notifications/delete",
    async (id, {rejectWithValue}) => {
        try {
            await deleteNotification(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
