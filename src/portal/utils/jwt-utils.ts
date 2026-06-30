import {jwtDecode} from 'jwt-decode';

export interface JwtPayload {
    sub: string; // email/username
    role: 'USER' | 'ADMIN';
    exp: number;
    iat: number;
}

/**
 * Decode a JWT token and extract the payload
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
}

/**
 * Get the user role from a token
 */
export function getRoleFromToken(token: string): 'USER' | 'ADMIN' | null {
    const decoded = decodeToken(token);
    return decoded?.role || null;
}

/**
 * Check if a token represents an admin user
 */
export function isAdmin(token: string): boolean {
    return getRoleFromToken(token) === 'ADMIN';
}
