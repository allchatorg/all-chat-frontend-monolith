import {AppNotification} from "@/models/AppNotification";

/**
 * referenceType → portal detail route. Notifications without a resolvable
 * link (null reference, unknown type) return null and open the details modal.
 */
const REFERENCE_ROUTES: Record<string, (id: number) => string> = {
    AD: (id) => `/portal/ads/${id}`,
    PROMOTED_MESSAGE: (id) => `/portal/promoted-messages/${id}`,
};

export const getNotificationRoute = (notification: AppNotification): string | null => {
    if (notification.referenceType === null || notification.referenceId === null) return null;
    const buildRoute = REFERENCE_ROUTES[notification.referenceType];
    return buildRoute ? buildRoute(notification.referenceId) : null;
};
