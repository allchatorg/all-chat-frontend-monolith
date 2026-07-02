"use client"

import {useEffect} from "react"
import {usePathname, useRouter} from "next/navigation"
import {SidebarInset, SidebarProvider} from "@ads/components/ui/sidebar"
import {AppSidebar} from "@ads/components/app-sidebar"
import {ProtectedRoute} from "@ads/components/route-guards"
import {useUser} from "@ads/hooks/use-user"

const PUBLIC_PATHS = ["/", "/auth", "/login", "/signup"] as const
const SHARED_AUTHENTICATED_PATHS = [] as const
const ADMIN_HOME_ROUTE = "/portal/admin/dashboard"
const USER_HOME_ROUTE = "/portal/dashboard"

function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]) || pathname.startsWith("/reset-password")
}

function matchesPath(pathname: string, basePath: string) {
    return pathname === basePath || pathname.startsWith(`${basePath}/`)
}

function isAdminPath(pathname: string) {
    return matchesPath(pathname, "/portal/admin")
}

function isSharedAuthenticatedPath(pathname: string) {
    return SHARED_AUTHENTICATED_PATHS.some((basePath) => matchesPath(pathname, basePath))
}

export function ConditionalLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const {isAuthenticated, isAdmin} = useUser()
    const isPublicPage = isPublicPath(pathname)
    const shouldRedirectAdmin = isAuthenticated && isAdmin && !isAdminPath(pathname) && !isSharedAuthenticatedPath(pathname)
    const shouldRedirectUser = isAuthenticated && !isAdmin && isAdminPath(pathname)
    const redirectPath = shouldRedirectAdmin
        ? ADMIN_HOME_ROUTE
        : shouldRedirectUser
            ? USER_HOME_ROUTE
            : null

    useEffect(() => {
        if (!isPublicPage && redirectPath) {
            router.replace(redirectPath)
        }
    }, [isPublicPage, redirectPath, router])

    if (isPublicPage) {
        return <>{children}</>
    }

    return (
        <ProtectedRoute>
            {redirectPath ? null : (
                <SidebarProvider
                    style={
                        {
                            backgroundColor: "#E0EEFF",
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset"/>
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            )}
        </ProtectedRoute>
    )
}
