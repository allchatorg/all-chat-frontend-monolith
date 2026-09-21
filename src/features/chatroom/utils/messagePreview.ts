import {chatPreviewText} from './messageMarkers';
import {getStickerLabel} from '@/features/stickers/catalog';

interface PreviewMessage {
    content?: string | null;
    stickerId?: string | null;
    deleted?: boolean;
    attachments?: readonly unknown[];
}

/** Compact, readable content for conversation lists and reply drafts. */
export function getMessagePreview(message?: PreviewMessage | null, emptyText = ''): string {
    if (!message) return emptyText;
    if (message.deleted || message.content === null) return 'Message deleted';
    if (message.stickerId) return getStickerLabel(message.stickerId);
    const content = chatPreviewText(message.content?.trim() || '');
    if (content) return content;
    if (message.attachments?.length) return 'Attachment';
    return emptyText;
}
