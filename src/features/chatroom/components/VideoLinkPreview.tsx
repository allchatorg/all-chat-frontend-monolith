import React from 'react';
import {getVideoThumbnail, isSupportedVideoPlatform} from "@/lib/utils/urlThumbnailExtractionUtils";

interface VideoLinkPreviewProps {
    url: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const VideoLinkPreview: React.FC<VideoLinkPreviewProps> = ({url, onClick, disabled = false}) => {
    const thumbnail = getVideoThumbnail(url);

    if (!thumbnail) return null;

    return (
        <div
            className={`glass-surface group relative rounded-lg transition-colors ${disabled ? "cursor-default" : "cursor-pointer"}`}
            onClick={disabled ? undefined : onClick}
        >
            <div className="overflow-hidden border rounded-lg min-h-36 max-h-36 aspect-video relative">
                <img
                    src={thumbnail.url}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain my-auto"
                    onError={(e) => {
                        // Hide preview if thumbnail fails to load
                        e.currentTarget.parentElement?.parentElement?.remove();
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/85 shadow-lg backdrop-blur-xs">
                        <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div
                    className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/70 text-white uppercase">
                    {thumbnail.platform}
                </div>
            </div>
        </div>
    );
};

/**
 * Extract URLs from message content
 */
export function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

export function useVideoLinks(content: string) {
    const urls = extractUrls(content);
    return urls.filter(isSupportedVideoPlatform);
}
