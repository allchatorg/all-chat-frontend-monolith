import {AlertTriangle, Bell, LucideIcon} from "lucide-react";
import {NotificationType} from "@/models/NotificationType";

interface NotificationVisual {
    icon: LucideIcon;
    iconClass: string;
    bgClass: string;
}

/**
 * Per-type icon registry — the extension point for new notification types:
 * add the enum value and one entry here.
 */
const NOTIFICATION_VISUALS: Record<NotificationType, NotificationVisual> = {
    [NotificationType.WARNING]: {
        icon: AlertTriangle,
        iconClass: "text-orange-500",
        bgClass: "bg-orange-500/15",
    },
};

const FALLBACK_VISUAL: NotificationVisual = {
    icon: Bell,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
};

export const getNotificationVisual = (type: NotificationType): NotificationVisual =>
    NOTIFICATION_VISUALS[type] ?? FALLBACK_VISUAL;
