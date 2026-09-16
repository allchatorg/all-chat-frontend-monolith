import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {Attachment} from "@/models/Attachment";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {MimeType} from "@/models/MimeType";
import {useRadio} from "@/components/providers/RadioProvider";
import MediaOverlay, {
    type ExternalVideoOverlayItem,
    type MediaOverlayItem
} from "@/features/chatroom/components/MediaOverlay";


export interface MediaOverlayOptions {
    showDownloadButton?: boolean;
    showFileSize?: boolean;
}

interface MediaOverlayContextType {
    openMediaOverlay: (attachment: Attachment, options?: MediaOverlayOptions) => void;
    openExternalVideoOverlay: (video: Omit<ExternalVideoOverlayItem, "kind">, options?: MediaOverlayOptions) => void;
    closeMediaOverlay: () => void;
}

const MediaOverlayContext = createContext<MediaOverlayContextType | undefined>(undefined);
const DEFAULT_MEDIA_OVERLAY_OPTIONS: Required<MediaOverlayOptions> = {
    showDownloadButton: true,
    showFileSize: true,
};

const hasOverlayAudio = (media: MediaOverlayItem | null): boolean => {
    if (!media) return false;
    if (media.kind === "externalVideo") return true;

    const {attachment} = media;
    const mime = String(attachment.mime);
    const extension = attachment.name.split(".").pop()?.trim().toLowerCase();
    // Keep the OGG and GIF overrides aligned with MediaOverlay's renderer.
    const isOgg = mime === MimeType.OGG || mime === "OGG" || extension === "ogg";
    const isGif = mime === MimeType.GIF || mime === "GIF" || extension === "gif";
    const fileType = isOgg ? AttachmentTypeEnum.AUDIO : attachment.attachmentType.fileType;

    return fileType === AttachmentTypeEnum.AUDIO
        || fileType === AttachmentTypeEnum.FLASH
        || (fileType === AttachmentTypeEnum.VIDEO && !isGif);
};

export const useMediaOverlay = () => {
    const context = useContext(MediaOverlayContext);
    if (!context) {
        throw new Error("useMediaOverlay must be used within a MediaOverlayProvider");
    }
    return context;
};

export const MediaOverlayProvider = ({children}: { children: ReactNode }) => {
    const {setMediaSuspended} = useRadio();
    const [media, setMedia] = useState<MediaOverlayItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<Required<MediaOverlayOptions>>(DEFAULT_MEDIA_OVERLAY_OPTIONS);
    const suspendsRadio = isOpen && hasOverlayAudio(media);

    useEffect(() => {
        setMediaSuspended(suspendsRadio);
    }, [suspendsRadio, setMediaSuspended]);

    // Separate cleanup avoids briefly resuming radio when one audible overlay replaces another.
    useEffect(() => () => setMediaSuspended(false), [setMediaSuspended]);

    const openMediaOverlay = (att: Attachment, nextOptions?: MediaOverlayOptions) => {
        setMedia({kind: "attachment", attachment: att});
        setOptions({
            ...DEFAULT_MEDIA_OVERLAY_OPTIONS,
            ...nextOptions,
        });
        setIsOpen(true);
    };

    const openExternalVideoOverlay = (video: Omit<ExternalVideoOverlayItem, "kind">, nextOptions?: MediaOverlayOptions) => {
        setMedia({kind: "externalVideo", ...video});
        setOptions({
            ...DEFAULT_MEDIA_OVERLAY_OPTIONS,
            showDownloadButton: false,
            showFileSize: false,
            ...nextOptions,
        });
        setIsOpen(true);
    };

    const closeMediaOverlay = () => {
        setMedia(null);
        setIsOpen(false);
        setOptions(DEFAULT_MEDIA_OVERLAY_OPTIONS);
    };

    return (
        <MediaOverlayContext.Provider value={{openMediaOverlay, openExternalVideoOverlay, closeMediaOverlay}}>
            {children}
            <MediaOverlay
                media={media}
                isOpen={isOpen}
                onClose={closeMediaOverlay}
                showDownloadButton={options.showDownloadButton}
                showFileSize={options.showFileSize}
            />
        </MediaOverlayContext.Provider>
    );
};
