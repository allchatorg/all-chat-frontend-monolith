import {Role} from "@/models/Role";

export interface RoleUpdateNotification {
    isPromotion: boolean;
    role: Role;
}