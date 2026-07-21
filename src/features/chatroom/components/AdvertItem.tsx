import clsx from "clsx";
import {Message} from "@/models/message";
import {useAttachmentHook} from "@/lib/hooks/useAttachmentHook";
import {RestrictedContentBox} from "@/features/chatroom/components/RestrictedContentBox";
import AttachmentBox from "@/features/chatroom/components/AttachmentBox";
import {useMediaOverlay} from "@/components/providers/MediaOverlayProvider";
import {Attachment} from "@/models/Attachment";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {markAdClicked} from "@/redux/ads/adsSlice";
import {selectClickedAdIds} from "@/redux/ads/adsSelectors";
import {registerAdClick} from "@/api/ads/adsAPI";

const AdvertMessageItem: React.FC<{
    message: Message;
    className?: string;
    interactionsDisabled?: boolean;
    allowAttachmentPreview?: boolean;
}> = ({message, className, interactionsDisabled = false, allowAttachmentPreview = false}) => {
    const {openMediaOverlay} = useMediaOverlay();
    const dispatch = useDispatch<AppDispatch>();
    const clickedAdIds = useSelector(selectClickedAdIds);
    const {
        unblurredAttachments,
        isRestrictedForUser,
        handleUnblurAttachment,
        shouldBlurAttachment
    } = useAttachmentHook();

    const handleAttachmentClick = (attachment: Attachment) => {
        // Opening a photo/video ad counts as a click-through; track it once per
        // served ad (fire-and-forget, never blocks the overlay).
        if (message.advert && !interactionsDisabled && !clickedAdIds.includes(message.id)) {
            dispatch(markAdClicked(message.id));
            registerAdClick(message.id);
        }
        openMediaOverlay(attachment, {
            showDownloadButton: false,
            showFileSize: false,
        });
    };

    const getAttachmentComponent = (attachment: Attachment) => {
        if (isRestrictedForUser(attachment)) {
            return <RestrictedContentBox/>;
        }

        const isBlurred = !unblurredAttachments.has(attachment.id);
        const shouldBlur = shouldBlurAttachment(attachment);
        const canOpenAttachment = !interactionsDisabled || allowAttachmentPreview;

        return (
            <AttachmentBox
                onUnblur={interactionsDisabled ? undefined : () => handleUnblurAttachment(attachment.id)}
                blurred={isBlurred && shouldBlur}
                attachment={attachment}
                tags={attachment.tags.map(tag => tag.name)}
                onClick={canOpenAttachment ? () => handleAttachmentClick(attachment) : undefined}
                onDelete={undefined}
                showFileName={false}
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
                    return <span key={index} className="wrap-anywhere">{part}</span>;
                }

                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 wrap-anywhere"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className={clsx("flex flex-col justify-items-center items-start pl-4 max-w-full min-w-0")}>
            {message.attachments?.map((attachment: Attachment) => (
                <div key={attachment.id} className="max-w-full min-w-0">
                    {getAttachmentComponent(attachment)}
                </div>
            ))}

            {message.content && (
                <div className="flex flex-col items-start max-w-full min-w-0">
                    <div
                        className={clsx(
                            "shadow-sm rounded-lg px-3 py-2 wrap-break-word max-w-full min-w-0",
                            className
                        )}
                        style={{
                            backgroundColor: message.color,
                            color: getTextColor(message.color),
                        }}
                    >
                        <div
                            className="text-sm font-normal whitespace-pre-wrap [word-break:break-word] wrap-anywhere min-w-0 max-w-full">
                            {linkifyText(message.content)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertMessageItem;
