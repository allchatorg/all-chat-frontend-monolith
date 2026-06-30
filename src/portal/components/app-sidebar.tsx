"use client"

import * as React from "react"
import {
    IconBook,
    IconBriefcase,
    IconChartBar,
    IconCreditCard,
    IconDashboard,
    IconListDetails,
    IconShield,
    IconUser,
    IconUsers
} from "@tabler/icons-react"
import {NavMain} from "@ads/components/nav-main"
import {NavSecondary} from "@ads/components/nav-secondary"
import {NavUser} from "@ads/components/nav-user"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader,} from "@ads/components/ui/sidebar"
import {useUser} from "@ads/hooks/use-user"
import {UserRole} from "@ads/models/user-role"
import {useDispatch} from "react-redux"
import type {AppDispatch} from "@/redux/store"
import {logoutThunk} from "@/redux/auth/authThunk"
import {useRouter} from "next/navigation"
import {useDialog} from "@ads/components/providers/DialogProvider"
import TermsOfService from "@ads/components/TermsOfService"
import PrivacyPolicy from "@ads/components/PrivacyPolicy"
import AdvertiserTerms from "@ads/components/AdvertiserPolicy"
import {NavLegal} from "@ads/components/nav-legal"

const regularUserNavMain = [
    {
        title: "Dashboard",
        url: "/portal/dashboard",
        icon: IconDashboard,
    },
    {
        title: "My Campaigns",
        url: "/portal/ads",
        icon: IconListDetails,
    },
    {
        title: "Start a Campaign",
        url: "/portal/campaign",
        icon: IconChartBar,
    },
]

const regularUserNavSecondary = [
    {
        title: "Payment Methods",
        url: "/portal/payment-methods",
        icon: IconCreditCard,
    },
    {
        title: "My Account",
        url: "/portal/account",
        icon: IconUser,
    }
]

const adminNavMain = [
    {
        title: "Dashboard",
        url: "/portal/admin/dashboard",
        icon: IconDashboard,
    },
    {
        title: "Ads",
        url: "/portal/admin/ads",
        icon: IconListDetails,
    },
    {
        title: "Users",
        url: "/portal/admin/users",
        icon: IconUsers,
    },
]

const adminNavSecondary = [
    {
        title: "My Account",
        url: "/portal/account",
        icon: IconUser,
    }
]

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {user} = useUser()
    const isAdmin = user.role === UserRole.ADMIN

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const {open} = useDialog()

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk())
        } catch (e) {
            console.error("Logout failed: ", e)
        } finally {
            router.push("/")
        }
    }

    const navMain = isAdmin ? adminNavMain : regularUserNavMain
    const navSecondary = isAdmin ? adminNavSecondary : regularUserNavSecondary

    const legalItems = [
        {
            title: "Terms of Service",
            icon: IconBook,
            onClick: () => open(<div className="max-w-4xl"><TermsOfService/></div>)
        },
        {
            title: "Privacy Policy",
            icon: IconShield,
            onClick: () => open(<div className="max-w-4xl"><PrivacyPolicy/></div>)
        },
        {
            title: "Advertiser Terms",
            icon: IconBriefcase,
            onClick: () => open(<div className="max-w-4xl"><AdvertiserTerms/></div>)
        }
    ]

    return (
        <Sidebar className={'rounded-xl'} collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <div
                    className="cursor-pointer flex flex-col items-center justify-center p-2 border-b"
                    onClick={() => router.push("/")}
                    title="Back to chat"
                >
                    <img
                        src="/allchat-logo.png"
                        alt="AllChat Logo"
                        className="w-32 h-auto mb-4"
                    />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain}/>
                <NavLegal items={legalItems}/>
                <NavSecondary items={navSecondary} className="mt-auto"/>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={{
                    name: user.name,
                    email: user.email,
                    avatar: "/avatars/shadcn.jpg",
                }} onLogout={handleLogout}/>
            </SidebarFooter>
        </Sidebar>
    )
}
