"use client"

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

export function NavMain({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
}) {
    const pathname = usePathname()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname.startsWith(item.url)
                        return (
                            <SidebarMenuItem key={item.title}
                                             className={isActive ? "bg-sidebar-accent rounded-md" : ""}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={isActive ? "font-bold text-primary" : ""}
                                    asChild
                                >
                                    <Link href={item.url} className="flex items-center gap-2">
                                        {item.icon && <item.icon/>}
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
