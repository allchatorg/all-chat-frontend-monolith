import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {MessageSkeletons} from "@/features/chatroom/components/MessageSkeletons";

const ChatSectionSkeleton = () => {
    return (
        <Card className="glass-panel chat-section-edge flex h-full w-full flex-col rounded-tl-none border-t-0">
            {/* Header Skeleton */}
            <CardHeader className="rounded-none bg-transparent p-2 px-5 shadow-none">
                <CardTitle className="flex items-center gap-2">
                    <div className="glass-surface h-3 w-3 animate-pulse rounded-full"></div>
                    <div className="glass-surface h-5 w-32 rounded animate-pulse"></div>
                    <div className="ml-auto flex items-center gap-2">
                        {/* Search bar skeleton */}
                        <div className="glass-surface h-9 w-40 rounded animate-pulse"></div>
                        {/* Message count skeleton */}
                        <div className="glass-surface h-4 w-24 rounded animate-pulse"></div>
                        {/* Active rooms button skeleton */}
                        <div className="glass-surface h-10 w-10 rounded animate-pulse"></div>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea type="scroll" scrollHideDelay={600} className="flex-1">
                    <MessageSkeletons count={8} className="pb-4"/>
                </ScrollArea>

                {/* Chat input skeleton */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-end gap-2">
                        {/* Attachment button skeleton */}
                        <div className="glass-surface h-10 w-10 rounded animate-pulse shrink-0"></div>

                        {/* Input field skeleton */}
                        <div className="glass-surface flex-1 h-10 rounded animate-pulse"></div>

                        {/* Send button skeleton */}
                        <div className="glass-surface h-10 w-10 rounded animate-pulse shrink-0"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatSectionSkeleton;
