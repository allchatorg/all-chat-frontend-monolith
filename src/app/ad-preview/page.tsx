"use client";

import React from "react";
import {useSearchParams} from "next/navigation";
import {PreviewChatSection} from "@/features/chatroom/components/PreviewChatSection";
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
    MIME_BY_EXTENSION,
    PREVIEW_CURRENT_USER_ID,
    PREVIEW_CURRENT_USERNAME,
    previewTotalMessages,
} from "@/features/chatroom/utils/adPreview";
import {Attachment} from "@/models/Attachment";
import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {Message} from "@/models/message";
import {MimeType} from "@/models/MimeType";
import {Role} from "@/models/Role";
import {Tag} from "@/models/Tag";

interface SearchParamsLike {
    get(name: string): string | null;
}

interface PreviewBuildResult {
    advertMessage: Message;
    source: "defaults" | "flat_params" | "message_json";
    usedFallbackAttachment: boolean;
}

type JsonRecord = Record<string, unknown>;

const DEFAULT_COLOR = "#005CB9";
const DEFAULT_CONTENT = "Cool down with a crisp Pepsi and see how your sponsored message lands right inside the conversation.";
const DEFAULT_ATTACHMENT_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pepsi_2023.svg/1280px-Pepsi_2023.svg.png";

const FLAT_PREVIEW_KEYS = [
    "id",
    "messageId",
    "content",
    "color",
    "senderId",
    "senderUsername",
    "username",
    "brandName",
    "senderRole",
    "senderCountryCode",
    "chatRoomId",
    "chatRoomName",
    "roomName",
    "createdAt",
    "editedAt",
    "attachmentUrl",
    "imageUrl",
    "mediaUrl",
    "attachmentName",
    "attachmentMime",
    "attachmentType",
    "attachmentSize",
    "attachmentTags",
    "attachments",
    "deleted",
    "bannedUser",
];

function isJsonRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson<T>(value: string | null): T | null {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function getParamValue(params: SearchParamsLike, keys: string[]): string | null {
    for (const key of keys) {
        const value = params.get(key);
        if (value !== null) {
            return value;
        }
    }

    return null;
}

function hasAnyParam(params: SearchParamsLike, keys: string[]): boolean {
    return keys.some(key => params.get(key) !== null);
}

function getObjectValue(record: JsonRecord | null, key: string): unknown {
    return record?.[key];
}

function getNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function parseNumberLike(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBooleanLike(value: unknown): boolean | undefined {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") {
            return true;
        }
        if (normalized === "false") {
            return false;
        }
    }

    return undefined;
}

function parseDateLike(value: unknown): Date | undefined {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }

    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    const date = /^\d+$/.test(trimmed) ? new Date(Number(trimmed)) : new Date(trimmed);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseRoleLike(value: unknown): Role | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const upperValue = value.trim().toUpperCase();
    return (Object.values(Role).find(role => role === upperValue) as Role | undefined);
}

function normalizeCountryCode(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const normalized = value.trim().toUpperCase();
    return normalized.length >= 2 ? normalized.slice(0, 2) : undefined;
}

function normalizeHexColor(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const normalized = value.trim().replace(/^#/, "");
    if (/^[0-9A-Fa-f]{3}$/.test(normalized)) {
        return `#${normalized.split("").map(char => `${char}${char}`).join("").toUpperCase()}`;
    }

    if (/^[0-9A-Fa-f]{6}$/.test(normalized)) {
        return `#${normalized.toUpperCase()}`;
    }

    return undefined;
}

function isAbsoluteUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function normalizeMimeType(value: unknown, url?: string): MimeType {
    if (typeof value === "string") {
        const normalized = value.trim();
        const enumKey = normalized.toUpperCase() as keyof typeof MimeType;
        if (MimeType[enumKey]) {
            return MimeType[enumKey];
        }

        const lowerValue = normalized.toLowerCase();
        const matchedValue = Object.values(MimeType).find(mime => mime === lowerValue);
        if (matchedValue) {
            return matchedValue;
        }

        const extensionMatch = MIME_BY_EXTENSION[lowerValue.replace(/^\./, "")];
        if (extensionMatch) {
            return extensionMatch;
        }
    }

    return (url && inferMimeTypeFromUrl(url)) || MimeType.PNG;
}

function normalizeAttachmentType(value: unknown, mime: MimeType): AttachmentTypeEnum {
    if (typeof value === "string") {
        const normalized = value.trim().toUpperCase() as keyof typeof AttachmentTypeEnum;
        if (AttachmentTypeEnum[normalized]) {
            return AttachmentTypeEnum[normalized];
        }
    }

    if (isJsonRecord(value)) {
        const nestedType = value.fileType;
        if (typeof nestedType === "string") {
            const normalized = nestedType.trim().toUpperCase() as keyof typeof AttachmentTypeEnum;
            if (AttachmentTypeEnum[normalized]) {
                return AttachmentTypeEnum[normalized];
            }
        }
    }

    return inferAttachmentTypeFromMime(mime);
}

function normalizeTags(value: unknown): Tag[] {
    if (typeof value === "string") {
        return value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean)
            .map((tag, index) => ({
                id: index + 1,
                name: tag,
                restrictedToAdults: false,
            }));
    }

    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((tag, index) => {
        if (typeof tag === "string") {
            const normalized = tag.trim();
            if (!normalized) {
                return [];
            }

            return [{
                id: index + 1,
                name: normalized,
                restrictedToAdults: false,
            }];
        }

        if (!isJsonRecord(tag)) {
            return [];
        }

        const name = getNonEmptyString(tag.name);
        if (!name) {
            return [];
        }

        return [{
            id: parseNumberLike(tag.id) ?? index + 1,
            name,
            restrictedToAdults: tag.restrictedToAdults === true,
        }];
    });
}

function normalizeAttachment(raw: unknown, index: number, messageId: number): Attachment | null {
    const source = typeof raw === "string" ? {url: raw} : raw;
    if (!isJsonRecord(source)) {
        return null;
    }

    const url = getNonEmptyString(source.url) || getNonEmptyString(source.attachmentUrl);
    if (!url || !isAbsoluteUrl(url)) {
        return null;
    }

    const mime = normalizeMimeType(source.mime ?? source.mimeType, url);
    const fileType = normalizeAttachmentType(source.attachmentType ?? source.fileType, mime);

    return {
        id: parseNumberLike(source.id) ?? messageId * 10 + index + 1,
        messageId,
        url,
        name: getNonEmptyString(source.name) || deriveAttachmentName(url, mime, index),
        size: parseNumberLike(source.size) ?? 0,
        attachmentType: buildAttachmentType(fileType),
        mime,
        tags: normalizeTags(source.tags),
    };
}

function normalizeAttachments(raw: unknown, messageId: number): Attachment[] | null {
    if (raw === undefined || raw === null) {
        return null;
    }

    if (Array.isArray(raw)) {
        const normalized = raw
            .map((attachment, index) => normalizeAttachment(attachment, index, messageId))
            .filter((attachment): attachment is Attachment => attachment !== null);

        if (raw.length > 0 && normalized.length === 0) {
            return null;
        }

        return normalized;
    }

    const singleAttachment = normalizeAttachment(raw, 0, messageId);
    return singleAttachment ? [singleAttachment] : null;
}

function createDefaultAttachment(messageId: number): Attachment {
    const mime = MimeType.PNG;

    return {
        id: messageId * 10 + 1,
        messageId,
        url: DEFAULT_ATTACHMENT_URL,
        name: deriveAttachmentName(DEFAULT_ATTACHMENT_URL, mime, 0),
        size: 0,
        attachmentType: buildAttachmentType(AttachmentTypeEnum.IMAGE),
        mime,
        tags: [],
    };
}

function resolveAttachments(
    params: SearchParamsLike,
    messageRecord: JsonRecord | null,
    messageId: number,
    useDefaultAttachment: boolean,
): { attachments: Attachment[]; usedFallbackAttachment: boolean } {
    const rawAttachmentsParam = params.get("attachments");
    if (rawAttachmentsParam !== null) {
        const parsedAttachments = parseJson<unknown>(rawAttachmentsParam);
        const normalized = normalizeAttachments(parsedAttachments, messageId);

        return normalized
            ? {attachments: normalized, usedFallbackAttachment: false}
            : {attachments: [], usedFallbackAttachment: false};
    }

    const hasSingleAttachmentParams = hasAnyParam(params, [
        "attachmentUrl",
        "imageUrl",
        "mediaUrl",
        "attachmentName",
        "attachmentMime",
        "attachmentType",
        "attachmentSize",
        "attachmentTags",
    ]);

    if (hasSingleAttachmentParams) {
        const singleAttachment = normalizeAttachment({
            url: getParamValue(params, ["attachmentUrl", "imageUrl", "mediaUrl"]),
            name: getParamValue(params, ["attachmentName"]),
            mime: getParamValue(params, ["attachmentMime"]),
            attachmentType: getParamValue(params, ["attachmentType"]),
            size: getParamValue(params, ["attachmentSize"]),
            tags: getParamValue(params, ["attachmentTags"]),
        }, 0, messageId);

        return singleAttachment
            ? {attachments: [singleAttachment], usedFallbackAttachment: false}
            : {attachments: [], usedFallbackAttachment: false};
    }

    const messageAttachments = normalizeAttachments(getObjectValue(messageRecord, "attachments"), messageId);
    if (messageAttachments) {
        return {attachments: messageAttachments, usedFallbackAttachment: false};
    }

    if (useDefaultAttachment) {
        return {
            attachments: [createDefaultAttachment(messageId)],
            usedFallbackAttachment: true,
        };
    }

    return {
        attachments: [],
        usedFallbackAttachment: false,
    };
}

function buildPreviewData(params: SearchParamsLike): PreviewBuildResult {
    const messageRecord = (() => {
        const parsed = parseJson<unknown>(params.get("message"));
        return isJsonRecord(parsed) ? parsed : null;
    })();

    const source: PreviewBuildResult["source"] = messageRecord
        ? "message_json"
        : hasAnyParam(params, FLAT_PREVIEW_KEYS)
            ? "flat_params"
            : "defaults";

    const id =
        parseNumberLike(getParamValue(params, ["messageId", "id"])) ??
        parseNumberLike(getObjectValue(messageRecord, "id")) ??
        DEFAULT_MESSAGE_ID;

    const attachmentsResult = resolveAttachments(
        params,
        messageRecord,
        id,
        source === "defaults",
    );

    const directContent = getParamValue(params, ["content"]);
    const nestedContent = getObjectValue(messageRecord, "content");

    let content = directContent !== null
        ? directContent
        : typeof nestedContent === "string"
            ? nestedContent
            : source !== "defaults"
                ? ""
                : DEFAULT_CONTENT;

    if (!content.trim() && attachmentsResult.attachments.length === 0 && source === "defaults") {
        content = DEFAULT_CONTENT;
    }

    return {
        source,
        usedFallbackAttachment: attachmentsResult.usedFallbackAttachment,
        advertMessage: {
            id,
            content,
            createdAt:
                parseDateLike(getParamValue(params, ["createdAt"])) ??
                parseDateLike(getObjectValue(messageRecord, "createdAt")) ??
                new Date(),
            senderId:
                parseNumberLike(getParamValue(params, ["senderId"])) ??
                parseNumberLike(getObjectValue(messageRecord, "senderId")) ??
                DEFAULT_SENDER_ID,
            senderUsername:
                getNonEmptyString(getParamValue(params, ["senderUsername", "username", "brandName"])) ??
                getNonEmptyString(getObjectValue(messageRecord, "senderUsername")) ??
                DEFAULT_SENDER_USERNAME,
            senderRole:
                parseRoleLike(getParamValue(params, ["senderRole"])) ??
                parseRoleLike(getObjectValue(messageRecord, "senderRole")) ??
                Role.USER,
            senderCountryCode:
                normalizeCountryCode(getParamValue(params, ["senderCountryCode"])) ??
                normalizeCountryCode(getObjectValue(messageRecord, "senderCountryCode")) ??
                DEFAULT_COUNTRY_CODE,
            chatRoomId:
                parseNumberLike(getParamValue(params, ["chatRoomId"])) ??
                parseNumberLike(getObjectValue(messageRecord, "chatRoomId")) ??
                DEFAULT_CHAT_ROOM_ID,
            chatRoomName:
                getNonEmptyString(getParamValue(params, ["chatRoomName", "roomName"])) ??
                getNonEmptyString(getObjectValue(messageRecord, "chatRoomName")) ??
                DEFAULT_CHAT_ROOM_NAME,
            bannedUser:
                parseBooleanLike(getParamValue(params, ["bannedUser"])) ??
                parseBooleanLike(getObjectValue(messageRecord, "bannedUser")) ??
                false,
            editedAt:
                parseDateLike(getParamValue(params, ["editedAt"])) ??
                parseDateLike(getObjectValue(messageRecord, "editedAt")),
            color:
                normalizeHexColor(getParamValue(params, ["color"])) ??
                normalizeHexColor(getObjectValue(messageRecord, "color")) ??
                DEFAULT_COLOR,
            deleted:
                parseBooleanLike(getParamValue(params, ["deleted"])) ??
                parseBooleanLike(getObjectValue(messageRecord, "deleted")) ??
                false,
            attachments: attachmentsResult.attachments,
            reactions: [],
            advert: true,
        },
    };
}

export default function AdPreviewPage() {
    const searchParams = useSearchParams();

    // Honor an explicit `theme` param so the preview renders in the same theme as
    // the platform that opened it. We toggle the `dark` class on <html> directly
    // (rather than next-themes' setTheme) because this page is loaded same-origin
    // in an iframe and would otherwise overwrite the parent app's stored theme.
    const themeParam = searchParams.get("theme");
    React.useEffect(() => {
        if (themeParam === "dark") {
            document.documentElement.classList.add("dark");
        } else if (themeParam === "light") {
            document.documentElement.classList.remove("dark");
        }
    }, [themeParam]);

    const preview = buildPreviewData(searchParams);
    const previewMessages = createConversation(preview.advertMessage);
    const totalMessages = previewTotalMessages(preview.advertMessage.chatRoomId);

    return (
        <main className="h-screen w-full bg-primary-blue-bg">
            <PreviewChatSection
                chatRoomName={preview.advertMessage.chatRoomName}
                totalMessages={totalMessages}
                messages={previewMessages}
                currentUserId={PREVIEW_CURRENT_USER_ID}
                currentUsername={PREVIEW_CURRENT_USERNAME}
            />
        </main>
    );
}
