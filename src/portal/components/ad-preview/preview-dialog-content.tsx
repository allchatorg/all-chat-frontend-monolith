"use client";

import React from "react";
import {PreviewChatSection} from "@/features/chatroom/components/PreviewChatSection";
import {
    PREVIEW_CURRENT_USER_ID,
    PREVIEW_CURRENT_USERNAME,
    previewTotalMessages,
} from "@/features/chatroom/utils/adPreview";
import {buildPreviewMessages, PreviewAdData} from "@ads/components/ad-preview/preview-utils";

interface PreviewDialogContentProps {
    ad: PreviewAdData;
    title: string;
}

export function PreviewDialogContent({ad, title}: PreviewDialogContentProps) {
    const messages = React.useMemo(() => buildPreviewMessages(ad), [ad]);
    const advertMessage = messages[messages.length - 1];

    return (
        <div className="flex flex-col bg-card h-full">
            <div className="border-b border-border px-5 py-2 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Preview type
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    This is how your ad will look on allchat.org.
                </p>
            </div>

            <div className="min-h-0 flex-1 bg-background">
                <PreviewChatSection
                    chatRoomName={advertMessage.chatRoomName}
                    totalMessages={previewTotalMessages(advertMessage.chatRoomId)}
                    messages={messages}
                    currentUserId={PREVIEW_CURRENT_USER_ID}
                    currentUsername={PREVIEW_CURRENT_USERNAME}
                />
            </div>
        </div>
    );
}
