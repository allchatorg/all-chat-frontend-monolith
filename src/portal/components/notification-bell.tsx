"use client"

import {IconBell} from "@tabler/icons-react"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@ads/components/ui/sidebar"
import {useDialog} from "@ads/components/providers/DialogProvider"
import {useNotifications} from "@/features/notifications/hooks/useNotifications"
import {NotificationList} from "@/features/notifications/components/NotificationList"
import {NotificationDetailsModal} from "@/features/notifications/components/NotificationDetailsModal"
import {AppNotification} from "@/models/AppNotification"

/**
 * Portal sidebar bell: same shared notification list/details as the chat bell,
 * but opened through the portal DialogProvider and rendered as a sidebar row
 * (works in expanded and collapsed sidebar states).
 */
export function NotificationBell() {
    const {open, close} = useDialog()
    // Also fetches the unread count once on mount, keeping the badge live.
    const {unreadCount} = useNotifications()

    const openDetails = (notification: AppNotification) => {
        // Replaces the list dialog (single-dialog provider) — reopening the
        // bell brings the list back.
        open(
            <div className="w-[80vw] sm:w-[500px]">
                <NotificationDetailsModal notification={notification}/>
            </div>
        )
    }

    const openList = () => {
        open(
            <div className="w-[80vw] sm:w-[420px]">
                <NotificationList onOpenDetails={openDetails} onNavigate={close}/>
            </div>,
            // overflow-hidden clips the square row-hover background to the
            // dialog's rounded corners.
            {className: "p-0 overflow-hidden"}
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={openList} tooltip="Notifications">
                    <IconBell/>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span
                            className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
