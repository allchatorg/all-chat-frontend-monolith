"use client";

import React from "react";
import {MessageCircle, PanelLeftOpen} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

interface PrivateChatEmptyStateProps {
    onOpenSidebar?: () => void;
}

const PrivateChatEmptyState: React.FC<PrivateChatEmptyStateProps> = ({onOpenSidebar}) => {
    return (
        <Card
            className="glass-panel chat-section-edge flex h-full w-full flex-col items-center justify-center rounded-xl border-t! p-8 text-center text-muted-foreground">
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
        </Card>
    );
};

export default PrivateChatEmptyState;
