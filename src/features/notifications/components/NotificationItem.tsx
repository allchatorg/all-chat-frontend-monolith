'use client';
import {MoreHorizontal, Trash2} from "lucide-react";
import {AppNotification} from "@/models/AppNotification";
import {getNotificationVisual} from "@/features/notifications/components/notificationVisuals";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";

interface NotificationItemProps {
    notification: AppNotification;
    onClick: (notification: AppNotification) => void;
    onToggleRead: (notification: AppNotification) => void;
    onDelete: (notification: AppNotification) => void;
}

export function NotificationItem({notification, onClick, onToggleRead, onDelete}: NotificationItemProps) {
    const {formatMessageDate} = useFormatMessageDate();
    const visual = getNotificationVisual(notification.type);
    const Icon = visual.icon;
    const unread = notification.readAt === null;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(notification)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(notification);
                }
            }}
            className={cn(
                "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
                "hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-hidden",
                unread && "bg-primary/5"
            )}
        >
            <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", visual.bgClass)}>
                <Icon className={cn("h-4.5 w-4.5", visual.iconClass)}/>
            </span>

            <div className="min-w-0 flex-1">
                <p className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
                    {notification.title}
                </p>
                {!!notification.body?.trim() && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground break-words">
                        {notification.body}
                    </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatMessageDate(notification.createdAt)}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                            aria-label="Notification actions"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-popover" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onSelect={() => onToggleRead(notification)}>
                            {unread ? "Mark as read" : "Mark as unread"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => onDelete(notification)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* Always rendered so marking read doesn't shift the row */}
                <span
                    className={cn("mt-2 h-2.5 w-2.5 rounded-full", unread ? "bg-blue-500" : "bg-transparent")}
                    aria-label={unread ? "Unread" : undefined}
                />
            </div>
        </div>
    );
}
