'use client';
import {AppNotification} from "@/models/AppNotification";
import {NotificationType} from "@/models/NotificationType";
import {getNotificationVisual} from "@/features/notifications/components/notificationVisuals";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {cn} from "@/lib/utils";

interface NotificationDetailsModalProps {
    notification: AppNotification;
}

/**
 * Generic details modal: switches on notification type. New types add a case
 * (or rely on the generic fallback). Renders plain content, so it works inside
 * both the chat and portal DialogProviders.
 */
export function NotificationDetailsModal({notification}: NotificationDetailsModalProps) {
    switch (notification.type) {
        case NotificationType.WARNING:
            return <WarningDetails notification={notification}/>;
        default:
            return <GenericDetails notification={notification}/>;
    }
}

function DetailsHeader({notification, accentClass}: { notification: AppNotification; accentClass?: string }) {
    const {formatMessageDate} = useFormatMessageDate();
    const visual = getNotificationVisual(notification.type);
    const Icon = visual.icon;

    return (
        <div className="flex items-start gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", visual.bgClass)}>
                <Icon className={cn("h-5 w-5", visual.iconClass)}/>
            </span>
            <div className="min-w-0">
                <h2 className={cn("text-lg font-semibold", accentClass)}>{notification.title}</h2>
                <p className="text-xs text-muted-foreground">{formatMessageDate(notification.createdAt)}</p>
            </div>
        </div>
    );
}

function WarningDetails({notification}: { notification: AppNotification }) {
    const reason = notification.body?.trim();

    return (
        <div className="flex w-full flex-col gap-4">
            <DetailsHeader notification={notification} accentClass="text-orange-500"/>
            <div className="rounded-md border border-orange-500/30 bg-orange-500/10 p-4">
                {reason ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{reason}</p>
                ) : (
                    <p className="text-sm italic text-muted-foreground">No reason was provided for this warning.</p>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Repeated violations may lead to a ban. Please review the community rules.
            </p>
        </div>
    );
}

function GenericDetails({notification}: { notification: AppNotification }) {
    const body = notification.body?.trim();

    return (
        <div className="flex w-full flex-col gap-4">
            <DetailsHeader notification={notification}/>
            {body && (
                <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
            )}
        </div>
    );
}
