export const ROUTES = {
    HOME: '/',
    AUTH: '/auth',
    RESET_PASSWORD: '/reset-password',
    BANNED: '/banned',
    AD_PREVIEW: '/ad-preview',
    BANS: '/bans',
    USERS: '/users',
    REPORTS: '/report-cases',
    AUDIT_LOGS: '/audit-logs',
    REGISTER: '/auth?view=register',
    REGISTER_ANONYMOUS: '/auth?view=register-anonymous',
    LOGIN: '/auth?view=login',
    APPLY_MODERATOR: '/moderator-apply',
    PRIVATE_CHAT: '/private',
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.AUTH,
    ROUTES.RESET_PASSWORD,
    ROUTES.BANNED,
    ROUTES.AD_PREVIEW,
] as const;

export const PROTECTED_ROUTES = [
    ROUTES.HOME,
    ROUTES.APPLY_MODERATOR,
] as const;

export const STAFF_ROUTES = [
    ROUTES.BANS,
    ROUTES.USERS,
    ROUTES.REPORTS,
    ROUTES.AUDIT_LOGS,
    ROUTES.PRIVATE_CHAT,
]

export function isPublicRoute(pathname: string) {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export function isProtectedRoute(pathname: string) {
    if (pathname === ROUTES.HOME || isStaffRoute(pathname)) {
        return true;
    }

    return PROTECTED_ROUTES.filter(route => route !== ROUTES.HOME)
        .some(route => pathname.startsWith(route));
}

export function isStaffRoute(pathname: string) {
    return STAFF_ROUTES.some(route => pathname.startsWith(route));
}

export function isAuthFlowRoute(pathname: string) {
    return pathname.startsWith(ROUTES.AUTH) || pathname.startsWith(ROUTES.RESET_PASSWORD) || pathname.startsWith(ROUTES.BANNED);
}
