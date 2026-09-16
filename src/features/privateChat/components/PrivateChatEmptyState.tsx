"use client";

import React from "react";
import {MessageCircle, PanelLeftOpen} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {RadioOptionsMenu} from "@/features/radio/components/RadioMenu";

interface PrivateChatEmptyStateProps {
    onOpenSidebar?: () => void;
}

const PrivateChatEmptyState: React.FC<PrivateChatEmptyStateProps> = ({onOpenSidebar}) => {
    return (
        <Card
            className="glass-panel chat-section-edge flex h-full w-full flex-col rounded-xl border-t!">
            <CardHeader className="relative z-30 rounded-none bg-transparent p-2 px-5 shadow-none">
                <CardTitle className="flex min-h-9 min-w-0 items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true"/>
                    <span className="min-w-0 flex-1 truncate">Private messages</span>
                    <RadioOptionsMenu buttonClassName="glass-control ml-auto h-9 w-9 shrink-0 p-0" iconClassName="h-5 w-5"/>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageCircle className="mb-3 h-10 w-10 opacity-40"/>
                <p className="text-base font-medium text-foreground">Start a private chat</p>
                <p className="mt-1 text-sm">Use the search box in the top bar to find a user.</p>
                {onOpenSidebar && (
                    <Button
                        variant="outline"
                        className="glass-control mt-5"
                        onClick={onOpenSidebar}
                    >
                        <PanelLeftOpen className="mr-2 h-4 w-4"/>
                        View conversations
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default PrivateChatEmptyState;
