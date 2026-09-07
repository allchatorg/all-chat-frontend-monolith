import {User} from "@/models/User";

export interface UserAdminView extends User {
    createdAt: string;
    lastLoginAt: string;
    totalUploadUsage: number;
    previousUsernames: string[];
    countryCode?: string;
}
