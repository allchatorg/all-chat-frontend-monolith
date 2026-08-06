import {NotificationType} from "@/models/NotificationType";

// Named AppNotification (not Notification) to avoid silently type-checking
// against the DOM's global Notification when an import is forgotten.
export interface AppNotification {
    id: number;
    type: NotificationType;
    title: string;
    body: string | null;
    /** Opaque JSON string with type-specific detail data, or null. */
    metadata: string | null;
    referenceType: string | null;
    referenceId: number | null;
    /** ISO timestamp; null means unread. */
    readAt: string | null;
    createdAt: string;
}

export interface UnreadCount {
    count: number;
}
