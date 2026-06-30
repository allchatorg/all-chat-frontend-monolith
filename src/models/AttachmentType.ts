import {AttachmentTypeEnum} from "@/models/AttachmentTypeEnum";
import {MimeType} from "@/models/MimeType";
import {Tag} from "@/models/Tag";

export interface AttachmentType {
    id: number;
    fileType: AttachmentTypeEnum;
    acceptedMimeTypes: MimeType[];
    maxFileSizeBytes: number;
    availableTags: Tag[];
}