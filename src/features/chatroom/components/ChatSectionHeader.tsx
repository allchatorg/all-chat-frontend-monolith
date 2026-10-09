"use client";

import {useRoomParticipation} from "@/lib/hooks/useRoomParticipation";
import {RoomVipBadge} from "@/components/RoomVipBadge";
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
    type LucideIcon,
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
import {RadioMenuSub} from "@/features/radio/components/RadioMenu";
import {RadioMenuContent, RadioMenuRoot} from "@/features/radio/components/RadioMenuRoot";
import {useTopReactedSidebar} from "@/lib/hooks/useTopReactedSidebar";
import {usePromotedMessagesSidebar} from "@/lib/hooks/usePromotedMessagesSidebar";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useElementWidth} from "@/lib/hooks/useElementWidth";
import {
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
    showRadio?: boolean;
    chatRoomId?: number;
    chatRoomName: string;
    isArchived?: boolean;
    vipOnly?: boolean;
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

// Header widths (px) below which lower-priority items leave the title row, so
// the room name keeps roughly 160-240px even next to the VIP badge. These are
// measured on the header itself, so open sidebars shrink it too.
const INLINE_SEARCH_BAR_MIN_WIDTH = 940;
const INLINE_PANEL_ACTIONS_MIN_WIDTH = {desktop: 700, mobile: 600};
const INLINE_ROOM_META_MIN_WIDTH = {desktop: 520, mobile: 420};

interface PanelAction {
    key: string;
    label: string;
    Icon: LucideIcon;
    onSelect: () => void;
    opensDialog?: boolean;
}

const ChatSectionHeader: React.FC<ChatSectionHeaderProps> = ({
                                                                 showRadio = false,
                                                                 chatRoomId,
                                                                 chatRoomName,
                                                                 isArchived = false,
                                                                 vipOnly = false,
                                                                 totalMessages,
                                                                 noiseLevel,
                                                                 popularitySidebarActive,
                                                                 onTogglePopularitySidebar,
                                                             }) => {
    const isMobile = useIsMobile();
    const dispatch = useDispatch<AppDispatch>();
    const roomTabSortMode = useSelector(selectChatRoomTabSortMode);
    const [isExpanded, setIsExpanded] = useState(false);
    const [headerNode, setHeaderNode] = useState<HTMLDivElement | null>(null);
    // Unmeasured (server render) counts as roomy, matching the full layout.
    const headerWidth = useElementWidth(headerNode) ?? Number.POSITIVE_INFINITY;
    const layout = isMobile ? "mobile" : "desktop";
    const searchBarCollapsed = isMobile || headerWidth < INLINE_SEARCH_BAR_MIN_WIDTH;
    const panelActionsCollapsed = headerWidth < INLINE_PANEL_ACTIONS_MIN_WIDTH[layout];
    const roomMetaCollapsed = headerWidth < INLINE_ROOM_META_MIN_WIDTH[layout];
    const searchOpen = isExpanded && searchBarCollapsed;
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

    const participationDisabled = useRoomParticipation(chatRoomId, vipOnly);
    const actionLoading = archiveChatRoomLoading || unarchiveChatRoomLoading;
    const normalizedChatRoomName = chatRoomName.trim().toLowerCase();
    const canManageArchive = isAdmin()
        && typeof chatRoomId === "number"
        && (vipOnly || !ARCHIVE_HIDDEN_ROOM_NAMES.has(normalizedChatRoomName));
    // Any signed-in account may promote a public, non-archived, non-special
    // room; the backend also rejects private/staff rooms and unclaimed users.
    // Staff are excluded from the paid funnel (backend returns 403 as well)
    const canPromoteRoom = !participationDisabled && !isStaffMember()
        && !isArchived
        && typeof chatRoomId === "number"
        && (vipOnly || !ARCHIVE_HIDDEN_ROOM_NAMES.has(normalizedChatRoomName))
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
            <PromoteRoomModal chatRoomId={chatRoomId} chatRoomName={chatRoomName} vipOnly={vipOnly}/>,
            {className: 'w-[95vw] max-w-lg'}
        );
    };

    // Dialogs opened from a menu item wait for the menu to finish closing.
    const runAfterMenuClose = (action: () => void) => {
        window.setTimeout(action, 100);
    };

    const handleArchiveToggle = async () => {
        if (!chatRoomId || actionLoading) {
            return;
        }

        if (!isArchived) {
            runAfterMenuClose(() => void handleArchiveConfirm());
            return;
        }

        try {
            await unarchiveChatRoom(chatRoomId);
            toast.success(`Unarchived ${chatRoomName}.`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to unarchive chat room.");
        }
    };

    // Shown as header buttons when there is room, otherwise in the options menu.
    const panelActions: PanelAction[] = [
        ...(canPromoteRoom ? [{
            key: "promote-room",
            label: promoteRoomButtonLabel,
            Icon: Rocket,
            onSelect: handlePromoteRoom,
            opensDialog: true,
        }] : []),
        {key: "top-reacted", label: topReactedButtonLabel, Icon: Flame, onSelect: onToggleTopReactedSidebar},
        {key: "promoted-messages", label: promotedButtonLabel, Icon: Megaphone, onSelect: onTogglePromotedSidebar},
        {key: "active-rooms", label: popularityButtonLabel, Icon: Users, onSelect: onTogglePopularitySidebar},
    ];

    const renderPanelActionButtons = (
        buttonClassName: string,
        iconClassName: string,
        variant: "ghost" | "outline"
    ) => panelActions.map(({key, label, Icon, onSelect}) => (
        <Button
            key={key}
            onClick={onSelect}
            variant={variant}
            size="sm"
            className={buttonClassName}
            aria-label={label}
            title={label}
        >
            <Icon className={iconClassName}/>
        </Button>
    ));

    const renderSearchToggle = (
        buttonClassName: string,
        iconClassName: string,
        variant: "ghost" | "outline"
    ) => (
        <Button
            onClick={toggleExpanded}
            variant={variant}
            size="sm"
            className={buttonClassName}
            aria-label={searchOpen ? "Close search" : "Open search"}
            title={searchOpen ? "Close search" : "Open search"}
        >
            {searchOpen ? <X className={iconClassName}/> : <Search className={iconClassName}/>}
        </Button>
    );

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
            <RadioMenuRoot>
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
                <RadioMenuContent
                    align="end"
                    collisionPadding={8}
                    className={`glass-popover max-w-[calc(100vw-1rem)] ${isMobile ? "w-60" : "w-52"}`}
                >
                    {roomMetaCollapsed && (
                        <>
                            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                                <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden="true"/>
                                {totalMessages} {totalMessages === 1 ? "message" : "messages"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                        </>
                    )}
                    {panelActionsCollapsed && (
                        <>
                            {panelActions.map(({key, label, Icon, onSelect, opensDialog}) => (
                                <DropdownMenuItem
                                    key={key}
                                    className="cursor-pointer focus:bg-white/30 dark:focus:bg-white/10"
                                    onSelect={() => opensDialog ? runAfterMenuClose(onSelect) : onSelect()}
                                >
                                    <Icon aria-hidden="true"/>
                                    {label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator/>
                        </>
                    )}
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
                    {showRadio && (
                        <>
                            <DropdownMenuSeparator/>
                            <RadioMenuSub/>
                        </>
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
                </RadioMenuContent>
            </RadioMenuRoot>
        );
    };

    const noiseDot = (
        <div className={`w-3 h-3 shrink-0 rounded-full ${noiseIndicator.color}`}
             title={noiseIndicator.title}></div>
    );
    const roomName = <span className="min-w-0 truncate" title={chatRoomName}>{chatRoomName}</span>;

    // Desktop layout
    if (!isMobile) {
        const controlClassName = "glass-control z-10 h-10 w-10 p-2";
        return (
            <CardTitle ref={setHeaderNode} className="chat-header-floating flex items-center gap-2">
                {searchOpen ? (
                    <>
                        <div className="min-w-0 flex-1 animate-in slide-in-from-right-2 duration-200">
                            <ChatSearchBar/>
                        </div>
                        {renderSearchToggle(controlClassName, "h-5 w-5", "outline")}
                        {renderChatOptionsMenu(controlClassName, "h-5 w-5", "outline")}
                    </>
                ) : (
                    <>
                        {noiseDot}
                        {roomName}
                        <RoomVipBadge vipOnly={vipOnly} compact={roomMetaCollapsed}/>
                        {!roomMetaCollapsed && (
                            <div className="flex shrink-0 items-center gap-1.5 ml-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {totalMessages}
                                </span>
                            </div>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            {searchBarCollapsed
                                ? renderSearchToggle(controlClassName, "h-5 w-5", "outline")
                                : <ChatSearchBar/>}
                            {!panelActionsCollapsed && renderPanelActionButtons(controlClassName, "h-5 w-5", "outline")}
                            <NotificationSoundModeMenu
                                variant="outline"
                                buttonClassName={controlClassName}
                                iconClassName="h-5 w-5"
                            />
                            {renderChatOptionsMenu(controlClassName, "h-5 w-5", "outline")}
                        </div>
                    </>
                )}
            </CardTitle>
        );
    }

    // Mobile layout
    const controlClassName = "glass-control h-8 w-8 p-0";
    return (
        <CardTitle ref={setHeaderNode} className="chat-header-floating flex min-w-0 flex-wrap items-center gap-2">
            {searchOpen ? (
                <>
                    <div className="min-w-0 flex-1 animate-in slide-in-from-right-2 duration-200">
                        <ChatSearchBar/>
                    </div>
                    {renderSearchToggle(`${controlClassName} shrink-0`, "h-4 w-4", "ghost")}
                    {renderChatOptionsMenu(`${controlClassName} shrink-0`, "h-4 w-4", "ghost")}
                </>
            ) : (
                <>
                    {/* Sized to its content, so the actions only drop to a
                        second row when the full room name wouldn't fit. */}
                    <div className="flex min-w-0 flex-auto items-center gap-2">
                        {noiseDot}
                        {roomName}
                        <RoomVipBadge vipOnly={vipOnly} compact={roomMetaCollapsed}/>
                        {!roomMetaCollapsed && (
                            <div className="flex shrink-0 items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground"/>
                                <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                                    {totalMessages}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1">
                        {!panelActionsCollapsed && renderPanelActionButtons(controlClassName, "h-4 w-4", "ghost")}
                        <NotificationSoundModeMenu
                            variant="ghost"
                            buttonClassName={controlClassName}
                            iconClassName="h-4 w-4"
                        />
                        {renderSearchToggle(controlClassName, "h-4 w-4", "ghost")}
                        {renderChatOptionsMenu(controlClassName, "h-4 w-4", "ghost")}
                    </div>
                </>
            )}
        </CardTitle>
    );
};

export default ChatSectionHeader;
