import api from "@/lib/api";
import {AppNotification, UnreadCount} from "@/models/AppNotification";
import {PaginatedResponse} from "@/models/PaginatedResponse";

const NOTIFICATIONS_PATH = '/notifications';

export const getNotifications = async (page: number, size: number): Promise<PaginatedResponse<AppNotification>> => {
    const res = await api.get<PaginatedResponse<AppNotification>>(NOTIFICATIONS_PATH, {params: {page, size}});
    return res.data;
};

export const getUnreadCount = async (): Promise<UnreadCount> => {
    const res = await api.get<UnreadCount>(`${NOTIFICATIONS_PATH}/unread-count`);
    return res.data;
};

export const markNotificationRead = async (id: number): Promise<AppNotification> => {
    const res = await api.patch<AppNotification>(`${NOTIFICATIONS_PATH}/${id}/read`);
    return res.data;
};

export const markNotificationUnread = async (id: number): Promise<AppNotification> => {
    const res = await api.patch<AppNotification>(`${NOTIFICATIONS_PATH}/${id}/unread`);
    return res.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
    await api.patch(`${NOTIFICATIONS_PATH}/read-all`);
};

export const deleteNotification = async (id: number): Promise<void> => {
    await api.delete(`${NOTIFICATIONS_PATH}/${id}`);
};
