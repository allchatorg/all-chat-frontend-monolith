import React, {useEffect, useRef} from "react";
import {Download, FileVideo, Music, X} from "lucide-react";
import {Attachment} from "@/models/Attachment";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import RufflePlayer from "@/features/chatroom/components/RufflePlayer";
import {MimeType} from "@/models/MimeType";
import {useDispatch, useSelector} from "react-redux";
import {setMediaPlayerMuted} from "@/redux/settings/settingsSlice";
import {AppDispatch, RootState} from "@/redux/store";
import ZoomableImage from "@/features/chatroom/components/ZoomableImage";
import {type VideoPlatform} from "@/lib/utils/urlThumbnailExtractionUtils";

interface AttachmentOverlayItem {
    kind: "attachment";
    attachment: Attachment;
}

export interface ExternalVideoOverlayItem {
    kind: "externalVideo";
    url: string;
    embedUrl: string;
    platform: VideoPlatform;
    title?: string;
    allow?: string;
}

export type MediaOverlayItem = AttachmentOverlayItem | ExternalVideoOverlayItem;

interface MediaOverlayProps {
    media: MediaOverlayItem | null;
    isOpen: boolean;
    onClose: () => void;
    showDownloadButton?: boolean;
    showFileSize?: boolean;
}

const MediaOverlay: React.FC<MediaOverlayProps> = ({
                                                       media,
                                                       isOpen,
                                                       onClose,
                                                       showDownloadButton = true,
                                                       showFileSize = true,
                                                   }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isMuted = useSelector((state: RootState) => state.settings.mediaPlayerMuted);
    const overlayRef = useRef<HTMLDivElement>(null);
    const externalVideoPlayerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const isExternalVideo = media?.kind === "externalVideo";

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;

            e.preventDefault();
            onClose();
        };

        if (isOpen) window.addEventListener("keydown", handleEscape, true);
        return () => window.removeEventListener("keydown", handleEscape, true);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const animationFrame = window.requestAnimationFrame(() => {
            overlayRef.current?.focus({preventScroll: true});
        });

        return () => window.cancelAnimationFrame(animationFrame);
    }, [isOpen, isExternalVideo]);

    useEffect(() => {
        if (!isOpen || !isExternalVideo) return;

        const restoreOverlayFocus = () => {
            window.setTimeout(() => {
                const activeElement = document.activeElement;

                if (
                    activeElement instanceof HTMLIFrameElement &&
                    externalVideoPlayerRef.current?.contains(activeElement)
                ) {
                    activeElement.blur();
                    overlayRef.current?.focus({preventScroll: true});
                }
            }, 0);
        };

        window.addEventListener("blur", restoreOverlayFocus);
        return () => window.removeEventListener("blur", restoreOverlayFocus);
    }, [isOpen, isExternalVideo]);

    if (!isOpen || !media) return null;

    const attachment = media.kind === "attachment" ? media.attachment : null;
    const fileType = attachment?.attachmentType.fileType ?? AttachmentTypeEnum.UNKNOWN;
    const attachmentExtension = attachment?.name.split(".").pop()?.trim().toLowerCase();

    const attachmentMime = attachment ? String(attachment.mime) : "";
    const isOggAttachment = attachmentMime === MimeType.OGG || attachmentMime === "OGG" || attachmentExtension === "ogg";
    const isGifAttachment = attachmentMime === MimeType.GIF || attachmentMime === "GIF" || attachmentExtension === "gif";
    const effectiveFileType = isOggAttachment ? AttachmentTypeEnum.AUDIO : fileType;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        // Prevent closing if we clicked directly on the media itself
        if (target.tagName === "IMG" || target.tagName === "VIDEO" || target.tagName === "AUDIO" || target.tagName === "IFRAME") {
            return;
        }

        // Prevent closing if we clicked on controls, Ruffle, or an external video player.
        if (target.closest("button") || target.closest("a") || target.closest(".ruffle-player") || target.closest(".external-video-player")) {
            return;
        }

        onClose();
    };

    const handleDownload = async () => {
        if (!attachment) return;

        try {
            const response = await fetch(attachment.url, {mode: "cors"});
            if (!response.ok)
                return;

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            // Ensure filename has an extension
            const extension = blob.type.split("/")[1] || "bin";
            link.download = attachment.name || `file.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error("Download failed, opening in new tab:", err);
            // fallback
            window.open(attachment.url, "_blank", "noopener,noreferrer");
        }
    };

    const handleVolumeChange = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement, Event>) => {
        const target = event.currentTarget;
        if (target.muted !== isMuted) {
            dispatch(setMediaPlayerMuted(target.muted));
        }
    };

    const renderMediaContent = () => {
        if (media.kind === "externalVideo") {
            return (
                <div
                    ref={externalVideoPlayerRef}
                    className="external-video-player flex aspect-video w-full max-w-5xl items-center justify-center overflow-hidden rounded-lg bg-black shadow-2xl">
                    <iframe
                        key={media.embedUrl}
                        src={media.embedUrl}
                        title={media.title ?? `${media.platform} video player`}
                        className="h-full w-full border-0"
                        allow={media.allow ?? "autoplay; fullscreen; encrypted-media; picture-in-picture"}
                        allowFullScreen
                    />
                </div>
            );
        }

        if (!attachment) {
            return null;
        }

        switch (effectiveFileType) {
            case AttachmentTypeEnum.IMAGE:
                return <ZoomableImage key={attachment.url} src={attachment.url} onClose={onClose}/>;

            case AttachmentTypeEnum.VIDEO:
                if (isGifAttachment) {
                    return <ZoomableImage key={attachment.url} src={attachment.url} onClose={onClose}/>;
                }

                if (
                    attachmentMime === MimeType.AVI ||
                    attachmentMime === MimeType.MPEG ||
                    attachmentMime === MimeType.MOV ||
                    attachmentExtension === "avi" ||
                    attachmentExtension === "mpeg" ||
                    attachmentExtension === "mov"
                ) {
                    return (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="rounded-full bg-white/10 p-6 media-element">
                                <FileVideo className="h-24 w-24 text-white"/>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-white mb-2">Unsupported Video Format</h3>
                                <p className="text-white/70 max-w-md text-sm">
                                    This video format ({attachmentExtension?.toUpperCase()}) cannot be played directly
                                    within the app.
                                    Please download the file to view its contents.
                                </p>
                            </div>
                            {showDownloadButton && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDownload();
                                    }}
                                    className="mt-4 flex items-center gap-2 rounded-md bg-white/20 hover:bg-white/30 px-4 py-2 text-white transition-colors"
                                >
                                    <Download className="h-4 w-4"/>
                                    Download File
                                </button>
                            )}
                        </div>
                    );
                }

                return (
                    <div
                        className="flex items-center justify-center w-full h-[100%] min-h-0 min-w-0 max-h-full overflow-hidden">
                        <video
                            ref={videoRef}
                            src={attachment.url}
                            className="max-h-[90%] max-w-[90%] object-contain media-element"
                            controls
                            muted={isMuted}
                            onVolumeChange={handleVolumeChange}
                        />
                    </div>
                );

            case AttachmentTypeEnum.AUDIO:
                return (
                    <div className="flex flex-col items-center p-8 space-y-4 media-element">
                        <Music className="h-24 w-24 text-muted-foreground"/>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Audio File</h3>
                            <audio ref={audioRef}
                                   src={attachment.url}
                                   controls className="mt-4"
                                   muted={isMuted}
                                   onVolumeChange={handleVolumeChange}/>
                        </div>
                    </div>
                );

            case AttachmentTypeEnum.FLASH:
                return (
                    <div
                        className="w-[90%] h-[90%] flex items-center justify-center min-h-0 min-w-0 max-h-[90%] max-w-[90%] m-auto">
                        <div className="ruffle-player w-full h-full flex items-center justify-center">
                            <RufflePlayer swfUrl={attachment.url}/>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center text-white">
                        <p className="text-lg font-semibold">Unsupported File Type</p>
                    </div>
                );
        }
    };

    return (
        <div ref={overlayRef}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4 sm:p-8"
             style={{
                 height: "100dvh",
                 width: "100vw"
             }}
             tabIndex={-1}
             onClick={handleBackdropClick}>

            <div
                className="relative flex max-h-[90%] w-full h-full min-h-0 min-w-0 items-center justify-center flex-1 pb-[5dvh] sm:pb-0">
                {renderMediaContent()}
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 rounded-full bg-black bg-opacity-50 p-2 text-white transition-colors hover:bg-opacity-70"
                aria-label="Close"
            >
                <X className="h-6 w-6"/>
            </button>

            {showDownloadButton && media.kind === "attachment" && (
                <button
                    onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDownload();
                    }}
                    className="absolute top-4 right-16 z-50 rounded-full bg-black bg-opacity-50 p-2 text-white transition-colors hover:bg-opacity-70"
                    aria-label="Download"
                >
                    <Download className="h-6 w-6"/>
                </button>
            )}

            {media.kind === "attachment" ? (
                <div className="absolute top-4 left-4 z-50 rounded-lg bg-black bg-opacity-50 px-3 py-2 text-white">
                    <p className="text-sm font-medium truncate max-w-[200px]"
                       title={media.attachment.name}>{media.attachment.name}</p>
                    {showFileSize && (
                        <p className="text-xs opacity-70">{(media.attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                    )}
                </div>
            ) : (
                <div className="absolute top-4 left-4 z-50 rounded-lg bg-black bg-opacity-50 px-3 py-2 text-white">
                    <p className="text-sm font-medium truncate max-w-[200px]" title={media.url}>
                        {media.title ?? media.platform}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MediaOverlay;
