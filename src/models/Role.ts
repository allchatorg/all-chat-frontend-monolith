import {Permission} from "./Permission";

export enum RoleLevel {
    GUEST = 0,
    UNCLAIMED_USER = 0,
    USER = 0,
    MODERATOR = 1,
    ADMIN = 2,
    SUPER_ADMIN = 3,
}

export enum Role {
    GUEST = "GUEST",
    UNCLAIMED_USER = "UNCLAIMED_USER",
    USER = "USER",
    MODERATOR = "MODERATOR",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
}

export const RolePermissions: Record<Role, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission),
    ADMIN: [
        Permission.MANAGE_ROLES,
        Permission.VIEW_AUDIT_LOGS,
        Permission.CHANGE_USERNAME,
        Permission.BAN_USERS,
        Permission.KICK_USERS,
        Permission.MUTE_USERS,
        Permission.DELETE_MESSAGES,
    ],
    MODERATOR: [
        Permission.CHANGE_USERNAME,
        Permission.BAN_USERS,
        Permission.KICK_USERS,
        Permission.MUTE_USERS,
        Permission.DELETE_MESSAGES,
    ],
    USER: [],
    UNCLAIMED_USER: [],
    GUEST: [],
};

export function getRoleLevel(role: Role): number {
    return RoleLevel[role];
}

export function canActOn(roleA: Role, roleB: Role): boolean {
    return (getRoleLevel(roleA) > getRoleLevel(roleB) && isStaff(roleA));
}

export function hasPermission(role: Role, permission: Permission): boolean {
    return RolePermissions[role].includes(permission);
}

export function isStaff(role: Role): boolean {
    return getRoleLevel(role) > RoleLevel.USER;
}