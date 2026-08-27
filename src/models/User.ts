import {Role} from "./Role";
import {Tag} from "@/models/Tag";
import {TimeFormat} from "@/models/TimeFormat";
import {IdVerificationStatus} from "@/models/IdVerificationStatus";

export interface User {
    id: number;
    username: string;
    email?: string | null;
    phoneNumber?: string | null;
    phoneNumberVerificationDate?: Date;
    isOver18: boolean;
    claimed: boolean;
    banned: boolean;
    verified: boolean;
    idVerificationStatus?: IdVerificationStatus;
    idVerificationUnderAge?: boolean;
    subscribedToMarketingEmails?: boolean;
    role: Role;
    purchasedAdsCount?: number;
    totalUploadUsage?: number;
    blurredContentTags: Tag[];
    timeFormatSetting: TimeFormat;
    timeZone?: string | null;
    displayColor: string;
    blockedUsers: UserMinimal[] | [];
    appliedForModerator?: boolean;
}

export type UserMinimal = Pick<User, "id" | "username">;
