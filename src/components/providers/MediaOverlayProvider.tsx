import React, {createContext, ReactNode, useContext, useState} from "react";
import {Attachment} from "@/models/Attachment";
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

export const useMediaOverlay = () => {
    const context = useContext(MediaOverlayContext);
    if (!context) {
        throw new Error("useMediaOverlay must be used within a MediaOverlayProvider");
    }
    return context;
};

export const MediaOverlayProvider = ({children}: { children: ReactNode }) => {

    const [media, setMedia] = useState<MediaOverlayItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<Required<MediaOverlayOptions>>(DEFAULT_MEDIA_OVERLAY_OPTIONS);

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
