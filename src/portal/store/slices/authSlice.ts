// Auth adapter for the merged monolith.
//
// The ads portal no longer keeps its own auth state. Authentication is owned by
// the chat app: the current user lives in the chat `user` slice and the session
// token in localStorage (see src/lib/tokenManager.ts). These selectors project
// the chat user into the AuthUser shape the portal code expects, so existing
// `selectCurrentUser` / `selectIsAdmin` consumers keep working unchanged.
import {RootState} from '../store';
import {Role} from '../services/userApi';
import {getRoleLevel, RoleLevel} from '@/models/Role';
import {getSessionToken} from '@/lib/tokenManager';

export interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

const chatUser = (state: RootState) => (state as any)?.user?.user ?? null;

const isAdminLevel = (chatRole: unknown): boolean => {
    if (!chatRole || typeof chatRole !== 'string') return false;
    const level = getRoleLevel(chatRole as any);
    return typeof level === 'number' && level >= RoleLevel.ADMIN;
};

const toAuthUser = (u: any): AuthUser | null => {
    if (!u) return null;
    return {
        id: u.id,
        firstName: u.username ?? '',
        lastName: '',
        email: u.email ?? '',
        role: isAdminLevel(u.role) ? Role.ADMIN : Role.USER,
    };
};

// Selectors (backed by the chat store)
export const selectCurrentUser = (state: RootState) => toAuthUser(chatUser(state));
export const selectCurrentUserId = (state: RootState) => chatUser(state)?.id;
export const selectCurrentToken = (_state: RootState): string | null =>
    (typeof window !== 'undefined' ? getSessionToken()?.token ?? null : null);
export const selectIsAuthenticated = (state: RootState) => !!chatUser(state);
export const selectIsAdmin = (state: RootState) => isAdminLevel(chatUser(state)?.role);

// No-op action creators kept for backwards compatibility with any remaining
// imports. Auth mutations now go through the chat auth thunks.
export const setUser = () => ({type: 'portalAuth/noop' as const});
export const clearUser = () => ({type: 'portalAuth/noop' as const});

// This reducer is NOT registered in the unified store; the export exists only so
// legacy `import authReducer from '.../authSlice'` statements still resolve.
export default function authReducer(state: Record<string, never> = {}) {
    return state;
}
