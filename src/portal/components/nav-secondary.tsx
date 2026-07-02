"use client"

import * as React from "react"
import {IconLock, type Icon} from "@tabler/icons-react"
import {usePathname} from "next/navigation"
import Link from "next/link"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@ads/components/ui/sidebar"

export function NavSecondary({
                                 items,
                                 ...props
                             }: {
    items: {
        title: string
        url?: string
        onClick?: () => void
        icon: Icon
        // Renders a trailing lock badge — the page behind the link needs a
        // claimed account (it shows the ClaimAccountGate).
        locked?: boolean
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathname = usePathname()

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = !!item.url && pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}
                                             className={isActive ? "bg-sidebar-accent rounded-md" : ""}>
                                <SidebarMenuButton asChild>
                                    {item.url ? (
                                        <Link href={item.url} className={isActive ? "font-bold text-primary" : ""}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                            {item.locked && (
                                                <IconLock className="ml-auto h-4 w-4 text-muted-foreground"/>
                                            )}
                                        </Link>
                                    ) : (
                                        <button onClick={item.onClick}
                                                className="w-full flex items-center gap-2 justify-start cursor-pointer text-left">
                                            <item.icon className="h-4 w-4"/>
                                            <span>{item.title}</span>
                                        </button>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
