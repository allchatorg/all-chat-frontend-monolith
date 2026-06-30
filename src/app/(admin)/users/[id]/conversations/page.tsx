'use client';

import React from "react";
import {useParams} from "next/navigation";
import AdminConversationsView from "@/features/adminConversations/components/AdminConversationsView";

export default function Page() {
    const params = useParams();
    const userId = Number(params.id) || 0;

    if (!userId) {
        return <div className="p-6 text-muted-foreground">Invalid user.</div>;
    }

    return (
        <div className="h-full min-h-0">
            <AdminConversationsView userId={userId}/>
        </div>
    );
}
