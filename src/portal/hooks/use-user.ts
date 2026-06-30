import {UserRole} from "@ads/models/user-role";
import {useAppSelector} from "@ads/store/hooks";
import {selectCurrentUser, selectIsAdmin, selectIsAuthenticated} from "@ads/store/slices/authSlice";
import {Role} from "@ads/store/services/userApi";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

// Map backend/store Role enum to UI UserRole enum
function mapRole(role?: Role): UserRole {
    if (role === Role.ADMIN) return UserRole.ADMIN;
    return UserRole.USER;
}

/**
 * Hook for user authentication and authorization, sourced from Redux state.
 */
export function useUser() {
    const currentUser = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdmin = useAppSelector(selectIsAdmin);

    // Build a UI-friendly user object. Provide a safe fallback when unauthenticated.
    const user: User = currentUser
        ? {
            id: String(currentUser.id),
            name: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email,
            email: currentUser.email,
            role: mapRole(currentUser.role),
        }
        : {
            id: "",
            name: "",
            email: "",
            role: UserRole.USER,
        };

    // If needed, this could be wired to a "me" query status. For now, selection is synchronous.
    const isLoading = false;

    return {
        user,
        currentUserId: currentUser?.id,
        isLoading,
        isAuthenticated,
        isAdmin,
    };
}
