import {Attachment} from "@/models/Attachment";
import {MimeType} from "@/models/MimeType";

const attachmentExtensions: Partial<Record<MimeType, string>> = {
    [MimeType.MOV]: "mov",
    [MimeType.MPEG]: "mpeg",
    [MimeType.MP4]: "mp4",
    [MimeType.AVI]: "avi",
    [MimeType.WEBM]: "webm",
    [MimeType.OGG]: "ogg",
    [MimeType.MP3]: "mp3",
    [MimeType.PNG]: "png",
    [MimeType.JPEG]: "jpeg",
    [MimeType.JPG]: "jpg",
    [MimeType.GIF]: "gif",
    [MimeType.BMP]: "bmp",
    [MimeType.SVG]: "svg",
    [MimeType.WEBP]: "webp",
    [MimeType.SWF]: "swf",
};

const hasFileExtension = (fileName: string) => /\.[a-z0-9]+$/i.test(fileName);

const getAttachmentExtension = (mime: Attachment["mime"] | string, blobMime?: string) => {
    const resolvedMime = blobMime || String(mime || "");

    if (!resolvedMime) {
        return "bin";
    }

    return attachmentExtensions[resolvedMime as MimeType] || resolvedMime.split("/")[1] || "bin";
};

export const downloadAttachment = async (attachment: Pick<Attachment, "url" | "name" | "mime">) => {
    try {
        const response = await fetch(attachment.url, {mode: "cors"});

        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const extension = getAttachmentExtension(attachment.mime, blob.type);
        const baseFileName = attachment.name || "file";
        const fileName = hasFileExtension(baseFileName) ? baseFileName : `${baseFileName}.${extension}`;

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
        console.error("Download failed, opening in new tab:", error);
        window.open(attachment.url, "_blank", "noopener,noreferrer");
    }
};
