"use client";

import React from "react";
import {Ban, FileText, Flag, Megaphone, MessageCircle, MessageSquare, UsersIcon} from "lucide-react";
import Image from "next/image";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/routes";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export const Sidebar: React.FC<SidebarProps> = ({className = "", onClose}) => {
    const {isStaffMember, isAdmin} = useRoleAccess();
    const router = useRouter();
    const pathname = usePathname();
    const logoSrc = useThemedLogo();

    const onItemClick = (href: string) => {
        router.push(href);
        if (onClose) {
            onClose();
        }
    };

    const navItems: NavItem[] = [
        {
            icon: <MessageSquare className="h-5 w-5"/>,
            label: "Chat",
            href: ROUTES.HOME,
        },
        {
            icon: <MessageCircle className="h-5 w-5"/>,
            label: "Private chat",
            href: ROUTES.PRIVATE_CHAT,
        },
        {
            icon: <Ban className="h-5 w-5"/>,
            label: "Ban List",
            href: ROUTES.BANS,
        },
        {
            icon: <UsersIcon className="h-5 w-5"/>,
            label: "Users",
            href: ROUTES.USERS,
        },
        {
            icon: <Flag className="h-5 w-5"/>,
            label: "Reports",
            href: ROUTES.REPORTS,
        },
        {
            icon: <FileText className="h-5 w-5"/>,
            label: "Audit Logs",
            href: ROUTES.AUDIT_LOGS,
        },
        ...(isAdmin()
            ? [{
                icon: <Megaphone className="h-5 w-5"/>,
                label: "Ads Portal",
                href: "/portal",
            }]
            : []),
    ];

    const isActiveRoute = (href: string) => {
        if (href === ROUTES.HOME) {
            return pathname === ROUTES.HOME;
        }
        return pathname.startsWith(href);
    };

    const renderContent = () => (
        <>
            <div className="flex items-center border-b border-border p-3 -mt-px">
                <Image
                    src={logoSrc}
                    alt="AllChat"
                    width={120}
                    height={36}
                    priority
                    className="h-9 w-auto cursor-pointer"
                    onClick={() => onItemClick(ROUTES.HOME)}
                />
            </div>

            <nav className="mt-6">
                <ul className="px-3 space-y-2">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <button
                                onClick={() => onItemClick(item.href)}
                                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 justify-start ${isActiveRoute(item.href)
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );

    if (!isStaffMember()) return null;

    return (
        <div className={`h-full ${className}`}>
            {renderContent()}
        </div>
    );
};
