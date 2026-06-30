import {AdFormatType} from "@ads/data/adFormats";

const DEFAULT_PREVIEW_URL = "http://localhost:3000/ad-preview";

export const AD_PREVIEW_BASE_URL =
    process.env.NEXT_PUBLIC_AD_PREVIEW_URL && process.env.NEXT_PUBLIC_AD_PREVIEW_URL.length > 0
        ? process.env.NEXT_PUBLIC_AD_PREVIEW_URL
        : DEFAULT_PREVIEW_URL;

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

function appendParam(params: URLSearchParams, key: string, value?: string | null) {
    const normalizedValue = value?.trim();

    if (normalizedValue) {
        params.set(key, normalizedValue);
    }
}

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

export function buildPreviewUrl(ad: PreviewAdData, baseUrl = AD_PREVIEW_BASE_URL) {
    const previewUrl = new URL(baseUrl);
    const params = new URLSearchParams();

    appendParam(params, "brandName", ad.brandName);
    appendParam(params, "content", ad.content);
    appendParam(params, "color", "#E0EEFF");
    appendParam(params, "attachmentUrl", resolvePreviewAttachmentUrl(ad.attachmentUrl));
    appendParam(params, "chatRoomName", ad.chatRoomName);
    appendParam(params, "senderCountryCode", ad.senderCountryCode);
    appendParam(params, "senderRole", ad.senderRole);
    appendParam(params, "attachmentName", ad.attachmentName);

    previewUrl.search = params.toString();
    return previewUrl.toString();
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
