import {AppNotification} from "@/models/AppNotification";
import {ROUTES} from "@/routes";

/**
 * referenceType → detail route. Notifications without a resolvable
 * link (null reference, unknown type) return null and open the details modal.
 */
const REFERENCE_ROUTES: Record<string, (id: number) => string> = {
    AD: (id) => `/portal/ads/${id}`,
    PROMOTED_MESSAGE: (id) => `/portal/promoted-messages/${id}`,
    ROOM_PROMOTION: (id) => `/portal/room-promotions/${id}`,
    // Staff notices about a purchase open its review page, not the owner's.
    ADMIN_AD: (id) => `/portal/admin/ads/${id}`,
    ADMIN_PROMOTED_MESSAGE: (id) => `/portal/admin/promoted-messages/${id}`,
    ADMIN_ROOM_PROMOTION: (id) => `/portal/admin/room-promotions/${id}`,
    REPORT_CASE: (id) => `${ROUTES.REPORTS}/${id}`,
};

export const getNotificationRoute = (notification: AppNotification): string | null => {
    if (notification.referenceType === null || notification.referenceId === null) return null;
    const buildRoute = REFERENCE_ROUTES[notification.referenceType];
    return buildRoute ? buildRoute(notification.referenceId) : null;
};
