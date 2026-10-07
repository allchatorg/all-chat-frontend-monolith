import {Role} from "@/models/Role";

// Username styling per sender role, shared so staff names look the same
// everywhere they are rendered.
export function getRoleNameStyles(role: Role): string {
    switch (role) {
        case Role.SUPER_ADMIN:
            return "text-red-700 dark:text-red-300 font-bold";
        case Role.ADMIN:
            return "text-blue-700 dark:text-blue-300 font-bold";
        case Role.MODERATOR:
            return "text-sky-400 dark:text-sky-300 font-bold";
        default:
            return "text-gray-500 dark:text-slate-200";
    }
}
