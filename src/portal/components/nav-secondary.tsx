"use client"

import * as React from "react"
import {type Icon} from "@tabler/icons-react"
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
        url: string
        icon: Icon
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathname = usePathname()

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}
                                             className={isActive ? "bg-sidebar-accent rounded-md" : ""}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} className={isActive ? "font-bold text-primary" : ""}>
                                        <item.icon/>
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
