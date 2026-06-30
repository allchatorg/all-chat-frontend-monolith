import {useSelector} from 'react-redux';
import {getRoleLevel, Role} from "@/models/Role";
import {selectUser} from "@/redux/user/userSelectors";
import {useMemo} from "react";

export function useRoleAccess() {
    const user = useSelector(selectUser);

    return useMemo(() => {
        if (!user || !user.role) {
            return {
                hasRole: () => false,
                hasRoleLevel: () => false,
                isAdmin: () => false,
                isModerator: () => false,
                isStaffMember: () => false,
                currentRole: Role.GUEST,
                currentRoleLevel: 0,
                isPrincipal: () => false,
            };
        }

        const userRole = user.role;
        const roleLevel = getRoleLevel(userRole);

        return {
            hasRole: (requiredRole: Role) => roleLevel >= getRoleLevel(requiredRole),
            hasRoleLevel: (level: number) => roleLevel >= level,
            isAdmin: () => roleLevel >= getRoleLevel(Role.ADMIN),
            isModerator: () => roleLevel >= getRoleLevel(Role.MODERATOR),
            isStaffMember: () => roleLevel >= getRoleLevel(Role.MODERATOR),
            currentRole: userRole,
            currentRoleLevel: roleLevel,
            isPrincipal: (id: number) => user.id === id,
        };
    }, [user]);
}