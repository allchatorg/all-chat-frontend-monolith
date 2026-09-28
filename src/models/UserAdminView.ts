import {User} from "@/models/User";

export interface UserAdminView extends User {
    /** Private membership status supplied by the staff detail endpoint. */
    proActive?: boolean;
    createdAt: string;
    lastLoginAt: string;
    totalUploadUsage: number;
    previousUsernames: string[];
    countryCode?: string;
}
