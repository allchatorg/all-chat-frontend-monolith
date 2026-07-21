"use client";
import {Card} from "@ads/components/ui/card";
import {Megaphone, ShoppingBag, UserCircle} from "lucide-react";
import {useParams, usePathname} from "next/navigation";
import React, {ReactNode} from "react";
import {NavigationTabs} from "@ads/components/NavigationTabs";
import {TabConfig} from "@ads/models/TabConfig";
import {SiteHeader} from "@ads/components/site-header";
import {useGetUserByIdQuery} from "@ads/store/services/adminUsersApi";

export default function UserLayout({children}: { children: ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const userId = Number(params.id);
    const basePath = `/portal/admin/users/${params.id}`;

    const {data: user, isLoading} = useGetUserByIdQuery(userId, {
        skip: isNaN(userId),
    });

    const tabs: TabConfig[] = [
        {
            value: "details",
            label: "Details",
            href: `${basePath}/details`,
            icon: UserCircle
        },
        {
            value: "ads",
            label: "Ads",
            href: `${basePath}/ads`,
            icon: ShoppingBag
        },
        {
            value: "promoted-messages",
            label: "Promoted Messages",
            href: `${basePath}/promoted-messages`,
            icon: Megaphone
        },
    ];

    const currentTab = tabs.find(tab => pathname === tab.href) || tabs[0];
    const activeTabValue = pathname.split('/').pop() || 'details';

    if (isLoading) {
        return <div className="p-6">Loading user data...</div>;
    }

    if (!user) {
        return <div className="p-6">User not found</div>;
    }

    return (
        <div className="flex h-full w-full flex-col">
            <SiteHeader
                title={`User ${currentTab.label}`}
                description={`Viewing ${currentTab.label.toLowerCase()} for ${user.email}`}
            />
            <div className="flex h-full w-full flex-col p-4 space-y-4">
                <Card className="flex min-h-0 flex-1 flex-col p-0 overflow-hidden">
                    <NavigationTabs tabs={tabs} activeValue={activeTabValue}>
                        {children}
                    </NavigationTabs>
                </Card>
            </div>
        </div>
    );
}
