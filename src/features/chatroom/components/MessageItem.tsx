import clsx from "clsx";
import {useDispatch} from "react-redux";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {extractUrls, VideoLinkPreview} from "@/features/chatroom/components/VideoLinkPreview";
import {Message} from "@/models/message";
import {useAttachmentHook} from "@/lib/hooks/useAttachmentHook";
import {getVideoEmbed, isSupportedVideoPlatform} from "@/lib/utils/urlThumbnailExtractionUtils";
import {RestrictedContentBox} from "@/features/chatroom/components/RestrictedContentBox";
import AttachmentBox from "@/features/chatroom/components/AttachmentBox";
import {useMediaOverlay} from "@/components/providers/MediaOverlayProvider";
import {Attachment} from "@/models/Attachment";
import {removeDuplicateStrings} from "@/lib/utils";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {EditHistoryButton} from "@/features/chatroom/components/EditHistoryButton";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {ReactionButton} from "@/features/chatroom/components/ReactionButton";

const MessageItem: React.FC<{
    message: Message,
    isOwn?: boolean,
    viewMode: "chat" | "search",
    handleMessageClick: (message: Message) => void,
    showChatRoomName?: boolean,
    showSenderName?: boolean,
    className?: string,
    showEditButton?: boolean,
    showReactions?: boolean,
    onRemoveAttachment?: (attachmentId: number) => Promise<void>,
    interactionsDisabled?: boolean,
}> = ({
          message,
          isOwn,
          viewMode,
          handleMessageClick,
          showChatRoomName = false,
          showSenderName = true,
          className,
          showEditButton = true,
          showReactions = false,
          onRemoveAttachment,
          interactionsDisabled = false,
      }) => {
    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const {openMediaOverlay, openExternalVideoOverlay} = useMediaOverlay();
    const {
        unblurredAttachments,
        isRestrictedForUser,
        handleUnblurAttachment,
        handleReblurAttachment,
        shouldBlurAttachment
    } = useAttachmentHook();

    const {formatMessageDate} = useFormatMessageDate();

    const videoUrls = removeDuplicateStrings(message.content ? extractUrls(message.content).filter(isSupportedVideoPlatform) : []);

    const handleAttachmentClick = (attachment: Attachment) => {
        openMediaOverlay(attachment);
    };

    const handleVideoPreviewClick = (url: string) => {
        const twitchParentDomain = typeof window !== "undefined" ? window.location.hostname : undefined;
        const videoEmbed = getVideoEmbed(url, twitchParentDomain);

        if (videoEmbed) {
            openExternalVideoOverlay({
                url,
                embedUrl: videoEmbed.url,
                platform: videoEmbed.platform,
                title: videoEmbed.title,
                allow: videoEmbed.allow,
            });
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleJumpToMessageClick = () => {
        if (isMobile) {
            dispatch(setActiveRightSidebar(null));
        }
        handleMessageClick(message);
    };

    const handleSearchItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null;

        if (target?.closest("a, button, input, textarea, select, [data-message-item-interaction='true']")) {
            return;
        }

        handleJumpToMessageClick();
    };

    const getAttachmentComponent = (attachment: Attachment) => {
        if (isRestrictedForUser(attachment)) {
            return <RestrictedContentBox/>;
        }

        const isBlurred = !unblurredAttachments.has(attachment.id);
        const shouldBlur = shouldBlurAttachment(attachment);

        return (
            <AttachmentBox
                onUnblur={interactionsDisabled ? undefined : () => handleUnblurAttachment(attachment.id)}
                onReblur={interactionsDisabled ? undefined : () => handleReblurAttachment(attachment.id)}
                canReblur={shouldBlur}
                blurred={isBlurred && shouldBlur}
                attachment={attachment}
                tags={attachment.tags.map(tag => tag.name)}
                onClick={interactionsDisabled ? undefined : () => handleAttachmentClick(attachment)}
                onDelete={interactionsDisabled ? undefined : (!message.deleted && message.content ? onRemoveAttachment : undefined)}
            />
        );
    };

    const getTextColor = (bgColor: string): "black" | "white" => {
        const hex = bgColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 128 ? "black" : "white";
    };

    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                if (interactionsDisabled) {
                    return <span key={index}>{part}</span>;
                }

                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const BannedUserBadge = () => (
        <span className="rounded px-1 font-medium text-[10px] bg-destructive text-destructive-foreground py-0.5">
                BANNED
            </span>
    );

    const DeletedBadge = () => (
        <span className="glass-pill rounded px-1 font-medium text-[10px] text-muted-foreground py-0.5">
                DELETED
            </span>
    );

    const ChatRoomBadge = () => (
        <span className="rounded bg-blue-100 font-medium text-blue-700 text-[10px] px-1.5 py-0.5">
                {message.chatRoomName}
            </span>
    );

    if (viewMode === "search") {
        return (
            <div
                onClick={handleSearchItemClick}
                className={clsx(
                    "glass-surface relative mb-3 cursor-pointer rounded-lg p-4 transition-colors duration-200 group min-w-0 max-w-full"
                )}
            >
                <div
                    className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleJumpToMessageClick();
                            }}
                            className="glass-pill rounded-full px-2 py-1 text-xs text-muted-foreground"
                        >
                            Jump
                        </span>
                </div>

                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-medium transition-colors text-foreground">
                                    {message.senderUsername}
                                </span>
                            {message.bannedUser && <BannedUserBadge/>}
                            {message.deleted && <DeletedBadge/>}
                            {showChatRoomName && <ChatRoomBadge/>}
                            <span className="text-xs text-muted-foreground">
                                    {formatMessageDate(message.createdAt)}
                                </span>
                        </div>

                        {message.attachments?.map((attachment: Attachment) => (
                            <div key={attachment.id} className="mb-2">
                                <div className="inline-flex max-w-full" data-message-item-interaction="true">
                                    {getAttachmentComponent(attachment)}
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-1">
                            {videoUrls.map((url, index) => (
                                <div key={index} className="w-fit max-w-full" data-message-item-interaction="true">
                                    <VideoLinkPreview
                                        url={url}
                                        onClick={interactionsDisabled ? undefined : () => handleVideoPreviewClick(url)}
                                        disabled={interactionsDisabled}
                                    />
                                </div>
                            ))}
                        </div>

                        {message.content && (
                            <div
                                className="text-sm text-foreground transition-colors whitespace-pre-wrap [word-break:break-word] min-w-0 max-w-full">
                                {linkifyText(message.content)}
                            </div>
                        )}

                        {showReactions && message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                    <ReactionButton
                                        key={index}
                                        reaction={reaction}
                                        message={message}
                                        isDisplayOnly={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "flex flex-col justify-items-center max-w-full min-w-0",
            isOwn ? "items-end" : "items-start pl-4"
        )}>
            {/* Header with sender name and badges */}
            {!isOwn && (showSenderName || message.bannedUser || message.deleted || showChatRoomName) && (
                <div
                    className="text-xs font-medium transition-colors text-muted-foreground flex items-center gap-1 mb-1">
                    {showSenderName && <span>{message.senderUsername}</span>}
                    {message.bannedUser && <BannedUserBadge/>}
                    {message.deleted && <DeletedBadge/>}
                    {showChatRoomName && <ChatRoomBadge/>}
                </div>
            )}

            {/* Header for own messages */}
            {isOwn && (message.deleted || showChatRoomName) && (
                <div className="flex items-center gap-1 mb-1">
                    {message.deleted && <DeletedBadge/>}
                    {showChatRoomName && <ChatRoomBadge/>}
                </div>
            )}

            {message.attachments?.map((attachment: Attachment) => (
                <div key={attachment.id} data-message-item-interaction="true">
                    {getAttachmentComponent(attachment)}
                </div>
            ))}

            <div className="flex flex-col gap-1">
                {videoUrls.map((url, index) => (
                    <div key={index} data-message-item-interaction="true">
                        <VideoLinkPreview
                            url={url}
                            onClick={interactionsDisabled ? undefined : () => handleVideoPreviewClick(url)}
                            disabled={interactionsDisabled}
                        />
                    </div>
                ))}
            </div>

            {message.content && (
                <div className={clsx("flex flex-col max-w-full min-w-0", isOwn ? "items-end" : "items-start")}>
                    <div
                        className={clsx(
                            "shadow rounded-lg px-3 py-2 break-words max-w-full min-w-0",
                            className,
                            message.deleted && "italic"
                        )}
                        style={{
                            backgroundColor: message.color,
                            color: getTextColor(message.color),
                        }}
                    >
                        <div className="text-sm font-normal whitespace-pre-wrap [word-break:break-word] min-w-0">
                            {linkifyText(message.content)}
                        </div>
                    </div>

                    {message.editedAt && showEditButton && !interactionsDisabled && (
                        <div className={clsx("mt-0.5", isOwn ? "self-end" : "self-start")}>
                            <EditHistoryButton message={message}/>
                        </div>
                    )}

                    {showReactions && message.reactions && message.reactions.length > 0 && (
                        <div
                            className={clsx("flex flex-wrap gap-1 mt-1 justify-start", isOwn ? "self-end justify-end" : "self-start justify-start")}>
                            {message.reactions.map((reaction, index) => (
                                <ReactionButton
                                    key={index}
                                    reaction={reaction}
                                    message={message}
                                    isDisplayOnly={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default MessageItem;
