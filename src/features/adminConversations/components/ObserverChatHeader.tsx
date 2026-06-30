"use client";

import React from "react";
import {Button} from "@/components/ui/button";
import {CardTitle} from "@/components/ui/card";
import {ArrowLeft, Ban, Eye, Users} from "lucide-react";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";

interface ObserverChatHeaderProps {
    conversation: AdminConversationDTO;
    onOpenMobileSidebar?: () => void;
}

const ObserverChatHeader: React.FC<ObserverChatHeaderProps> = ({
                                                                   conversation,
                                                                   onOpenMobileSidebar,
                                                               }) => {
    const targetName = conversation.target?.username ?? "Deleted user";
    const counterpartName = conversation.counterpart?.username ?? "Deleted user";

    return (
        <CardTitle className="flex items-center gap-2">
            {onOpenMobileSidebar && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="glass-control h-9 w-9 p-2 lg:hidden"
                    onClick={onOpenMobileSidebar}
                    aria-label="Back to conversations"
                    title="Back to conversations"
                >
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
            )}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4 text-muted-foreground"/>
            </div>
            <span className="truncate">
                @{targetName} <span className="text-muted-foreground">↔</span> @{counterpartName}
            </span>
            {conversation.blocked && (
                <span title="One participant has blocked the other" className="inline-flex items-center text-red-500">
                    <Ban className="h-4 w-4"/>
                </span>
            )}
            <div
                className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Eye className="h-3.5 w-3.5"/>
                <span className="hidden sm:inline">Observer · read-only</span>
            </div>
        </CardTitle>
    );
};

export default ObserverChatHeader;
