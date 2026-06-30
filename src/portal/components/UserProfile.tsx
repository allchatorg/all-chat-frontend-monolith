"use client";
import {useAppSelector} from "@ads/store/hooks";
import {selectCurrentUser, selectIsAdmin, selectIsAuthenticated} from "@ads/store/slices/authSlice";

/**
 * Example component showing how to access user data from Redux state
 */
export function UserProfile() {
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdmin = useAppSelector(selectIsAdmin);

    if (!isAuthenticated || !user) {
        return <div>Please log in</div>;
    }

    return (
        <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">User Profile</h2>
            <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                {isAdmin && (
                    <p className="text-primary font-medium">Admin Access</p>
                )}
            </div>
        </div>
    );
}
