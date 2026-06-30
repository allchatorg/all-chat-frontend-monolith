import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {AttachmentType} from "@/models/AttachmentType";
import {MimeType} from "@/models/MimeType";
import {ReportType} from "@/models/ReportTypeEnum";
import {PaginatedResponse} from "@/models/PaginatedResponse";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function determineAttachmentType(mimeType: MimeType, attachmentTypes: AttachmentType[]): AttachmentType | null {
    if (!mimeType || !attachmentTypes?.length) {
        return null;
    }

    return attachmentTypes.find(attachmentType => {
        for (const ext of attachmentType.acceptedMimeTypes) {
            // @ts-ignore
            let fullMimeType: any = MimeType[ext];
            if (fullMimeType === mimeType) {
                return true;
            }
        }
        return false;
    }) || null;
}

const mimeTypeAliases: Record<string, MimeType> = {
    "application/ogg": MimeType.OGG,
    "video/ogg": MimeType.OGG,
    "video/x-msvideo": MimeType.AVI,
    "video/msvideo": MimeType.AVI,
    "application/x-troff-msvideo": MimeType.AVI,
};

export function toMimeType(mime: string): MimeType {
    if (!mime) return MimeType.UNKNOWN;
    const lowerMime = mime.toLowerCase();
    if (mimeTypeAliases[lowerMime]) {
        return mimeTypeAliases[lowerMime];
    }
    return (Object.values(MimeType).find(value => value === lowerMime) as MimeType) || MimeType.UNKNOWN;
}

export function extractAcceptedMimeTypes(attachmentTypes: AttachmentType[]): string[] {
    const acceptedMimeTypes: MimeType[] = [];
    attachmentTypes.forEach((type) => {
        type.acceptedMimeTypes.forEach((mime) => {
            if (!acceptedMimeTypes.includes(mime)) {
                // @ts-ignore
                acceptedMimeTypes.push(MimeType[mime]);
            }
        });
    });
    return acceptedMimeTypes;
}

export const mimeTypeToExtension: Record<string, string> = Object.entries(MimeType).reduce((acc, [key, value]) => {
    if (value !== MimeType.UNKNOWN) {
        acc[value] = key.toLowerCase();
    }
    return acc;
}, {
    "video/x-msvideo": "avi",
    "application/x-troff-msvideo": "avi",
    "video/msvideo": "avi",
    "video/ogg": "ogg",
    "application/ogg": "ogg",
    "unknown": ""
} as Record<string, string>);

export function removeDuplicateStrings(arr: string[]): string[] {
    return Array.from(new Set(arr));
}

export const PRIORITY_MAP: Record<ReportType, number> = {
    [ReportType.SPAMMING_ADVERTISING_BEGGING]: 12,
    [ReportType.POSTING_NSFW_CONTENT_AS_SFW]: 8,
    [ReportType.IMPERSONATING_A_MODERATOR]: 12,
    [ReportType.PIRATED_CONTENT_TORRENTS]: 11,
    [ReportType.CRIMINAL_INSTRUCTIONS]: 4,
    [ReportType.DOXXING_HARASSMENT_STALKING]: 7,
    [ReportType.NON_CONSENSUAL_SEXUAL_IMAGES]: 6,
    [ReportType.INCITEMENT_TO_LAWLESS_ACTION]: 5,
    [ReportType.TRUE_THREAT]: 3,
    [ReportType.ATTEMPTING_TO_TRIGGER_EPILEPSY]: 3,
    [ReportType.POSTING_IN_A_ROOM_DEDICATED_TO_CRIMINAL_ACTIVITY]: 3,
    [ReportType.UNDERAGE]: 4,
    [ReportType.ILLEGAL_CONTENT]: 10,
    [ReportType.REAL_CHILD_SEXUAL_ABUSE_MATERIAL]: 1,
    [ReportType.FICTIONAL_CHILD_SEXUAL_ABUSE_MATERIAL]: 2,
    [ReportType.OTHER_REAL_OBSCENE_PORNOGRAPHY]: 8,
    [ReportType.OTHER_FICTIONAL_OBSCENE_PORNOGRAPHY]: 9,
    [ReportType.SNUFF_CRUSH_MATERIAL]: 5,
    [ReportType.KNOWINGLY_SOLICITING_IDENTIFYING_INFO_OR_SEXUAL_CONTENT_FROM_MINOR]: 1,
    [ReportType.KNOWINGLY_SENDING_SEXUAL_MESSAGES_OR_CONTENT_TO_MINOR]: 1,
    [ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR]: 1,
    [ReportType.POSTING_ONION_LINK]: 13
};

export const PARENT_MAP: Record<ReportType, ReportType | undefined> = {
    [ReportType.REAL_CHILD_SEXUAL_ABUSE_MATERIAL]: ReportType.ILLEGAL_CONTENT,
    [ReportType.FICTIONAL_CHILD_SEXUAL_ABUSE_MATERIAL]: ReportType.ILLEGAL_CONTENT,
    [ReportType.OTHER_REAL_OBSCENE_PORNOGRAPHY]: ReportType.ILLEGAL_CONTENT,
    [ReportType.OTHER_FICTIONAL_OBSCENE_PORNOGRAPHY]: ReportType.ILLEGAL_CONTENT,
    [ReportType.SNUFF_CRUSH_MATERIAL]: ReportType.ILLEGAL_CONTENT,
    [ReportType.KNOWINGLY_SOLICITING_IDENTIFYING_INFO_OR_SEXUAL_CONTENT_FROM_MINOR]: ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR,
    [ReportType.KNOWINGLY_SENDING_SEXUAL_MESSAGES_OR_CONTENT_TO_MINOR]: ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR,
    [ReportType.UNDERAGE]: undefined,
    [ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR]: undefined,
    [ReportType.SPAMMING_ADVERTISING_BEGGING]: undefined,
    [ReportType.POSTING_NSFW_CONTENT_AS_SFW]: undefined,
    [ReportType.IMPERSONATING_A_MODERATOR]: undefined,
    [ReportType.PIRATED_CONTENT_TORRENTS]: undefined,
    [ReportType.CRIMINAL_INSTRUCTIONS]: undefined,
    [ReportType.DOXXING_HARASSMENT_STALKING]: undefined,
    [ReportType.NON_CONSENSUAL_SEXUAL_IMAGES]: undefined,
    [ReportType.INCITEMENT_TO_LAWLESS_ACTION]: undefined,
    [ReportType.TRUE_THREAT]: undefined,
    [ReportType.ATTEMPTING_TO_TRIGGER_EPILEPSY]: undefined,
    [ReportType.POSTING_IN_A_ROOM_DEDICATED_TO_CRIMINAL_ACTIVITY]: undefined,
    [ReportType.ILLEGAL_CONTENT]: undefined,
    [ReportType.POSTING_ONION_LINK]: undefined
};

export function createEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
    return {
        content: [],
        pageable: {
            sort: {empty: true, sorted: false, unsorted: true},
            offset: 0,
            pageNumber: 0,
            pageSize: 10,
            unpaged: false,
            paged: true,
        },
        totalPages: 0,
        totalElements: 0,
        last: true,
        first: true,
        numberOfElements: 0,
        size: 10,
        number: 0,
        empty: true,
    };
}

export const ReportTypeUtils = {
    getCode: (reportType: ReportType): string => {
        return reportType;
    },
    getPriority: (reportType: ReportType): number => {
        return PRIORITY_MAP[reportType];
    },
    getParent: (reportType: ReportType): ReportType | undefined => {
        return PARENT_MAP[reportType];
    },
    isSubcategory: (reportType: ReportType): boolean => {
        return PARENT_MAP[reportType] !== undefined;
    },
    isTopLevel: (reportType: ReportType): boolean => {
        return !ReportTypeUtils.isSubcategory(reportType);
    },
    getRootCategory: (reportType: ReportType): ReportType => {
        const parent = ReportTypeUtils.getParent(reportType);
        return parent !== undefined ? parent : reportType;
    },
    hasHigherPriorityThan: (reportType: ReportType, other: ReportType): boolean => {
        return PRIORITY_MAP[reportType] < PRIORITY_MAP[other];
    },
    fromCode: (code: string): ReportType => {
        const values = Object.values(ReportType);
        const found = values.find(type => type === code);
        if (!found) {
            throw new Error(`Unknown ReportType code: ${code}`);
        }
        return found;
    },
    getAllValues: (): ReportType[] => {
        return Object.values(ReportType);
    },
    getChildren: (parent: ReportType): ReportType[] => {
        return ReportTypeUtils.getAllValues().filter(
            (t) => ReportTypeUtils.getParent(t) === parent
        );
    },
    getTopLevel: (): ReportType[] => {
        return ReportTypeUtils.getAllValues().filter((t) =>
            ReportTypeUtils.isTopLevel(t)
        );
    },
};

export const getMessageCategory = (count: number) => {
    if (count >= 1000000) return "1M+";
    if (count >= 500000) return "500K+";
    if (count >= 100000) return "100K+";
    if (count >= 50000) return "50K+";
    if (count >= 10000) return "10K+";
    if (count >= 5000) return "5K+";
    if (count >= 1000) return "1K+";
    if (count >= 500) return "500+";
    if (count >= 100) return "100+";
    return count.toString();
};

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
};
