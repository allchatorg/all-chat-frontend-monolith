import {fontPresetStyle} from "@/lib/fontPresets";
import {useUserFonts} from "@/lib/hooks/useUserFonts";
import {UserName} from "@/components/UserName";
import React from "react";
import {ReplyInfo} from "@/models/message";
import {Paperclip, Sticker} from "lucide-react";
import {cn} from "@/lib/utils";
import {chatPreviewText} from "@/features/chatroom/utils/messageMarkers";
import {useVipDialog} from "@/features/vip/useVipDialog";
import {getStickerLabel} from "@/features/stickers/catalog";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";

interface ReplyPreviewProps {
    replyTo: ReplyInfo;
    isOwn?: boolean;
    onJump?: (messageId: number) => void;
}

/**
 * Discord-style compact preview of the message being replied to, rendered above
 * the reply bubble with a curved connector line. The username and message
 * preview jump to the original, while the VIP badge opens VIP information.
 * When the original message was removed and the viewer may not see its content
 * (content === null), a
 * "Message removed" placeholder is shown and the jump action is disabled.
 * Staff still receive the content of soft-deleted parents and keep the jump.
 * An attachment on the original is indicated with a paperclip icon followed by
 * the attachment's name (italic, truncated to differentiate it from message
 * text); if the original is attachment-only, the icon and name are shown alone.
 */
const ReplyPreview: React.FC<ReplyPreviewProps> = ({replyTo, isOwn = false, onJump}) => {
    const fonts = useUserFonts(replyTo.senderId, {
        usernameFont: replyTo.senderUsernameFont,
        messageFont: replyTo.senderMessageFont,
        fontRevision: replyTo.senderFontRevision,
    });
    const openVip = useVipDialog();
    const {isStaffMember} = useRoleAccess();
    const removed = replyTo.content === null || Boolean(replyTo.deleted && replyTo.stickerId && !isStaffMember());
    const clickable = !removed && !!onJump;
    const hasContent = !removed && (replyTo.content ?? "").length > 0;
    const showAttachmentIcon = !removed && replyTo.hasAttachment;
    const showSticker = !removed && Boolean(replyTo.stickerId);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onJump?.(replyTo.id);
    };

    return (
        <div
            data-message-reaction-block="true"
            className={cn(
                "flex items-end min-w-0 max-w-full text-xs text-muted-foreground select-none text-left",
                isOwn ? "flex-row-reverse pr-1" : "pl-1"
            )}
        >
            {/* Connector spur linking the preview down to the bubble below */}
            <div
                aria-hidden="true"
                className={cn(
                    "h-2.5 w-4 shrink-0 -mb-px border-muted-foreground/40",
                    isOwn
                        ? "border-t-2 border-r-2 rounded-tr-md ml-1"
                        : "border-t-2 border-l-2 rounded-tl-md mr-1"
                )}
            />
            <span className="flex items-center gap-1 min-w-0 max-w-full pb-0.5">
                {removed ? (
                    <span className="italic truncate">Message removed</span>
                ) : (
                    <>
                        <UserName
                            userId={replyTo.senderId}
                            username={replyTo.senderUsername}
                            vipBadgeVisible={replyTo.senderVipBadgeVisible}
                            vipBadgeRevision={replyTo.senderVipBadgeRevision}
                            usernameFont={replyTo.senderUsernameFont}
                            messageFont={replyTo.senderMessageFont}
                            fontRevision={replyTo.senderFontRevision}
                            className="max-w-[50%] font-medium dark:text-slate-200"
                            onVipClick={openVip}
                            renderUsername={username => (
                                <button
                                    type="button"
                                    onClick={clickable ? handleClick : undefined}
                                    disabled={!clickable}
                                    title={clickable ? "Jump to replied message" : undefined}
                                    className={cn(
                                        "min-w-0 flex text-left transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        clickable ? "cursor-pointer hover:text-foreground" : "cursor-default"
                                    )}
                                >
                                    {username}
                                </button>
                            )}
                        />
                        {(showAttachmentIcon || hasContent || showSticker) && (
                            <button
                                type="button"
                                onClick={clickable ? handleClick : undefined}
                                disabled={!clickable}
                                title={clickable ? "Jump to replied message" : undefined}
                                className={cn(
                                    "flex items-center gap-1 min-w-0 text-left transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    clickable ? "cursor-pointer hover:text-foreground" : "cursor-default"
                                )}
                            >
                                {showSticker && (
                                    <>
                                        <Sticker className="h-3 w-3 shrink-0" aria-hidden="true"/>
                                        <span className="truncate min-w-0">{getStickerLabel(replyTo.stickerId)}</span>
                                    </>
                                )}
                                {showAttachmentIcon && (
                                    <Paperclip className="h-3 w-3 shrink-0" aria-label="Attachment"/>
                                )}
                                {showAttachmentIcon && replyTo.attachmentName && (
                                    <span className={cn("truncate min-w-0 italic", hasContent && "max-w-[45%]")}>
                                        {replyTo.attachmentName}
                                    </span>
                                )}
                                {hasContent && (
                                    <span className={cn("truncate min-w-0", replyTo.deleted && "italic")}
                                          style={fontPresetStyle(fonts.messageFont)}>
                                        {chatPreviewText(replyTo.content ?? "")}
                                    </span>
                                )}
                            </button>
                        )}
                    </>
                )}
            </span>
        </div>
    );
};

export default ReplyPreview;
