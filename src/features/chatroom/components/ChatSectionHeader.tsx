"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {CardTitle} from "@/components/ui/card";
import {
    Archive,
    ArchiveRestore,
    ArrowDownAZ,
    Check,
    Flame,
    GripHorizontal,
    Loader2,
    Megaphone,
    MessageSquare,
    MoreVertical,
    Rocket,
    Search,
    Users,
    X
} from "lucide-react";
import ChatSearchBar from "@/features/chatroom/components/ChatSearchBar";
import NotificationSoundModeMenu from "@/components/NotificationSoundModeMenu";
import {useTopReactedSidebar} from "@/lib/hooks/useTopReactedSidebar";
import {usePromotedMessagesSidebar} from "@/lib/hooks/usePromotedMessagesSidebar";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {useDialog} from "@/components/providers/DialogProvider";
import {ConfirmModal} from "@/components/ConfirmModal";
import {useThunk} from "@/lib/hooks/useThunk";
import {archiveChatRoomThunk, unarchiveChatRoomThunk} from "@/redux/chatRoom/chatRoomThunk";
import {getRoomPromotionsSummary} from "@/api/admin/adminAPI";
import {RoomPromotionsSummary} from "@/models/RoomPromotionsSummary";
import ArchiveRoomPromotionsWarning from "@/features/chatroom/components/ArchiveRoomPromotionsWarning";
import {toast} from "sonner";
import {Role} from "@/models/Role";
import PromoteRoomModal from "@/features/chatroom/components/PromoteRoomModal";
import {ClaimAccountPrompt} from "@/features/auth/components/ClaimAccountPrompt";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch} from "@/redux/store";
import {selectChatRoomTabSortMode} from "@/redux/chatRoom/chatRoomSelectors";
import {setChatRoomTabSortMode} from "@/redux/chatRoom/chatRoomUiSlice";

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
    const dispatch = useDispatch<AppDispatch>();
    const roomTabSortMode = useSelector(selectChatRoomTabSortMode);
    const [isExpanded, setIsExpanded] = useState(false);
    const noiseIndicator = getNoiseIndicator(noiseLevel);
    const {isAdmin, isStaffMember, currentRole} = useRoleAccess();
    const {open, close} = useDialog();
    const [archiveChatRoom, archiveChatRoomLoading] = useThunk(archiveChatRoomThunk);
    const [unarchiveChatRoom, unarchiveChatRoomLoading] = useThunk(unarchiveChatRoomThunk);

    const {
        isActive: topReactedSidebarActive,
        toggleSidebar: onToggleTopReactedSidebar,
    } = useTopReactedSidebar();

    const {
        isActive: promotedSidebarActive,
        toggleSidebar: onTogglePromotedSidebar,
    } = usePromotedMessagesSidebar();

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const actionLoading = archiveChatRoomLoading || unarchiveChatRoomLoading;
    const normalizedChatRoomName = chatRoomName.trim().toLowerCase();
    const canManageArchive = isAdmin()
        && typeof chatRoomId === "number"
        && !ARCHIVE_HIDDEN_ROOM_NAMES.has(normalizedChatRoomName);
    // Any signed-in account may promote a public, non-archived, non-special
    // room; the backend also rejects private/staff rooms and unclaimed users.
    // Staff are excluded from the paid funnel (backend returns 403 as well)
    const canPromoteRoom = !isStaffMember()
        && !isArchived
        && typeof chatRoomId === "number"
        && !ARCHIVE_HIDDEN_ROOM_NAMES.has(normalizedChatRoomName)
        && currentRole !== Role.GUEST;
    const promoteRoomButtonLabel = "Promote Room";
    const topReactedButtonLabel = `${topReactedSidebarActive ? "Hide" : "Show"} Top Reacted`;
    const promotedButtonLabel = `${promotedSidebarActive ? "Hide" : "Show"} Promoted Messages`;
    const popularityButtonLabel = `${popularitySidebarActive ? "Hide" : "Show"} Active Rooms`;

    const handleArchiveConfirm = async () => {
        if (!chatRoomId || actionLoading) {
            return;
        }

        // Show the admin the money impact before archiving: promoted-message
        // refunds/releases plus room promotions (refunded only inside the 24h
        // window, older ones canceled without refund). Rendered as a breakdown
        // block inside the confirm dialog.
        let summary: RoomPromotionsSummary | null = null;
        let summaryLoadError = false;
        try {
            summary = await getRoomPromotionsSummary(chatRoomId);
        } catch {
            summaryLoadError = true;
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
                >
                    <ArchiveRoomPromotionsWarning summary={summary} loadError={summaryLoadError}/>
                </ConfirmModal>
            </div>
        );
    };

    const handlePromoteRoom = () => {
        if (!canPromoteRoom || typeof chatRoomId !== "number") {
            return;
        }

        // Promoting requires a claimed account (backend rejects unclaimed
        // with 403), so prompt the claim flow instead.
        if (currentRole === Role.UNCLAIMED_USER) {
            open(
                <ClaimAccountPrompt
                    description="You're using a throwaway account. To promote a room you need to claim your account by adding an email and password."/>
            );
            return;
        }

        open(
            <PromoteRoomModal chatRoomId={chatRoomId} chatRoomName={chatRoomName}/>,
            {className: 'w-[95vw] max-w-lg'}
        );
    };

    const openArchiveConfirmAfterMenuClose = () => {
        window.setTimeout(() => {
            void handleArchiveConfirm();
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

    const roomTabOrderOptions = (
        <DropdownMenuRadioGroup
            aria-label="Room tab order"
            value={roomTabSortMode}
            onValueChange={(value) => {
                if (value === "manual" || value === "alphabetical") {
                    dispatch(setChatRoomTabSortMode(value));
                }
            }}
        >
            <DropdownMenuRadioItem
                value="manual"
                indicator={<Check className="h-4 w-4" aria-hidden="true"/>}
                className="cursor-pointer gap-2 py-2.5 focus:bg-white/30 dark:focus:bg-white/10"
            >
                <GripHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
                <span className="flex min-w-0 flex-col gap-0.5">
                    <span>Manual</span>
                    <span className="text-xs text-muted-foreground">Drag tabs to rearrange</span>
                </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
                value="alphabetical"
                indicator={<Check className="h-4 w-4" aria-hidden="true"/>}
                className="cursor-pointer gap-2 py-2.5 focus:bg-white/30 dark:focus:bg-white/10"
            >
                <ArrowDownAZ className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
                <span className="flex min-w-0 flex-col gap-0.5">
                    <span>Alphabetical (A–Z)</span>
                    <span className="text-xs text-muted-foreground">Sort by room name</span>
                </span>
            </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
    );

    const renderChatOptionsMenu = (
        buttonClassName: string,
        iconClassName: string,
        variant: "ghost" | "outline" | "secondary"
    ) => {
        return (
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={variant}
                        size="sm"
                        className={buttonClassName}
                        aria-label="Chat options"
                        title="Chat options"
                    >
                        {actionLoading ? <Loader2 className={`${iconClassName} animate-spin`}/> :
                            <MoreVertical className={iconClassName}/>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    collisionPadding={8}
                    className={`glass-popover max-w-[calc(100vw-1rem)] ${isMobile ? "w-60" : "w-52"}`}
                >
                    {isMobile ? (
                        <>
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Room tab order</DropdownMenuLabel>
                            {roomTabOrderOptions}
                        </>
                    ) : (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer focus:bg-white/30 data-[state=open]:bg-white/30 dark:focus:bg-white/10 dark:data-[state=open]:bg-white/10">
                                <ArrowDownAZ aria-hidden="true"/>
                                Room tab order
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="glass-popover w-56" collisionPadding={8}>
                                    {roomTabOrderOptions}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    )}
                    {canManageArchive && (
                        <>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="justify-between focus:bg-white/30 dark:focus:bg-white/10"
                                              disabled={actionLoading}
                                              onSelect={handleArchiveToggle}>
                                {isArchived ? "Unarchive room" : "Archive room"}
                                {isArchived
                                    ? <ArchiveRestore className="h-4 w-4 shrink-0"/>
                                    : <Archive className="h-4 w-4 shrink-0"/>}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // Desktop layout
    if (!isMobile) {
        return (
            <CardTitle className="chat-header-floating flex items-center gap-2">
                <div className={`w-3 h-3 shrink-0 rounded-full ${noiseIndicator.color}`}
                     title={noiseIndicator.title}></div>
                <span className="min-w-0 truncate" title={chatRoomName}>{chatRoomName}</span>
                <div className="flex shrink-0 items-center gap-1.5 ml-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm font-normal text-muted-foreground">
                        {totalMessages}
                    </span>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <ChatSearchBar/>
                    {canPromoteRoom && (
                        <Button
                            onClick={handlePromoteRoom}
                            variant="outline"
                            size="sm"
                            className="glass-control z-10 h-10 w-10 p-2"
                            aria-label={promoteRoomButtonLabel}
                            title={promoteRoomButtonLabel}
                        >
                            <Rocket className="h-5 w-5"/>
                        </Button>
                    )}
                    <Button
                        onClick={onToggleTopReactedSidebar}
                        variant="outline"
                        size="sm"
                        className="glass-control z-10 h-10 w-10 p-2"
                        aria-label={topReactedButtonLabel}
                        title={topReactedButtonLabel}
                    >
                        <Flame className="h-5 w-5"/>
                    </Button>
                    <Button
                        onClick={onTogglePromotedSidebar}
                        variant="outline"
                        size="sm"
                        className="glass-control z-10 h-10 w-10 p-2"
                        aria-label={promotedButtonLabel}
                        title={promotedButtonLabel}
                    >
                        <Megaphone className="h-5 w-5"/>
                    </Button>
                    <Button
                        onClick={onTogglePopularitySidebar}
                        variant="outline"
                        size="sm"
                        className="glass-control z-10 h-10 w-10 p-2"
                        aria-label={popularityButtonLabel}
                        title={popularityButtonLabel}
                    >
                        <Users className="h-5 w-5"/>
                    </Button>
                    <NotificationSoundModeMenu
                        variant="outline"
                        buttonClassName="glass-control z-10 h-10 w-10 p-2"
                        iconClassName="h-5 w-5"
                    />
                    {renderChatOptionsMenu("glass-control z-10 h-10 w-10 p-2", "h-5 w-5", "outline")}
                </div>
            </CardTitle>
        );
    }

    // Mobile layout
    return (
        <CardTitle className="chat-header-floating flex min-w-0 flex-wrap items-center gap-2">
            {!isExpanded ? (
                <>
                    <div className="flex min-w-0 flex-1 basis-32 items-center gap-2">
                        <div className={`w-3 h-3 shrink-0 rounded-full ${noiseIndicator.color}`}
                             title={noiseIndicator.title}></div>
                        <span className="min-w-0 flex-1 truncate" title={chatRoomName}>{chatRoomName}</span>
                        <div className="flex shrink-0 items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground"/>
                            <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                                {totalMessages}
                            </span>
                        </div>
                    </div>
                    <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-1 [&>button]:shrink-0">
                        {canPromoteRoom && (
                            <Button
                                onClick={handlePromoteRoom}
                                variant="ghost"
                                size="sm"
                                className="glass-control h-8 w-8 p-0"
                                aria-label={promoteRoomButtonLabel}
                                title={promoteRoomButtonLabel}
                            >
                                <Rocket className="h-4 w-4"/>
                            </Button>
                        )}
                        <Button
                            onClick={onToggleTopReactedSidebar}
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label={topReactedButtonLabel}
                            title={topReactedButtonLabel}
                        >
                            <Flame className="h-4 w-4"/>
                        </Button>
                        <Button
                            onClick={onTogglePromotedSidebar}
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label={promotedButtonLabel}
                            title={promotedButtonLabel}
                        >
                            <Megaphone className="h-4 w-4"/>
                        </Button>
                        <Button
                            onClick={onTogglePopularitySidebar}
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label={popularityButtonLabel}
                            title={popularityButtonLabel}
                        >
                            <Users className="h-4 w-4"/>
                        </Button>
                        <NotificationSoundModeMenu
                            variant="ghost"
                            buttonClassName="glass-control h-8 w-8 p-0"
                            iconClassName="h-4 w-4"
                        />
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
                        {renderChatOptionsMenu("glass-control h-8 w-8 p-0", "h-4 w-4", "ghost")}
                    </div>
                </>
            ) : (
                <>
                    {/* Search view */}
                    <div className="min-w-0 flex-1 animate-in slide-in-from-right-2 duration-200">
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
