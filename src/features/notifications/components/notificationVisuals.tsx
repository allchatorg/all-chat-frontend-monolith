import {
    AlertTriangle,
    Ban,
    Bell,
    CalendarDays,
    CheckCircle2,
    Flag,
    LucideIcon,
    Megaphone,
    Rocket,
    ShieldCheck,
    XCircle
} from "lucide-react";
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
    [NotificationType.AD_APPROVED]: {
        icon: CheckCircle2,
        iconClass: "text-green-500",
        bgClass: "bg-green-500/15",
    },
    [NotificationType.AD_REJECTED]: {
        icon: XCircle,
        iconClass: "text-red-500",
        bgClass: "bg-red-500/15",
    },
    [NotificationType.AD_COMPLETED]: {
        icon: Flag,
        iconClass: "text-blue-500",
        bgClass: "bg-blue-500/15",
    },
    [NotificationType.PROMOTION_APPROVED]: {
        icon: Megaphone,
        iconClass: "text-green-500",
        bgClass: "bg-green-500/15",
    },
    [NotificationType.PROMOTION_DENIED]: {
        icon: XCircle,
        iconClass: "text-red-500",
        bgClass: "bg-red-500/15",
    },
    [NotificationType.PROMOTION_CANCELED]: {
        icon: Ban,
        iconClass: "text-orange-500",
        bgClass: "bg-orange-500/15",
    },
    [NotificationType.ROOM_PROMOTION_APPROVED]: {
        icon: Rocket,
        iconClass: "text-green-500",
        bgClass: "bg-green-500/15",
    },
    [NotificationType.ROOM_PROMOTION_DENIED]: {
        icon: XCircle,
        iconClass: "text-red-500",
        bgClass: "bg-red-500/15",
    },
    [NotificationType.ROOM_PROMOTION_CANCELED]: {
        icon: Ban,
        iconClass: "text-orange-500",
        bgClass: "bg-orange-500/15",
    },
    [NotificationType.MODERATOR_ACCEPTED]: {
        icon: ShieldCheck,
        iconClass: "text-emerald-500",
        bgClass: "bg-emerald-500/15",
    },
    [NotificationType.COMMUNITY_NIGHT_REMINDER]: {
        icon: CalendarDays,
        iconClass: "text-purple-500",
        bgClass: "bg-purple-500/15",
    },
};

const FALLBACK_VISUAL: NotificationVisual = {
    icon: Bell,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
};

export const getNotificationVisual = (type: NotificationType): NotificationVisual =>
    NOTIFICATION_VISUALS[type] ?? FALLBACK_VISUAL;
