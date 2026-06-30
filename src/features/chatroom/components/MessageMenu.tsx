import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Flag, MoreHorizontal, Pencil, Reply, Shield, Smile, Trash2} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {setSelectedUserInfo} from "@/redux/modPanel/modPanelSlice";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {useDialog} from "@/components/providers/DialogProvider";
import ReportForm from "@/features/chatroom/components/ReportForm";
import {GuestModalWrapper} from "@/components/GuestModalWrapper";
import {canActOn, Role} from "@/models/Role";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {setMessageReactions} from "@/redux/chatRoom/chatRoomUiSlice";
import {fetchMessageReactionDetailsThunk} from "@/redux/chatRoom/chatRoomThunk";
import MessageReactionsPanel from "@/features/chatroom/components/MessageReactionsPanel";
import {cn} from "@/lib/utils";
import {Message} from "@/models/message";
import {useTheme} from "next-themes";

interface MessageMenuProps {
    message: Message,
    messageId: number;
    userId: number;
    userName?: string;
    role: Role;
    removeMessage?: (messageId: number) => void;
    updateMessageReaction: (messageId: number, emoji: string, emojiId: string) => void;
    setEditingMessage: (message: Message) => void;
    onReply?: (message: Message) => void;
    direction?: "ltr" | "rtl";
    deleted: boolean;
    className?: string;
    disabled?: boolean;
    archivedRoom?: boolean;
    allowReport?: boolean;
    // Private chat is staff-only, so the Mod View action is suppressed there.
    allowModView?: boolean;
    // Observer (admin review) mode: hide every action except Remove, which stays gated by
    // canRemoveMessage (canActOn the sender). Reactions/edit/report/mod-view are suppressed.
    deleteOnly?: boolean;
    emojiPopoverOpen?: boolean;
    onEmojiPopoverOpenChange?: (open: boolean) => void;
}

export const MessageMenu: React.FC<MessageMenuProps> = ({
                                                            message,
                                                            messageId,
                                                            userId,
                                                            userName,
                                                            role,
                                                            removeMessage,
                                                            updateMessageReaction,
                                                            setEditingMessage,
                                                            onReply,
                                                            direction = "ltr",
                                                            deleted,
                                                            className,
                                                            disabled = false,
                                                            archivedRoom = false,
                                                            allowReport = true,
                                                            allowModView = true,
                                                            deleteOnly = false,
                                                            emojiPopoverOpen,
                                                            onEmojiPopoverOpenChange,
                                                        }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {open} = useDialog();
    const {isPrincipal, isStaffMember, currentRole} = useRoleAccess();
    const [internalEmojiPopoverOpen, setInternalEmojiPopoverOpen] = useState(false);
    const {resolvedTheme} = useTheme();
    const canViewReactions = Boolean(message.reactions && message.reactions.length > 0 && !deleted);
    const canReply = Boolean(onReply && !deleted && !archivedRoom);
    const canEditMessage = Boolean(isPrincipal(userId) && !deleted && !archivedRoom);
    const canRemoveMessage = Boolean((isPrincipal(userId) || canActOn(currentRole, role)) && !deleted && !archivedRoom);
    const canOpenModView = Boolean(allowModView && isStaffMember() && !isPrincipal(userId));
    const canReport = Boolean(!isPrincipal(userId) && allowReport);
    const canOpenActionsMenu = canViewReactions || canReply || canEditMessage || canRemoveMessage || canOpenModView || canReport;
    const canAddReaction = Boolean(!deleted && !archivedRoom);
    const isEmojiPopoverControlled = emojiPopoverOpen !== undefined;
    const isOpenEmojiPopover = isEmojiPopoverControlled ? emojiPopoverOpen : internalEmojiPopoverOpen;

    const handleEmojiPopoverOpenChange = (open: boolean) => {
        if (!isEmojiPopoverControlled) {
            setInternalEmojiPopoverOpen(open);
        }

        onEmojiPopoverOpenChange?.(open);
    };

    const buttonGroup = (
        <div className={cn("flex items-center gap-1", className)}>
            {canOpenActionsMenu && (
                <Button variant="outline" size="icon" className="glass-control" disabled={disabled}
                        aria-label="Message actions">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            )}
            {canAddReaction && (
                <Button variant="outline" size="icon" className="glass-control" disabled={disabled}
                        aria-label="Add reaction">
                    <Smile className="h-4 w-4"/>
                </Button>
            )}
        </div>
    );

    // Observer/delete-only mode: render just a Remove action (when permitted), nothing else.
    // Checked before `disabled` because the observer passes disabled={true} to suppress reactions.
    if (deleteOnly) {
        if (!canRemoveMessage) {
            return null;
        }
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <DropdownMenu dir={direction} modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="glass-control" aria-label="Message actions">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="glass-popover w-48">
                        <DropdownMenuItem
                            className="justify-between"
                            onClick={() => removeMessage?.(messageId)}
                        >
                            Remove Message
                            <Trash2 className="h-4 w-4"/>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    if (disabled) {
        return buttonGroup;
    }

    return (
        <GuestModalWrapper isGuest={currentRole === Role.GUEST}>
            <div className={cn("flex items-center gap-1", className)}>
                {canOpenActionsMenu && (
                    <DropdownMenu dir={direction} modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="glass-control">
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="glass-popover w-48">
                            {canViewReactions && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => {
                                        dispatch(setMessageReactions(message.reactions));
                                        dispatch(fetchMessageReactionDetailsThunk({
                                            messageId: messageId,
                                            emoji: message.reactions[0].emoji,
                                            limit: 3
                                        }));
                                        open(<MessageReactionsPanel/>, {className: 'p-0 border-0'});
                                    }}
                                >
                                    View Reactions
                                    <Smile className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                            {canReply && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => onReply?.(message)}
                                >
                                    Reply
                                    <Reply className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                            {canEditMessage && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => setEditingMessage?.(message)}
                                >
                                    Edit Message
                                    <Pencil className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                            {canRemoveMessage && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => removeMessage?.(messageId)}
                                >
                                    Remove Message
                                    <Trash2 className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                            {canOpenModView && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => {
                                        dispatch(
                                            setSelectedUserInfo({
                                                userId: userId,
                                                userName: userName ?? "Unknown User",
                                            })
                                        );
                                        dispatch(setActiveRightSidebar("mod-view"));
                                    }}
                                >
                                    Open Mod View
                                    <Shield className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                            {canReport && (
                                <DropdownMenuItem
                                    className="justify-between"
                                    onClick={() => open(<ReportForm messageId={messageId}/>)}
                                >
                                    Report
                                    <Flag className="h-4 w-4"/>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {canAddReaction && (
                    <Popover open={isOpenEmojiPopover} onOpenChange={handleEmojiPopoverOpenChange}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="glass-control">
                                <Smile className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={4}
                            className="glass-popover p-0 border-none shadow-lg"
                        >
                            <Picker
                                data={data}
                                theme={resolvedTheme}
                                onEmojiSelect={(emoji: any) => {
                                    updateMessageReaction?.(messageId, emoji.native, emoji.id);
                                    handleEmojiPopoverOpenChange(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </GuestModalWrapper>
    );
};
