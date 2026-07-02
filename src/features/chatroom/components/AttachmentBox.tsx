import {Download, Eye, EyeOff, Image, Loader2, Music, Trash2, Video, Zap} from "lucide-react";
import {Attachment} from "@/models/Attachment";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {MimeType} from "@/models/MimeType";
import React, {useState} from "react";
import {formatFileSize} from "@/lib/utils";
import {downloadAttachment} from "@/lib/utils/attachmentDownload";

interface AttachmentBoxProps {
    attachment: Attachment;
    onClick?: () => void;
    blurred?: boolean;
    onUnblur?: (id: number) => void;
    onReblur?: (id: number) => void;
    canReblur?: boolean;
    onDelete?: (id: number) => void;
    tags?: string[];
    showFileName?: boolean;
}

const unsupportedInlinePreviewMimeTypes = new Set<string>([MimeType.MOV, MimeType.MPEG, MimeType.AVI]);
const unsupportedInlinePreviewExtensions = new Set(["mov", "mpeg", "mpg", "avi"]);

const AttachmentBox: React.FC<AttachmentBoxProps> = ({
                                                         attachment,
                                                         onClick,
                                                         blurred = false,
                                                         onUnblur,
                                                         onReblur,
                                                         canReblur = false,
                                                         onDelete,
                                                         tags = [],
                                                         showFileName = true
                                                     }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const attachmentMime = String(attachment.mime);
    const attachmentExtension = attachment.name.split(".").pop()?.trim().toLowerCase();
    const isGifAttachment = attachmentMime === MimeType.GIF || attachmentMime === "GIF" || attachmentExtension === "gif";
    const isOggAttachment = attachmentMime === MimeType.OGG || attachmentMime === "OGG" || attachmentExtension === "ogg";
    const displayFileType = isOggAttachment ? AttachmentTypeEnum.AUDIO : attachment.attachmentType.fileType;
    const isUnsupportedInlinePreview =
        attachment.attachmentType.fileType === AttachmentTypeEnum.VIDEO &&
        !isGifAttachment &&
        (unsupportedInlinePreviewMimeTypes.has(attachmentMime) || Boolean(attachmentExtension && unsupportedInlinePreviewExtensions.has(attachmentExtension)));

    const getFileIcon = (fileType: AttachmentTypeEnum) => {
        if (fileType === AttachmentTypeEnum.IMAGE || (fileType === AttachmentTypeEnum.VIDEO && isGifAttachment)) {
            return <Image className="h-4 w-4"/>;
        }
        if (fileType === AttachmentTypeEnum.VIDEO) return <Video className="h-4 w-4"/>;
        if (fileType === AttachmentTypeEnum.AUDIO) return <Music className="h-4 w-4"/>;
        if (fileType === AttachmentTypeEnum.FLASH) return <Zap className="h-4 w-4"/>;
        return <Download className="h-4 w-4"/>;
    };

    const scalableMediaClasses = "w-36 h-36 object-contain rounded";
    const fixedBoxClasses = "w-36 h-36 flex items-center justify-center bg-gray-100 rounded";
    const isInteractive = blurred ? Boolean(onUnblur) : Boolean(onClick || onDelete || (canReblur && onReblur));
    const shouldShowFileNameOverlay = showFileName && (!isUnsupportedInlinePreview || blurred);

    const handleMainClick = (e: React.MouseEvent) => {
        if (blurred) {
            e.stopPropagation();
            e.preventDefault();
            if (onUnblur) onUnblur(attachment.id);
        } else {
            if (onClick) onClick();
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) onDelete(attachment.id);
    };

    const handleReblurClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onReblur) onReblur(attachment.id);
    };

    const getUnsupportedPreviewLabel = () => {
        if (attachmentMime === MimeType.MOV || attachmentExtension === "mov") return "MOV Video";
        if (attachmentMime === MimeType.MPEG || attachmentExtension === "mpeg" || attachmentExtension === "mpg") return "MPEG Video";
        if (attachmentMime === MimeType.AVI || attachmentExtension === "avi") return "AVI Video";
        return "Video File";
    };

    const renderThumbnail = () => {
        const blurredClass = blurred ? "filter blur-md" : "";

        if (displayFileType === AttachmentTypeEnum.IMAGE || isGifAttachment) {
            return (
                <div className="glass-surface relative w-36 h-36 rounded">
                    {!isImageLoaded && (
                        <div className="glass-surface absolute inset-0 flex items-center justify-center rounded">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                        </div>
                    )}
                    <img
                        src={attachment.url}
                        alt="Image"
                        className={`${scalableMediaClasses} ${blurredClass} ${!isImageLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
                        onLoad={() => setIsImageLoaded(true)}
                        loading="lazy"
                    />
                </div>
            );
        }

        if (displayFileType === AttachmentTypeEnum.VIDEO) {
            if (isUnsupportedInlinePreview) {
                return (
                    <div
                        className={`relative h-36 w-36 overflow-hidden rounded bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white ${blurredClass}`}
                    >
                        <div className="flex h-full flex-col justify-between p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="rounded-full bg-white/10 p-2 backdrop-blur-xs">
                                    <Video className="h-5 w-5 text-white"/>
                                </div>
                                <div
                                    className="rounded-full bg-white/10 p-2 cursor-pointer hover:bg-white/20 transition-colors group z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        void downloadAttachment(attachment);
                                    }}
                                    title="Download"
                                >
                                    <Download className="h-4 w-4 text-white/90 group-hover:text-white"/>
                                </div>
                            </div>

                            <div className="min-w-0 space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                    {getUnsupportedPreviewLabel()}
                                </p>
                                <p
                                    className="truncate text-sm font-medium text-white hover:underline cursor-pointer transition-colors hover:text-blue-300 z-10 relative"
                                    title={attachment.name}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        void downloadAttachment(attachment);
                                    }}
                                >
                                    {attachment.name}
                                </p>
                                <div className="flex items-center justify-between gap-2 text-[11px] text-white/75">
                                    <span className="truncate">{formatFileSize(attachment.size)}</span>
                                    <span
                                        className="shrink-0 font-medium text-white/85 hover:underline cursor-pointer transition-colors hover:text-blue-300 z-10 relative"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            void downloadAttachment(attachment);
                                        }}
                                    >
                                        Download
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="glass-surface relative rounded">
                    <video
                        src={attachment.url}
                        className={`${scalableMediaClasses} ${blurredClass}`}
                        preload="metadata"
                        muted
                        onLoadedMetadata={(e) => {
                            e.currentTarget.currentTime = 1;
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/85 shadow-lg backdrop-blur-xs">
                            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        if (attachment.attachmentType.fileType === AttachmentTypeEnum.FLASH) {
            return (
                <div className={fixedBoxClasses}>
                    <Zap className="h-10 w-10 text-yellow-500"/>
                </div>
            );
        }

        return (
            <div className={fixedBoxClasses}>
                {getFileIcon(displayFileType)}
            </div>
        );
    };

    const renderTags = () => {
        if (tags.length === 0) return null;
        return (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                {tags.map((tag, idx) => (
                    <div
                        key={idx}
                        className="px-2 py-1 rounded text-[10px] font-medium bg-black/70 text-white uppercase"
                    >
                        {tag}
                    </div>
                ))}
            </div>
        );
    };

    const content = blurred ? (
        <div className="relative pointer-events-none">
            {renderThumbnail()}
            <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded"
            >
                <Eye className="h-8 w-8 text-white drop-shadow-md opacity-90"/>
            </div>

            {renderTags()}

            {shouldShowFileNameOverlay && (
                <div className="rounded-b-md absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                    <p className="text-[10px] text-white truncate text-center px-1" title={attachment.name}>
                        {attachment.name}
                    </p>
                </div>
            )}
        </div>
    ) : (
        <div className="relative">
            {renderThumbnail()}

            {renderTags()}

            {!blurred && shouldShowFileNameOverlay && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 rounded-b">
                    <p className="text-[10px] text-white truncate text-center px-1" title={attachment.name}>
                        {attachment.name}
                    </p>
                </div>
            )}

            {!blurred && isHovered && canReblur && onReblur && (
                <button
                    onClick={handleReblurClick}
                    className="absolute top-2 left-2 p-2 rounded-full bg-slate-700/80 hover:bg-slate-800 text-white transition-colors shadow-lg"
                    aria-label="Blur attachment"
                >
                    <EyeOff className="h-4 w-4"/>
                </button>
            )}

            {!blurred && isHovered && onDelete && (
                <button
                    onClick={handleDeleteClick}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
                    aria-label="Delete attachment"
                >
                    <Trash2 className="h-4 w-4"/>
                </button>
            )}
        </div>
    );

    return (
        <div
            className={`glass-surface mb-2 rounded-lg transition-colors touch-manipulation ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={handleMainClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center space-x-2">
                {content}
            </div>
        </div>
    );
};

export default AttachmentBox;
