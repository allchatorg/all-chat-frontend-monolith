import React from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Flame, MessageCircle, Users} from "lucide-react";
import {usePopularitySidebar} from "@/lib/hooks/usePopularitySidebar";
import {useTopReactedSidebar} from "@/lib/hooks/useTopReactedSidebar";

interface EmptyChatSectionProps {
    className?: string,
    onOpenCreateRoom?: () => void
}

const EmptyChatSection: React.FC<EmptyChatSectionProps> = ({className = "", onOpenCreateRoom}) => {
    const {
        isActive: popularitySidebarActive,
        toggleSidebar: onTogglePopularitySidebar,
    } = usePopularitySidebar();

    const {
        isActive: topReactedSidebarActive,
        toggleSidebar: onToggleTopReactedSidebar,
    } = useTopReactedSidebar();

    return (
        <Card
            className={`glass-panel chat-section-edge w-full h-full mx-auto flex flex-col rounded-b-xl border-t-0 ${className}`}>
            <CardHeader className="rounded-none bg-transparent pb-3 shadow-none">
                <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                    No Chat Selected
                    <div className="flex items-center ml-auto gap-2">
                        <Button
                            onClick={onToggleTopReactedSidebar}
                            variant={topReactedSidebarActive ? "secondary" : "outline"}
                            size="sm"
                            className={`
                              glass-control z-20 relative flex flex-col items-center justify-center
                              w-10 h-10 p-2 text-sm group 
                              ${topReactedSidebarActive ? "text-primary" : ""}
                            `}
                        >
                            <Flame className="h-5 w-5"/>
                            <span
                                className={`
                                mt-4 text-xs font-medium text-foreground opacity-0 
                                group-hover:opacity-100 transition-opacity absolute -bottom-7
                                glass-pill rounded px-2 py-1 whitespace-nowrap
                              `}
                            >
                                {topReactedSidebarActive ? "Hide" : "Show"} Top Reacted
                            </span>
                        </Button>
                        <Button
                            onClick={onTogglePopularitySidebar}
                            variant={popularitySidebarActive ? "secondary" : "outline"}
                            size="sm"
                            className={`
                              glass-control z-20 relative flex flex-col items-center justify-center
                              w-10 h-10 p-2 text-sm group 
                              ${popularitySidebarActive ? "text-primary" : ""}
                            `}
                        >
                            <Users className="h-5 w-5"/>
                            <span
                                className={`
                                mt-4 text-xs font-medium text-foreground opacity-0 
                                group-hover:opacity-100 transition-opacity absolute -bottom-7
                                glass-pill rounded px-2 py-1 whitespace-nowrap
                              `}
                            >
                                {popularitySidebarActive ? "Hide" : "Show"} Active Rooms
                            </span>
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative flex h-full flex-1 flex-col p-0">
                <div
                    className="glass-panel absolute inset-0 z-10 flex items-center justify-center rounded-xl">
                    <div className="p-8 text-center space-y-4">
                        <div
                            className="glass-surface mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                            <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500"/>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                No Chat Room Selected
                            </h3>
                            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                                Please join a chatroom or create a new one to begin chatting
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmptyChatSection;
