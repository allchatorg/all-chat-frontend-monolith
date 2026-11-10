import {User} from "@/models/User";

export interface UserAdminView extends User {
    /** Private membership status supplied by the staff detail endpoint. */
    vipActive?: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    totalUploadUsage: number;
    previousUsernames: string[];
    countryCode?: string;
}
