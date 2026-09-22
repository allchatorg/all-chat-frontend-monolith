import {AttachmentType} from "@/models/AttachmentType";
import {isStaff} from "@/models/Role";
import {User} from "@/models/User";

const MEBIBYTE = 1024 * 1024;

export const ACCOUNT_LIMITS = {
    guestRooms: 20,
    claimedRooms: 25,
    verifiedRooms: 50,
    proRooms: 100,
    regularMessageCharacters: 500,
    proMessageCharacters: 2500,
    regularRawMessageCharacters: 2000,
    proRawMessageCharacters: 10000,
    regularFileBytes: 10 * MEBIBYTE,
    proFileBytes: 100 * MEBIBYTE,
    regularHourlyUploadBytes: 25 * MEBIBYTE,
    proHourlyUploadBytes: 500 * MEBIBYTE,
} as const;

type Account = Pick<User, "proActive" | "role" | "claimed" | "verified"> | null | undefined;

export function getAccountLimits(user: Account) {
    const pro = user?.proActive === true;
    const staff = user ? isStaff(user.role) : false;
    return {
        messageCharacters: pro ? ACCOUNT_LIMITS.proMessageCharacters : ACCOUNT_LIMITS.regularMessageCharacters,
        rawMessageCharacters: pro ? ACCOUNT_LIMITS.proRawMessageCharacters : ACCOUNT_LIMITS.regularRawMessageCharacters,
        joinedPublicRooms: staff ? Infinity : pro ? ACCOUNT_LIMITS.proRooms
            : user?.verified ? ACCOUNT_LIMITS.verifiedRooms
                : user?.claimed ? ACCOUNT_LIMITS.claimedRooms : ACCOUNT_LIMITS.guestRooms,
        hourlyUploadBytes: staff ? Infinity : pro ? ACCOUNT_LIMITS.proHourlyUploadBytes : ACCOUNT_LIMITS.regularHourlyUploadBytes,
    };
}

// Pro raises the per-file cap for every supported chat attachment type.
// The server remains authoritative for file validation and the rolling allowance.
export function getAttachmentByteLimit(type: AttachmentType, user: Account): number {
    return user?.proActive
        ? ACCOUNT_LIMITS.proFileBytes
        : type.maxFileSizeBytes;
}
