import {useRoomParticipation} from "@/lib/hooks/useRoomParticipation";
import React, {useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Flag, Megaphone, MoreHorizontal, Pencil, Reply, Shield, Smile, Trash2} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {setSelectedUserInfo} from "@/redux/modPanel/modPanelSlice";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {useDialog} from "@/components/providers/DialogProvider";
import ReportForm from "@/features/chatroom/components/ReportForm";
import PromoteMessageModal from "@/features/chatroom/components/PromoteMessageModal";
import {ClaimAccountPrompt} from "@/features/auth/components/ClaimAccountPrompt";
import RemovePromotedMessageDialog from "@/features/chatroom/components/RemovePromotedMessageDialog";
import {GuestModalWrapper} from "@/components/GuestModalWrapper";
import {canActOn, Role} from "@/models/Role";
import {setMessageReactions, setSelectedReaction} from "@/redux/chatRoom/chatRoomUiSlice";
import MessageReactionsPanel from "@/features/chatroom/components/MessageReactionsPanel";
import {cn} from "@/lib/utils";
import {Message} from "@/models/message";
import {ReactionPicker} from "@/features/stickers/ReactionPicker";
import {selectUser} from "@/redux/user/userSelectors";
import {useVipDialog} from "@/features/vip/useVipDialog";
import {MessageAction, MessageActionSheet, MessageActionSheetView} from "@/features/chatroom/components/MessageActionSheet";
import {chatPreviewText} from "@/features/chatroom/utils/messageMarkers";

interface MessageMenuProps {
    message: Message,
    messageId: number;
    userId: number;
    userName?: string;
    role: Role;
    removeMessage?: (messageId: number) => void;
    updateMessageReaction: (messageId: number, emoji: string, emojiId: string) => Promise<void>;
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
    // Promotions only exist for public chat-room messages, so private chat suppresses the action.
    allowPromote?: boolean;
    // Observer (admin review) mode: hide every action except Remove, which stays gated by
    // canRemoveMessage (canActOn the sender). Reactions/edit/report/mod-view are suppressed.
    deleteOnly?: boolean;
    emojiPopoverOpen?: boolean;
    onEmojiPopoverOpenChange?: (open: boolean) => void;
    // Mobile: the actions and reaction buttons open a bottom sheet instead of the dropdown/popover.
    mobileSheet?: boolean;
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
                                                            allowPromote = true,
                                                            deleteOnly = false,
                                                            emojiPopoverOpen,
                                                            onEmojiPopoverOpenChange,
                                                            mobileSheet = false,
                                                        }) => {
    const participationDisabled = useRoomParticipation(message.chatRoomId, message.chatRoomVipOnly);
    const dispatch = useDispatch<AppDispatch>();
    const {open} = useDialog();
    const {isPrincipal, isStaffMember, currentRole} = useRoleAccess();
    const [internalEmojiPopoverOpen, setInternalEmojiPopoverOpen] = useState(false);
    const [isRemovePromotedDialogOpen, setIsRemovePromotedDialogOpen] = useState(false);
    const [sheetView, setSheetView] = useState<MessageActionSheetView | null>(null);
    const vipActive = useSelector(selectUser)?.vipActive === true;
    const openVip = useVipDialog();
    const upgradingRef = useRef(false);
    // An active promotion locks the message against edits: the promoted content
    // must stay what was reviewed/paid for. Removal of a PENDING one is handled
    // in handleRemoveMessage below.
    const activePromotionStatus = message.promotion?.status === "PENDING"
        || message.promotion?.status === "APPROVED"
        ? message.promotion.status
        : null;
    const canViewReactions = Boolean(message.reactions && message.reactions.length > 0 && !deleted);
    const canReply = Boolean(!participationDisabled && onReply && !deleted && !archivedRoom);
    const canEditMessage = Boolean(!participationDisabled && isPrincipal(userId) && !deleted && !archivedRoom && !activePromotionStatus && !message.stickerId);
    const canRemoveMessage = Boolean(!participationDisabled && (isPrincipal(userId) || canActOn(currentRole, role)) && !deleted && !archivedRoom);
    const canOpenModView = Boolean(allowModView && isStaffMember() && !isPrincipal(userId));
    const canReport = Boolean(!isPrincipal(userId) && allowReport);
    // Staff are excluded from the paid funnel (backend returns 403 as well)
    const canPromote = Boolean(!participationDisabled && allowPromote && isPrincipal(userId) && !isStaffMember() && !deleted && !archivedRoom && !message.promotion && !message.stickerId);
    const canOpenActionsMenu = canViewReactions || canReply || canEditMessage || canRemoveMessage || canOpenModView || canReport || canPromote;
    const canAddReaction = Boolean(!participationDisabled && !deleted && !archivedRoom);
    const isEmojiPopoverControlled = emojiPopoverOpen !== undefined;
    const isOpenEmojiPopover = isEmojiPopoverControlled ? emojiPopoverOpen : internalEmojiPopoverOpen;

    React.useEffect(() => {
        if (participationDisabled) {
            setInternalEmojiPopoverOpen(false);
            setIsRemovePromotedDialogOpen(false);
            onEmojiPopoverOpenChange?.(false);
        }
    }, [participationDisabled]);

    const handleEmojiPopoverOpenChange = (open: boolean) => {
        if (!isEmojiPopoverControlled) {
            setInternalEmojiPopoverOpen(open);
        }

        onEmojiPopoverOpenChange?.(open);
    };

    // Removing a message with an active promotion either cascades into canceling
    // the promotion on the backend (staff, or owner of an APPROVED one — confirm
    // first), or is blocked for the owner while the promotion is PENDING: they
    // must request a cancellation in the ads portal before removing the message.
    const ownerPendingPromotion = activePromotionStatus === "PENDING" && isPrincipal(userId);

    const handleRemoveMessage = () => {
        if (participationDisabled) return;
        if (activePromotionStatus) {
            setIsRemovePromotedDialogOpen(true);
        } else {
            removeMessage?.(messageId);
        }
    };

    const removePromotedDialog = activePromotionStatus ? (
        <RemovePromotedMessageDialog
            open={isRemovePromotedDialogOpen}
            onOpenChange={setIsRemovePromotedDialogOpen}
            promotionStatus={activePromotionStatus}
            ownerPendingBlock={ownerPendingPromotion}
            promotionId={message.promotion?.id}
            onConfirm={() => {
                setIsRemovePromotedDialogOpen(false);
                removeMessage?.(messageId);
            }}
        />
    ) : null;

    const removeAction: MessageAction = {key: "remove", label: "Remove Message", Icon: Trash2, onSelect: handleRemoveMessage, destructive: true};
    const actions: MessageAction[] = deleteOnly ? (canRemoveMessage ? [removeAction] : []) : [
        canViewReactions && {
            key: "view-reactions", label: "View Reactions", Icon: Smile, onSelect: () => {
                dispatch(setMessageReactions(message.reactions));
                dispatch(setSelectedReaction(message.reactions[0]));
                open(<MessageReactionsPanel/>, {className: 'p-0 border-0'});
            },
        },
        canReply && {key: "reply", label: "Reply", Icon: Reply, onSelect: () => onReply?.(message)},
        canEditMessage && {key: "edit", label: "Edit Message", Icon: Pencil, onSelect: () => setEditingMessage?.(message)},
        canRemoveMessage && removeAction,
        canPromote && {
            key: "promote", label: "Promote Message", Icon: Megaphone, onSelect: () => {
                // Promoting requires a claimed account (backend rejects
                // unclaimed with 403), so prompt the claim flow instead.
                if (currentRole === Role.UNCLAIMED_USER) {
                    open(
                        <ClaimAccountPrompt
                            description="You're using a throwaway account. To promote a message you need to claim your account by adding an email and password."/>
                    );
                    return;
                }
                open(<PromoteMessageModal message={message}/>, {className: 'w-[95vw] max-w-lg'});
            },
        },
        canOpenModView && {
            key: "mod-view", label: "Open Mod View", Icon: Shield, onSelect: () => {
                dispatch(
                    setSelectedUserInfo({
                        userId: userId,
                        userName: userName ?? "Unknown User",
                    })
                );
                dispatch(setActiveRightSidebar("mod-view"));
            },
        },
        canReport && {
            key: "report", label: "Report", Icon: Flag, destructive: true, onSelect: () => open(<ReportForm messageId={messageId}/>, {
                // Glass styling lives on the dialog itself so the form
                // doesn't draw a second border inside DialogContent's.
                className: "glass-popover glass-modal-mobile p-0 overflow-hidden",
                // Light scrim: the default bg-black/80 overlay greys out
                // the surface in light mode (same as notification dialog).
                overlayClassName: "bg-slate-950/30 backdrop-blur-[2px] dark:bg-black/45",
            }),
        },
    ].filter((action): action is MessageAction => Boolean(action));
    const actionItems = actions.map(action => (
        <DropdownMenuItem key={action.key} className="justify-between" onClick={action.onSelect}>
            {action.label}
            <action.Icon className="h-4 w-4"/>
        </DropdownMenuItem>
    ));
    const openSheet = (view: MessageActionSheetView) => {
        if (currentRole !== Role.GUEST) setSheetView(view);
    };
    const actionsButton = (
        <Button variant="outline" size="icon" className="glass-control" aria-label="Message actions"
                onClick={mobileSheet ? () => openSheet("actions") : undefined}>
            <MoreHorizontal className="h-4 w-4"/>
        </Button>
    );
    const actionsMenu = mobileSheet ? actionsButton : (
        <DropdownMenu dir={direction} modal={false}>
            <DropdownMenuTrigger asChild>{actionsButton}</DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass-popover w-48">
                {actionItems}
            </DropdownMenuContent>
        </DropdownMenu>
    );
    const actionSheet = mobileSheet && (
        <MessageActionSheet
            openView={sheetView}
            onClose={() => setSheetView(null)}
            title={message.senderUsername || "Message"}
            preview={message.content ? chatPreviewText(message.content)
                : message.stickerId ? "Sticker" : message.attachments?.length ? "Attachment" : undefined}
            actions={actions}
            canReact={canAddReaction && !deleteOnly}
            reactions={message.reactions}
            vipActive={vipActive}
            isGuest={currentRole === Role.GUEST}
            onReact={(emoji, emojiId) => updateMessageReaction(messageId, emoji, emojiId)}
            onUpgrade={openVip}
        />
    );

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
                {actionsMenu}
                {actionSheet}
                {removePromotedDialog}
            </div>
        );
    }

    if (disabled) {
        return buttonGroup;
    }

    return (
        <GuestModalWrapper isGuest={currentRole === Role.GUEST}>
            <div className={cn("flex items-center gap-1", className)}>
                {canOpenActionsMenu && actionsMenu}

                {canAddReaction && (mobileSheet ? (
                    <Button variant="outline" size="icon" className="glass-control" aria-label="Add reaction"
                            onClick={() => openSheet("emoji")}>
                        <Smile className="h-4 w-4"/>
                    </Button>
                ) : (
                    <Popover open={isOpenEmojiPopover} onOpenChange={handleEmojiPopoverOpenChange}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="glass-control" aria-label="Add reaction">
                                <Smile className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            collisionPadding={12}
                            aria-label="Choose a message reaction"
                            className="w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl"
                            onCloseAutoFocus={event => {
                                // Keep focus inside the upgrade dialog when opening it from this popover.
                                if (upgradingRef.current) event.preventDefault();
                                upgradingRef.current = false;
                            }}
                        >
                            <ReactionPicker
                                vipActive={vipActive}
                                reactions={message.reactions}
                                onSelect={(emoji, emojiId) => updateMessageReaction(messageId, emoji, emojiId)}
                                onClose={() => handleEmojiPopoverOpenChange(false)}
                                onUpgrade={() => {
                                    upgradingRef.current = true;
                                    handleEmojiPopoverOpenChange(false);
                                    openVip();
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                ))}
                {actionSheet}
                {removePromotedDialog}
            </div>
        </GuestModalWrapper>
    );
};
