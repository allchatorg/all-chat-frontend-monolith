"use client"

import * as React from "react"
import {
    IconBook,
    IconBriefcase,
    IconChartBar,
    IconCreditCard,
    IconDashboard,
    IconListDetails,
    IconMessageCircle,
    IconSettings,
    IconShield,
    IconSpeakerphone,
    IconUsers
} from "@tabler/icons-react"
import {NavMain} from "@ads/components/nav-main"
import {NavSecondary} from "@ads/components/nav-secondary"
import {NavUser} from "@ads/components/nav-user"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader,} from "@ads/components/ui/sidebar"
import {useUser} from "@ads/hooks/use-user"
import {useUser as useChatUser} from "@/lib/hooks/useUser"
import {useRoleAccess} from "@/lib/hooks/useRoleAccess"
import {UserRole} from "@ads/models/user-role"
import {Role} from "@/models/Role"
import {useDispatch} from "react-redux"
import type {AppDispatch} from "@/redux/store"
import {logoutThunk} from "@/redux/auth/authThunk"
import {useRouter} from "next/navigation"
import {useDialog} from "@ads/components/providers/DialogProvider"
import {useDialog as useChatDialog} from "@/components/providers/DialogProvider"
import {SettingsComponent} from "@/features/auth/components/SettingsComponent"
import {useGetMyPromotedMessagesQuery} from "@ads/store/services/promotedMessagesApi"
import TermsOfService from "@ads/components/TermsOfService"
import PrivacyPolicy from "@ads/components/PrivacyPolicy"
import AdvertiserTerms from "@ads/components/AdvertiserPolicy"
import {NavLegal} from "@ads/components/nav-legal"
import {useThemedLogo} from "@/lib/hooks/useThemedLogo"

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
    {
        title: "My Promoted Messages",
        url: "/portal/promoted-messages",
        icon: IconSpeakerphone,
    },
]

const regularUserNavSecondary = [
    {
        title: "Payment Methods",
        url: "/portal/payment-methods",
        icon: IconCreditCard,
    }
]

const adminDashboardNav = {
    title: "Dashboard",
    url: "/portal/admin/dashboard",
    icon: IconDashboard,
}

// Ads + Users are available to all admins; the Dashboard is super-admin-only and
// prepended separately below.
const adminNavMain = [
    {
        title: "Ads",
        url: "/portal/admin/ads",
        icon: IconListDetails,
    },
    {
        title: "Promoted Messages",
        url: "/portal/admin/promoted-messages",
        icon: IconSpeakerphone,
    },
    {
        title: "Users",
        url: "/portal/admin/users",
        icon: IconUsers,
    },
]

const adminNavSecondary: { title: string; url?: string; onClick?: () => void; icon: typeof IconSettings }[] = []

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {user, isSuperAdmin} = useUser()
    const isAdmin = user.role === UserRole.ADMIN

    // Non-staff users who have never created an ad only get "Start a Campaign"
    // and "My Promoted Messages" (promotions are bought from the chat app, so
    // they exist independently of ads). My Campaigns stays hidden until they
    // have at least one ad; the Dashboard also unlocks by owning a promoted
    // message (it shows promotion spend).
    const {user: chatUser} = useChatUser()
    const {isStaffMember} = useRoleAccess()
    const hasAd = (chatUser?.purchasedAdsCount ?? 0) > 0
    const isStaff = isStaffMember()
    // Promotions require a claimed account, so only ordinary no-ad users need the lookup
    const {data: promotionsPage} = useGetMyPromotedMessagesQuery(
        {page: 0, size: 1},
        {skip: isStaff || hasAd || !chatUser || chatUser.role === Role.GUEST || chatUser.role === Role.UNCLAIMED_USER}
    )
    const hasPromotion = (promotionsPage?.totalElements ?? 0) > 0
    const regularNav = regularUserNavMain.filter((item) => {
        if (item.url === "/portal/dashboard") return isStaff || hasAd || hasPromotion
        if (item.url === "/portal/ads") return isStaff || hasAd
        return true
    })

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const {open} = useDialog()
    const {open: openChatDialog} = useChatDialog()
    const logoSrc = useThemedLogo("/allchat_ads_portal_light_logo.png", "/allchat_ads_portal_dark_logo.png")

    // Reuse the chat app's Settings modal (superset of the old portal account page).
    // Opened via the chat DialogProvider so its nested flows (e.g. account deletion,
    // which uses the chat useDialog) target the same dialog instance.
    const openSettings = () =>
        openChatDialog(
            <div className="w-[80vw] md:min-w-[800px] md:max-w-[800px] max-h-[500px]">
                <SettingsComponent/>
            </div>
        )

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk())
        } catch (e) {
            console.error("Logout failed: ", e)
        } finally {
            router.push("/")
        }
    }

    // Super admins additionally see the analytics Dashboard entry.
    const navMain = isAdmin
        ? (isSuperAdmin ? [adminDashboardNav, ...adminNavMain] : adminNavMain)
        : regularNav
    // Throwaway accounts see a lock badge on pages gated by ClaimAccountGate.
    const isUnclaimed = chatUser?.role === Role.UNCLAIMED_USER
    const navSecondary = isAdmin
        ? adminNavSecondary
        : regularUserNavSecondary.map((item) => ({...item, locked: isUnclaimed}))

    // Bottom action group shared by all roles: open the chat Settings modal and
    // jump back to the chat app.
    const bottomActions = [
        {
            title: "Settings",
            icon: IconSettings,
            onClick: openSettings,
        },
        {
            title: "Back to Chat",
            icon: IconMessageCircle,
            onClick: () => router.push("/"),
        },
    ]

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
                        src={logoSrc}
                        alt="AllChat Logo"
                        className="w-44 h-auto mb-4"
                    />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain}/>
                <NavLegal items={legalItems}/>
                <NavSecondary items={navSecondary} className="mt-auto"/>
                <NavSecondary items={bottomActions}/>
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
