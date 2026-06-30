'use client';
import {Card} from "@/components/ui/card";
import {MessageSquare, MessagesSquare, Shield, User} from "lucide-react";
import {useParams, usePathname, useRouter} from "next/navigation";
import React, {ReactNode, useEffect} from "react";
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {AdminBreadcrumb} from "@/components/AdminBreadcrumb";
import {useSelector} from "react-redux";
import {useThunk} from "@/lib/hooks/useThunk";
import {getUserAdminViewDetailsThunk} from "@/redux/admin/adminThunk";
import {selectUserAdminView} from "@/redux/admin/adminSelector";
import {NavigationTabs} from "@/components/NavigationTabs";
import {TabConfig} from "@/models/TabConfig";
import {ROUTES} from "@/routes";

export default function MemberLayout({children}: { children: ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const basePath = `/users/${params.id}`;

    const user = useSelector(selectUserAdminView);
    const [getUserDetails, userDetailsLoading, userDetailsError] = useThunk(getUserAdminViewDetailsThunk);

    useEffect(() => {
        const userId = Number(params.id) || 0;
        if (userId) {
            getUserDetails(userId);
        }
    }, [params.id, getUserDetails]);

    useEffect(() => {
        if (userDetailsError?.status === 403) {
            router.push('/unauthorized');
        }
    }, [userDetailsError, router]);

    const tabs: TabConfig[] = [
        {
            value: "details",
            label: "Details",
            href: `${basePath}/details`,
            icon: User
        },
        {
            value: "messages",
            label: "Messages",
            href: `${basePath}/messages`,
            icon: MessageSquare
        },
        {
            value: "conversations",
            label: "Conversations",
            href: `${basePath}/conversations`,
            icon: MessagesSquare
        },
        {
            value: "audit-logs",
            label: "Audit Logs",
            href: `${basePath}/audit-logs`,
            icon: Shield
        },
    ];

    const currentTab = tabs.find(tab => pathname === tab.href) || tabs[0];
    const activeTabValue = pathname.split('/').pop() || 'details';

    if (!user) {
        return <div className="p-6">Loading user data...</div>;
    }

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <div className="mx-auto w-full space-y-4">
                <AdminBreadcrumb
                    items={[
                        {label: "Users", href: ROUTES.USERS},
                        {label: user.username, href: `${basePath}/details`},
                        {label: currentTab.label}
                    ]}
                />
                <AdminPageHeader
                    title={`User ${currentTab.label}`}
                    description={`${currentTab.label} for user`}
                    icon={currentTab.icon || User}
                    user={user}
                />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col p-0">
                <NavigationTabs tabs={tabs} activeValue={activeTabValue}>
                    <div className="h-full w-full p-2 sm:p-4">
                        {children}
                    </div>
                </NavigationTabs>
            </Card>
        </div>
    );
}
