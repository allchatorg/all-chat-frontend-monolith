'use client';
import {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {selectUser} from "@/redux/user/userSelectors";
import {
    selectNotifications,
    selectNotificationsHasMore,
    selectNotificationsInitialized,
    selectNotificationsLoading,
    selectNotificationsPage,
    selectUnreadCount
} from "@/redux/notifications/notificationsSelectors";
import {markReadLocal, markUnreadLocal} from "@/redux/notifications/notificationsSlice";
import {
    deleteNotificationThunk,
    fetchNotificationsThunk,
    fetchUnreadCountThunk,
    markAllReadThunk,
    markReadThunk,
    markUnreadThunk
} from "@/redux/notifications/notificationsThunk";
import {AppNotification} from "@/models/AppNotification";

const PAGE_SIZE = 10;

/**
 * Shared notification-center logic. The details modal is opened by the caller
 * (chat and portal use different DialogProviders), so it is injected.
 */
export const useNotifications = (openDetails?: (notification: AppNotification) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const notifications = useSelector(selectNotifications);
    const unreadCount = useSelector(selectUnreadCount);
    const hasMore = useSelector(selectNotificationsHasMore);
    const loading = useSelector(selectNotificationsLoading);
    const page = useSelector(selectNotificationsPage);
    const initialized = useSelector(selectNotificationsInitialized);

    useEffect(() => {
        if (user?.id && !initialized) {
            dispatch(fetchUnreadCountThunk());
        }
    }, [user?.id, initialized, dispatch]);

    const refresh = useCallback(() => {
        dispatch(fetchNotificationsThunk({page: 0, size: PAGE_SIZE}));
        // Keep the badge consistent with the freshly fetched list.
        dispatch(fetchUnreadCountThunk());
    }, [dispatch]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchNotificationsThunk({page: page + 1, size: PAGE_SIZE}));
        }
    }, [dispatch, loading, hasMore, page]);

    const resyncOnError = useCallback(() => {
        dispatch(fetchUnreadCountThunk());
    }, [dispatch]);

    const markRead = useCallback((notification: AppNotification) => {
        dispatch(markReadLocal(notification.id));
        dispatch(markReadThunk(notification.id)).unwrap().catch(() => {
            dispatch(markUnreadLocal(notification.id));
            resyncOnError();
        });
    }, [dispatch, resyncOnError]);

    const onItemClick = useCallback((notification: AppNotification) => {
        if (notification.readAt === null) {
            markRead(notification);
        }
        openDetails?.(notification);
    }, [markRead, openDetails]);

    const onToggleRead = useCallback((notification: AppNotification) => {
        if (notification.readAt === null) {
            markRead(notification);
        } else {
            dispatch(markUnreadLocal(notification.id));
            dispatch(markUnreadThunk(notification.id)).unwrap().catch(() => {
                dispatch(markReadLocal(notification.id));
                resyncOnError();
            });
        }
    }, [dispatch, markRead, resyncOnError]);

    const onDelete = useCallback((notification: AppNotification) => {
        dispatch(deleteNotificationThunk(notification.id));
    }, [dispatch]);

    const onMarkAllRead = useCallback(() => {
        dispatch(markAllReadThunk());
    }, [dispatch]);

    return {
        notifications,
        unreadCount,
        hasMore,
        loading,
        refresh,
        loadMore,
        onItemClick,
        onToggleRead,
        onDelete,
        onMarkAllRead,
    };
};
