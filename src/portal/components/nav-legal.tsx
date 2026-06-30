"use client"

import * as React from "react"
import {type Icon} from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@ads/components/ui/sidebar"

export function NavLegal({
                             items,
                             ...props
                         }: {
    items: {
        title: string
        onClick: () => void
        icon: Icon
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Legal</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <button onClick={item.onClick}
                                        className="w-full flex items-center gap-2 justify-start cursor-pointer text-left">
                                    <item.icon className="h-4 w-4"/>
                                    <span>{item.title}</span>
                                </button>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
