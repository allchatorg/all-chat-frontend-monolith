import {Role} from "./Role";
import {Tag} from "@/models/Tag";
import {TimeFormat} from "@/models/TimeFormat";

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
    subscribedToMarketingEmails?: boolean;
    role: Role;
    purchasedAdsCount?: number;
    totalUploadUsage?: number;
    blurredContentTags: Tag[];
    timeFormatSetting: TimeFormat;
    displayColor: string;
    blockedUsers: UserMinimal[] | [];
    appliedForModerator?: boolean;
}

export type UserMinimal = Pick<User, "id" | "username">;
