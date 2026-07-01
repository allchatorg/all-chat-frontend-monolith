"use client";

import {SuperAdminRoute} from "@ads/components/route-guards";

export default function AdminDashboardLayout({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    return (
        <SuperAdminRoute>
            {children}
        </SuperAdminRoute>
    );
}
