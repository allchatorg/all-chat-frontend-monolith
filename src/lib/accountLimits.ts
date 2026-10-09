import {AttachmentType} from "@/models/AttachmentType";
import {isStaff} from "@/models/Role";
import {User} from "@/models/User";

const MEBIBYTE = 1024 * 1024;

export const ACCOUNT_LIMITS = {
    guestRooms: 20,
    claimedRooms: 25,
    verifiedRooms: 50,
    vipRooms: 100,
    vipDailyFontSaves: 5,
    regularMessageCharacters: 500,
    vipMessageCharacters: 2500,
    regularRawMessageCharacters: 2000,
    vipRawMessageCharacters: 10000,
    regularFileBytes: 10 * MEBIBYTE,
    vipFileBytes: 100 * MEBIBYTE,
    regularHourlyUploadBytes: 25 * MEBIBYTE,
    vipHourlyUploadBytes: 500 * MEBIBYTE,
} as const;

type Account = Pick<User, "vipActive" | "role" | "claimed" | "verified"> | null | undefined;

export function getAccountLimits(user: Account) {
    const vip = user?.vipActive === true;
    const staff = user ? isStaff(user.role) : false;
    return {
        messageCharacters: vip ? ACCOUNT_LIMITS.vipMessageCharacters : ACCOUNT_LIMITS.regularMessageCharacters,
        rawMessageCharacters: vip ? ACCOUNT_LIMITS.vipRawMessageCharacters : ACCOUNT_LIMITS.regularRawMessageCharacters,
        joinedPublicRooms: staff ? Infinity : vip ? ACCOUNT_LIMITS.vipRooms
            : user?.verified ? ACCOUNT_LIMITS.verifiedRooms
                : user?.claimed ? ACCOUNT_LIMITS.claimedRooms : ACCOUNT_LIMITS.guestRooms,
        hourlyUploadBytes: staff ? Infinity : vip ? ACCOUNT_LIMITS.vipHourlyUploadBytes : ACCOUNT_LIMITS.regularHourlyUploadBytes,
    };
}

// VIP raises the per-file cap for every supported chat attachment type.
// The server remains authoritative for file validation and the rolling allowance.
export function getAttachmentByteLimit(type: AttachmentType, user: Account): number {
    return user?.vipActive
        ? ACCOUNT_LIMITS.vipFileBytes
        : type.maxFileSizeBytes;
}
