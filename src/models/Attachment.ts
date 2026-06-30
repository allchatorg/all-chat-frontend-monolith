import {Tag} from "./Tag";
import {AttachmentType} from "@/models/AttachmentType";
import {MimeType} from "@/models/MimeType";

export interface Attachment {
    id: number;
    messageId: number;
    url: string;
    name: string;
    size: number;
    attachmentType: AttachmentType;
    mime: MimeType;
    tags: Tag[];
}