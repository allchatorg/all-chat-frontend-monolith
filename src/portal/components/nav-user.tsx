"use client"

import {IconLogout} from "@tabler/icons-react"
import {Avatar, AvatarFallback, AvatarImage,} from "@ads/components/ui/avatar"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@ads/components/ui/sidebar"
import {UserName} from "@/components/UserName";
import type {FontSnapshot} from "@/lib/fontPresets";

export function NavUser({
                            user,
                            onLogout,
                        }: {
    user: Partial<FontSnapshot> & {
        id?: number
        name: string
        vipBadgeVisible?: boolean
        vipBadgeRevision?: number
        email: string
        avatar: string
    }
    onLogout?: () => void
}) {
    // Extract initials from user name
    const getInitials = (name: string) => {
        const nameParts = name.trim().split(' ')
        if (nameParts.length === 1) {
            return nameParts[0].substring(0, 2).toUpperCase()
        }
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    }

    const initials = getInitials(user.name)

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="flex items-center gap-2"
                >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarImage src={user.avatar} alt={user.name}/>
                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <UserName userId={user.id} username={user.name} vipBadgeVisible={user.vipBadgeVisible} vipBadgeRevision={user.vipBadgeRevision} usernameFont={user.usernameFont} messageFont={user.messageFont} fontRevision={user.fontRevision} className="font-medium"/>
                        <span className="text-muted-foreground truncate text-xs">
                            {user.email}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <IconLogout
                            className="cursor-pointer w-4 h-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLogout?.();
                            }}
                        />
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
