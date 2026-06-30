import {User} from "@/models/User";

export interface UserAdminView extends User {
    createdAt: Date;
    lastLoginAt: Date;
    totalUploadUsage: number;
    previousUsernames: string[];
    countryCode?: string;
}