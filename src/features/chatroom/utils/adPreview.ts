import {AttachmentType} from "@/models/AttachmentType";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {Message} from "@/models/message";
import {MimeType} from "@/models/MimeType";
import {Role} from "@/models/Role";

export const DEFAULT_MESSAGE_ID = 9001;
export const DEFAULT_CHAT_ROOM_ID = 77;
export const DEFAULT_CHAT_ROOM_NAME = "launch-lounge";
export const DEFAULT_SENDER_USERNAME = "Pepsi";
export const DEFAULT_SENDER_ID = 7001;
export const DEFAULT_COUNTRY_CODE = "US";
export const PREVIEW_CURRENT_USER_ID = 4242;
export const PREVIEW_CURRENT_USERNAME = "Preview User";

const IMAGE_MIME_TYPES: MimeType[] = [
    MimeType.PNG,
    MimeType.JPEG,
    MimeType.JPG,
    MimeType.GIF,
    MimeType.BMP,
    MimeType.SVG,
    MimeType.WEBP,
];

const VIDEO_MIME_TYPES: MimeType[] = [
    MimeType.MP4,
    MimeType.AVI,
    MimeType.MOV,
    MimeType.WEBM,
    MimeType.MPEG,
];

const AUDIO_MIME_TYPES: MimeType[] = [MimeType.MP3, MimeType.OGG];

export const MIME_BY_EXTENSION: Record<string, MimeType> = {
    png: MimeType.PNG,
    jpeg: MimeType.JPEG,
    jpg: MimeType.JPG,
    gif: MimeType.GIF,
    bmp: MimeType.BMP,
    svg: MimeType.SVG,
    webp: MimeType.WEBP,
    mp4: MimeType.MP4,
    avi: MimeType.AVI,
    mov: MimeType.MOV,
    webm: MimeType.WEBM,
    mpeg: MimeType.MPEG,
    mpg: MimeType.MPEG,
    ogg: MimeType.OGG,
    mp3: MimeType.MP3,
    swf: MimeType.SWF,
};

export function inferMimeTypeFromUrl(url: string): MimeType | undefined {
    try {
        const pathname = new URL(url).pathname;
        const extension = pathname.split(".").pop()?.toLowerCase();
        return extension ? MIME_BY_EXTENSION[extension] : undefined;
    } catch {
        return undefined;
    }
}

export function inferAttachmentTypeFromMime(mime: MimeType): AttachmentTypeEnum {
    if (IMAGE_MIME_TYPES.includes(mime)) {
        return AttachmentTypeEnum.IMAGE;
    }

    if (VIDEO_MIME_TYPES.includes(mime)) {
        return AttachmentTypeEnum.VIDEO;
    }

    if (AUDIO_MIME_TYPES.includes(mime)) {
        return AttachmentTypeEnum.AUDIO;
    }

    if (mime === MimeType.SWF) {
        return AttachmentTypeEnum.FLASH;
    }

    return AttachmentTypeEnum.UNKNOWN;
}

export function buildAttachmentType(fileType: AttachmentTypeEnum): AttachmentType {
    const acceptedMimeTypes =
        fileType === AttachmentTypeEnum.IMAGE ? IMAGE_MIME_TYPES :
            fileType === AttachmentTypeEnum.VIDEO ? VIDEO_MIME_TYPES :
                fileType === AttachmentTypeEnum.AUDIO ? AUDIO_MIME_TYPES :
                    fileType === AttachmentTypeEnum.FLASH ? [MimeType.SWF] :
                        [];

    return {
        id: fileType.length,
        fileType,
        acceptedMimeTypes,
        maxFileSizeBytes: 25 * 1024 * 1024,
        availableTags: [],
    };
}

export function deriveAttachmentName(url: string, mime: MimeType, index: number): string {
    try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split("/").pop();
        if (filename) {
            return decodeURIComponent(filename);
        }
    } catch {
    }

    const extension = Object.entries(MIME_BY_EXTENSION)
        .find(([, value]) => value === mime)?.[0] || "file";

    return `preview-asset-${index + 1}.${extension}`;
}

export function previewTotalMessages(chatRoomId: number): number {
    return 125000 + chatRoomId;
}

function createPreviewMessage({
                                  id,
                                  content,
                                  createdAt,
                                  senderId,
                                  senderUsername,
                                  senderRole,
                                  senderCountryCode,
                                  color,
                                  chatRoomId,
                                  chatRoomName,
                                  editedAt,
                              }: {
    id: number;
    content: string;
    createdAt: Date;
    senderId: number;
    senderUsername: string;
    senderRole: Role;
    senderCountryCode: string;
    color: string;
    chatRoomId: number;
    chatRoomName: string;
    editedAt?: Date;
}): Message {
    return {
        id,
        content,
        createdAt,
        senderId,
        senderUsername,
        senderRole,
        senderCountryCode,
        chatRoomId,
        chatRoomName,
        bannedUser: false,
        editedAt,
        color,
        deleted: false,
        attachments: [],
        reactions: [],
    };
}

export function createConversation(advertMessage: Message): Message[] {
    const adTimestamp = advertMessage.createdAt.getTime();

    return [
        createPreviewMessage({
            id: advertMessage.id - 2,
            senderId: 184,
            senderUsername: "Nina",
            senderRole: Role.USER,
            senderCountryCode: "NL",
            chatRoomId: advertMessage.chatRoomId,
            chatRoomName: advertMessage.chatRoomName,
            createdAt: new Date(adTimestamp - 6 * 60 * 1000),
            content: "heyy have you heard that you can also advertise on allchat?",
            color: "#F8FAFC",
        }),
        createPreviewMessage({
            id: advertMessage.id - 1,
            senderId: 185,
            senderUsername: "Rico",
            senderRole: Role.USER,
            senderCountryCode: "ES",
            chatRoomId: advertMessage.chatRoomId,
            chatRoomName: advertMessage.chatRoomName,
            createdAt: new Date(adTimestamp - 3 * 60 * 1000),
            content: "yeah! i saw some ads earlier today, looks super cool!",
            color: "#EEF2FF",
        }),
        advertMessage,
    ];
}
