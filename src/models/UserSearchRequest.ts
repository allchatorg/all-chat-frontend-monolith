import {Role} from "@/models/Role";

export interface UserSearchRequest {
    roles?: Role[];
    usernameOrId?: string;
    over18?: boolean;
    verified?: boolean;
    claimed?: boolean;
    banned?: boolean;
    page: number;
    size: number;
    sort: string;
}