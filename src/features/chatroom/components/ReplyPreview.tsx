import React from "react";
import {ReplyInfo} from "@/models/message";
import {Paperclip} from "lucide-react";
import {cn} from "@/lib/utils";

interface ReplyPreviewProps {
    replyTo: ReplyInfo;
    isOwn?: boolean;
    onJump?: (messageId: number) => void;
}

/**
 * Discord-style compact preview of the message being replied to, rendered above
 * the reply bubble with a curved connector line. The whole row (connector
 * included) is clickable and highlights on hover. When the original message was
 * removed and the viewer may not see its content (content === null), a
 * "Message removed" placeholder is shown and the jump action is disabled.
 * Staff still receive the content of soft-deleted parents and keep the jump.
 * An attachment on the original is indicated with a paperclip icon followed by
 * the attachment's name (italic, truncated to differentiate it from message
 * text); if the original is attachment-only, the icon and name are shown alone.
 */
const ReplyPreview: React.FC<ReplyPreviewProps> = ({replyTo, isOwn = false, onJump}) => {
    const removed = replyTo.content === null;
    const clickable = !removed && !!onJump;
    const hasContent = !removed && (replyTo.content ?? "").length > 0;
    const showAttachmentIcon = !removed && replyTo.hasAttachment;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onJump?.(replyTo.id);
    };

    return (
        <button
            type="button"
            data-message-reaction-block="true"
            onClick={clickable ? handleClick : undefined}
            disabled={!clickable}
            className={cn(
                "group/reply flex items-end min-w-0 max-w-full text-xs text-muted-foreground select-none text-left",
                isOwn ? "flex-row-reverse pr-1" : "pl-1",
                clickable ? "cursor-pointer" : "cursor-default"
            )}
            title={clickable ? "Jump to replied message" : undefined}
        >
            {/* Connector spur linking the preview down to the bubble below */}
            <div
                aria-hidden="true"
                className={cn(
                    "h-2.5 w-4 shrink-0 -mb-px border-muted-foreground/40 transition-colors",
                    clickable && "group-hover/reply:border-foreground/60",
                    isOwn
                        ? "border-t-2 border-r-2 rounded-tr-md ml-1"
                        : "border-t-2 border-l-2 rounded-tl-md mr-1"
                )}
            />
            <span
                className={cn(
                    "flex items-center gap-1 min-w-0 max-w-full pb-0.5 transition-colors",
                    clickable && "group-hover/reply:text-foreground"
                )}
            >
                {removed ? (
                    <span className="italic truncate">Message removed</span>
                ) : (
                    <>
                        <span
                            className="font-medium shrink-0"
                            style={replyTo.color ? {color: replyTo.color} : undefined}
                        >
                            {replyTo.senderUsername}
                        </span>
                        {showAttachmentIcon && (
                            <Paperclip className="h-3 w-3 shrink-0" aria-label="Attachment"/>
                        )}
                        {showAttachmentIcon && replyTo.attachmentName && (
                            <span className={cn("truncate min-w-0 italic", hasContent && "max-w-[45%]")}>
                                {replyTo.attachmentName}
                            </span>
                        )}
                        {hasContent && (
                            <span className={cn("truncate min-w-0", replyTo.deleted && "italic")}>
                                {replyTo.content}
                            </span>
                        )}
                    </>
                )}
            </span>
        </button>
    );
};

export default ReplyPreview;
