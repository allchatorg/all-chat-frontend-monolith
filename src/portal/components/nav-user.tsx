"use client"

import {useEffect, useState} from "react"
import {useTheme} from "next-themes"
import {IconLogout, IconMoon, IconSun} from "@tabler/icons-react"
import {Avatar, AvatarFallback, AvatarImage,} from "@ads/components/ui/avatar"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@ads/components/ui/sidebar"

export function NavUser({
                            user,
                            onLogout,
                        }: {
    user: {
        name: string
        email: string
        avatar: string
    }
    onLogout?: () => void
}) {
    const {resolvedTheme, setTheme} = useTheme()
    // Avoid a hydration mismatch: the resolved theme is only known on the client.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const isDark = resolvedTheme === "dark"

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
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="text-muted-foreground truncate text-xs">
                            {user.email}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {mounted && (
                            <button
                                type="button"
                                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTheme(isDark ? "light" : "dark");
                                }}
                            >
                                {isDark ? <IconSun className="w-4 h-4"/> : <IconMoon className="w-4 h-4"/>}
                            </button>
                        )}
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
