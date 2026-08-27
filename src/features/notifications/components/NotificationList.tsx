'use client';
import {useEffect} from "react";
import {BellOff, Loader2} from "lucide-react";
import {AppNotification} from "@/models/AppNotification";
import {useNotifications} from "@/features/notifications/hooks/useNotifications";
import {NotificationItem} from "@/features/notifications/components/NotificationItem";
import {Button} from "@/components/ui/button";

interface NotificationListProps {
    /** Opens the details modal — injected because chat and portal use different DialogProviders. */
    onOpenDetails: (notification: AppNotification) => void;
    /** Closes the hosting popover/dialog before a deep-link navigation. */
    onNavigate?: () => void;
}

export function NotificationList({onOpenDetails, onNavigate}: NotificationListProps) {
    const {
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
    } = useNotifications(onOpenDetails, onNavigate);

    // The list mounts when the popover/dialog opens — refresh page 0 each time.
    useEffect(() => {
        refresh();
    }, [refresh]);

    const initialLoading = loading && notifications.length === 0;

    return (
        <div className="flex w-full flex-col">
            {/* Fixed header height so the mark-all button appearing never resizes it */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
                <h2 className="text-base font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkAllRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* min-h only while loading/empty so a short list doesn't leave dead space below it */}
            <div className={`max-h-[60vh] overflow-y-auto ${initialLoading || notifications.length === 0 ? "min-h-[140px]" : ""}`}>
                {initialLoading ? (
                    <NotificationSkeletons/>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-10 text-muted-foreground">
                        <BellOff className="h-8 w-8"/>
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={onItemClick}
                                onToggleRead={onToggleRead}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Single footer whose height never changes: while fetching,
                    the spinner renders inside the button instead of replacing it */}
                {hasMore && (
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin"/>
                                : "Load more"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

/** Placeholder rows matching NotificationItem's layout, shown on first load. */
function NotificationSkeletons() {
    return (
        <div className="divide-y divide-border/60">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted"/>
                    <div className="min-w-0 flex-1 space-y-2 py-0.5">
                        <div className="h-3.5 w-2/5 animate-pulse rounded bg-muted"/>
                        <div className="h-3 w-4/5 animate-pulse rounded bg-muted"/>
                        <div className="h-2.5 w-1/5 animate-pulse rounded bg-muted"/>
                    </div>
                </div>
            ))}
        </div>
    );
}
