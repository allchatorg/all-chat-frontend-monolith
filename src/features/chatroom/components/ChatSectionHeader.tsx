"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {CardTitle} from "@/components/ui/card";
import {Archive, ArchiveRestore, Flame, Loader2, MessageSquare, MoreVertical, Search, Users, X} from "lucide-react";
import ChatSearchBar from "@/features/chatroom/components/ChatSearchBar";
import {useTopReactedSidebar} from "@/lib/hooks/useTopReactedSidebar";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {useDialog} from "@/components/providers/DialogProvider";
import {ConfirmModal} from "@/components/ConfirmModal";
import {useThunk} from "@/lib/hooks/useThunk";
import {archiveChatRoomThunk, unarchiveChatRoomThunk} from "@/redux/chatRoom/chatRoomThunk";
import {toast} from "sonner";

interface ChatSectionHeaderProps {
    chatRoomId?: number;
    chatRoomName: string;
    isArchived?: boolean;
    totalMessages: number;
    noiseLevel: ChatRoomNoiseLevelEnum;
    popularitySidebarActive: boolean;
    onTogglePopularitySidebar: () => void;
}

const getNoiseIndicator = (level: ChatRoomNoiseLevelEnum) => {
    switch (level) {
        case ChatRoomNoiseLevelEnum.QUIET:
            return {letter: "Q", color: "bg-red-500", title: "Quiet (low activity)"};
        case ChatRoomNoiseLevelEnum.CONVERSATIONAL:
            return {letter: "C", color: "bg-green-600", title: "Conversational (healthy activity)"};
        case ChatRoomNoiseLevelEnum.NOISY:
            return {letter: "N", color: "bg-red-600", title: "Noisy (high activity)"};
        default:
            return {letter: "?", color: "bg-gray-500", title: "Unknown activity level"};
    }
};

const ARCHIVE_HIDDEN_ROOM_NAMES = new Set(["super admins", "admins", "moderators"]);

const ChatSectionHeader: React.FC<ChatSectionHeaderProps> = ({
                                                                 chatRoomId,
                                                                 chatRoomName,
                                                                 isArchived = false,
                                                                 totalMessages,
                                                                 noiseLevel,
                                                                 popularitySidebarActive,
                                                                 onTogglePopularitySidebar,
                                                             }) => {
    const isMobile = useIsMobile();
    const [isExpanded, setIsExpanded] = useState(false);
    const noiseIndicator = getNoiseIndicator(noiseLevel);
    const {isAdmin} = useRoleAccess();
    const {open, close} = useDialog();
    const [archiveChatRoom, archiveChatRoomLoading] = useThunk(archiveChatRoomThunk);
    const [unarchiveChatRoom, unarchiveChatRoomLoading] = useThunk(unarchiveChatRoomThunk);

    const {
        isActive: topReactedSidebarActive,
        toggleSidebar: onToggleTopReactedSidebar,
    } = useTopReactedSidebar();

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const actionLoading = archiveChatRoomLoading || unarchiveChatRoomLoading;
    const normalizedChatRoomName = chatRoomName.trim().toLowerCase();
    const canManageArchive = isAdmin()
        && typeof chatRoomId === "number"
        && !ARCHIVE_HIDDEN_ROOM_NAMES.has(normalizedChatRoomName);
    const topReactedButtonLabel = `${topReactedSidebarActive ? "Hide" : "Show"} Top Reacted`;
    const popularityButtonLabel = `${popularitySidebarActive ? "Hide" : "Show"} Active Rooms`;

    const handleArchiveConfirm = () => {
        if (!chatRoomId || actionLoading) {
            return;
        }

        open(
            <div className="w-full">
                <ConfirmModal
                    onClose={close}
                    onConfirm={async () => {
                        try {
                            await archiveChatRoom(chatRoomId);
                            close();
                            toast.success(`Archived ${chatRoomName}.`);
                        } catch (error: any) {
                            toast.error(error?.message || "Failed to archive chat room.");
                        }
                    }}
                    title={`Archive "${chatRoomName}"?`}
                    description="Archiving this room will disconnect all users from the chatroom, and it will no longer be available to regular users until it is unarchived."
                />
            </div>
        );
    };

    const openArchiveConfirmAfterMenuClose = () => {
        window.setTimeout(() => {
            handleArchiveConfirm();
        }, 100);
    };

    const handleArchiveToggle = async () => {
        if (!chatRoomId || actionLoading) {
            return;
        }

        if (!isArchived) {
            openArchiveConfirmAfterMenuClose();
            return;
        }

        try {
            await unarchiveChatRoom(chatRoomId);
            toast.success(`Unarchived ${chatRoomName}.`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to unarchive chat room.");
        }
    };

    const renderArchiveMenuButton = (
        buttonClassName: string,
        iconClassName: string,
        variant: "ghost" | "outline" | "secondary"
    ) => {
        if (!canManageArchive) {
            return null;
        }

        return (
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={variant}
                        size="sm"
                        className={buttonClassName}
                        aria-label={isArchived ? "Unarchive room options" : "Archive room options"}
                        title={isArchived ? "Unarchive room options" : "Archive room options"}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <Loader2 className={`${iconClassName} animate-spin`}/> :
                            <MoreVertical className={iconClassName}/>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-popover w-48">
                    <DropdownMenuItem className="justify-between focus:bg-white/30 dark:focus:bg-white/10"
                                      onSelect={handleArchiveToggle}>
                        {isArchived ? "Unarchive room" : "Archive room"}
                        {isArchived
                            ? <ArchiveRestore className="h-4 w-4 shrink-0"/>
                            : <Archive className="h-4 w-4 shrink-0"/>}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // Desktop layout
    if (!isMobile) {
        return (
            <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${noiseIndicator.color}`} title={noiseIndicator.title}></div>
                {chatRoomName}
                <div className="flex items-center gap-1.5 ml-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-normal text-muted-foreground">
                        {totalMessages}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <ChatSearchBar/>
                    <Button
                        onClick={onToggleTopReactedSidebar}
                        variant={topReactedSidebarActive ? "secondary" : "outline"}
                        size="sm"
                        className={`glass-control z-10 h-10 w-10 p-2 ${topReactedSidebarActive ? "text-primary" : ""}`}
                        aria-label={topReactedButtonLabel}
                        title={topReactedButtonLabel}
                    >
                        <Flame className="h-5 w-5"/>
                    </Button>
                    <Button
                        onClick={onTogglePopularitySidebar}
                        variant={popularitySidebarActive ? "secondary" : "outline"}
                        size="sm"
                        className={`glass-control z-10 h-10 w-10 p-2 ${popularitySidebarActive ? "text-primary" : ""}`}
                        aria-label={popularityButtonLabel}
                        title={popularityButtonLabel}
                    >
                        <Users className="h-5 w-5"/>
                    </Button>
                    {renderArchiveMenuButton("glass-control h-10 w-10 p-0", "h-5 w-5", "outline")}
                </div>
            </CardTitle>
        );
    }

    // Mobile layout
    return (
        <CardTitle className="flex items-center gap-2">
            {!isExpanded ? (
                <>
                    {/* Default view - chatroom name with message count, then buttons on right */}
                    <div className={`w-3 h-3 rounded-full ${noiseIndicator.color}`} title={noiseIndicator.title}></div>
                    <span className="truncate">{chatRoomName}</span>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground"/>
                        <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                            {totalMessages}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            onClick={onToggleTopReactedSidebar}
                            variant={topReactedSidebarActive ? "secondary" : "ghost"}
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label={topReactedButtonLabel}
                            title={topReactedButtonLabel}
                        >
                            <Flame className="h-4 w-4"/>
                        </Button>
                        <Button
                            onClick={onTogglePopularitySidebar}
                            variant={popularitySidebarActive ? "secondary" : "ghost"}
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label={popularityButtonLabel}
                            title={popularityButtonLabel}
                        >
                            <Users className="h-4 w-4"/>
                        </Button>
                        <Button
                            onClick={toggleExpanded}
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label="Open search"
                            title="Open search"
                        >
                            <Search className="h-4 w-4"/>
                        </Button>
                        {renderArchiveMenuButton("glass-control h-8 w-8 p-0", "h-4 w-4", "ghost")}
                    </div>
                </>
            ) : (
                <>
                    {/* Search view */}
                    <div className="flex-1 animate-in slide-in-from-right-2 duration-200">
                        <ChatSearchBar/>
                    </div>
                    <Button
                        onClick={toggleExpanded}
                        variant="ghost"
                        size="sm"
                        className="glass-control h-8 w-8 p-0"
                        aria-label="Close search"
                        title="Close search"
                    >
                        <X className="h-4 w-4"/>
                    </Button>
                </>
            )}
        </CardTitle>
    );
};

export default ChatSectionHeader;
