import {UserRole} from "./user-role";

export interface AdminUserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    totalPurchasedAdsCount: number;
    totalSpent: number; // Recorded USD payments across all products, after refunds; excludes pending holds.
    createdAt: string; // Instant in backend is usually serialized to ISO string
}
