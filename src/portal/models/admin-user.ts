import {UserRole} from "./user-role";

export interface AdminUserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    totalPurchasedAdsCount: number;
    totalSpent: number;
    createdAt: string; // Instant in backend is usually serialized to ISO string
}
