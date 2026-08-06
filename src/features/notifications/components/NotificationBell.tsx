'use client';
import {useState} from "react";
import {Bell} from "lucide-react";
import {AppNotification} from "@/models/AppNotification";
import {useNotifications} from "@/features/notifications/hooks/useNotifications";
import {NotificationList} from "@/features/notifications/components/NotificationList";
import {NotificationDetailsModal} from "@/features/notifications/components/NotificationDetailsModal";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useDialog} from "@/components/providers/DialogProvider";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

/**
 * Chat navbar bell. Desktop: popover with the notification list; mobile: the
 * list opens in the app dialog (same split as SearchRooms/SearchRoomsMobile).
 */
export function NotificationBell() {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const isMobile = useIsMobile();
    const {open: openDialog} = useDialog();
    // Also fetches the unread count once on mount, so the badge is live
    // before the list is ever opened.
    const {unreadCount} = useNotifications();

    const openDetails = (notification: AppNotification) => {
        setPopoverOpen(false);
        // On mobile this replaces the list dialog (the provider renders a
        // single dialog) — reopening the bell brings the list back.
        openDialog(
            <div className="w-[80vw] sm:w-[500px]">
                <NotificationDetailsModal notification={notification}/>
            </div>
        );
    };

    const badge = unreadCount > 0 ? (
        <span
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
        </span>
    ) : null;

    if (isMobile) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="glass-control relative"
                aria-label="Notifications"
                title="Notifications"
                onClick={() =>
                    openDialog(
                        <div className="w-[80vw]">
                            <NotificationList onOpenDetails={openDetails}/>
                        </div>,
                        {
                            className: "glass-popover glass-modal-mobile p-0",
                            // Light scrim: the default bg-black/80 overlay shows
                            // through the translucent glass and greys it out in
                            // light mode (same fix as the edit-history dialog).
                            overlayClassName: "bg-slate-950/30 backdrop-blur-[2px] dark:bg-black/45",
                        }
                    )
                }
            >
                <Bell className="h-6 w-6"/>
                {badge}
            </Button>
        );
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="glass-control relative"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell className="h-6 w-6"/>
                    {badge}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="glass-popover w-96 p-0">
                <NotificationList onOpenDetails={openDetails}/>
            </PopoverContent>
        </Popover>
    );
}
