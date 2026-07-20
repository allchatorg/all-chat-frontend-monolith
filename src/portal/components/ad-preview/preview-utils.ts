import {AdFormatType} from "@ads/data/adFormats";
import {
    buildAttachmentType,
    createConversation,
    DEFAULT_CHAT_ROOM_ID,
    DEFAULT_CHAT_ROOM_NAME,
    DEFAULT_COUNTRY_CODE,
    DEFAULT_MESSAGE_ID,
    DEFAULT_SENDER_ID,
    DEFAULT_SENDER_USERNAME,
    deriveAttachmentName,
    inferAttachmentTypeFromMime,
    inferMimeTypeFromUrl,
} from "@/features/chatroom/utils/adPreview";
import {Attachment} from "@/models/Attachment";
import {Message} from "@/models/message";
import {MimeType} from "@/models/MimeType";
import {Role} from "@/models/Role";

// Sponsored messages always render on the light-blue advert background,
// matching what the live chat uses (previously hardcoded in the preview URL).
const PREVIEW_AD_COLOR = "#E0EEFF";

export type PreviewAdData = {
    content?: string | null;
    brandName?: string | null;
    color?: string | null;
    attachmentUrl?: string | null;
    chatRoomName?: string | null;
    senderCountryCode?: string | null;
    senderRole?: "USER" | "MODERATOR" | "ADMIN" | null;
    attachmentName?: string | null;
};

export function resolvePreviewAttachmentUrl(value?: string | null) {
    const normalizedValue = value?.trim();

    if (!normalizedValue || normalizedValue.startsWith("blob:")) {
        return null;
    }

    try {
        const absoluteUrl = new URL(normalizedValue);

        if (absoluteUrl.protocol === "http:" || absoluteUrl.protocol === "https:") {
            return absoluteUrl.toString();
        }

        return null;
    } catch {
        if (normalizedValue.startsWith("/") && typeof window !== "undefined") {
            return new URL(normalizedValue, window.location.origin).toString();
        }

        return null;
    }
}

export function buildPreviewMessages(ad: PreviewAdData): Message[] {
    const attachmentUrl = resolvePreviewAttachmentUrl(ad.attachmentUrl);
    const attachments: Attachment[] = [];

    if (attachmentUrl) {
        const mime = inferMimeTypeFromUrl(attachmentUrl) ?? MimeType.PNG;
        attachments.push({
            id: DEFAULT_MESSAGE_ID * 10 + 1,
            messageId: DEFAULT_MESSAGE_ID,
            url: attachmentUrl,
            name: ad.attachmentName?.trim() || deriveAttachmentName(attachmentUrl, mime, 0),
            size: 0,
            attachmentType: buildAttachmentType(inferAttachmentTypeFromMime(mime)),
            mime,
            tags: [],
        });
    }

    const countryCode = ad.senderCountryCode?.trim().toUpperCase();

    const advertMessage: Message = {
        id: DEFAULT_MESSAGE_ID,
        content: ad.content?.trim() ?? "",
        createdAt: new Date(),
        senderId: DEFAULT_SENDER_ID,
        senderUsername: ad.brandName?.trim() || DEFAULT_SENDER_USERNAME,
        senderRole: ad.senderRole ? Role[ad.senderRole] : Role.USER,
        senderCountryCode: countryCode && countryCode.length >= 2
            ? countryCode.slice(0, 2)
            : DEFAULT_COUNTRY_CODE,
        chatRoomId: DEFAULT_CHAT_ROOM_ID,
        chatRoomName: ad.chatRoomName?.trim() || DEFAULT_CHAT_ROOM_NAME,
        bannedUser: false,
        color: PREVIEW_AD_COLOR,
        deleted: false,
        attachments,
        reactions: [],
        advert: true,
    };

    return createConversation(advertMessage);
}

export function canPreviewAd(formatType: AdFormatType, ad: PreviewAdData) {
    const hasBrandName = Boolean(ad.brandName?.trim());
    const hasContent = Boolean(ad.content?.trim());
    const hasAttachment = Boolean(resolvePreviewAttachmentUrl(ad.attachmentUrl));

    if (formatType === AdFormatType.TEXT) {
        return hasBrandName && hasContent;
    }

    return hasBrandName && hasAttachment;
}
