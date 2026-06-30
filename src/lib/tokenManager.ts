import {SessionToken} from "@/models/SessionToken";

const SESSION_KEY = 'session_token';
const HAS_ACCOUNT_KEY = 'has_account';

export const setSessionToken = (sessionToken: SessionToken) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionToken));
};

export const removeSessionToken = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getSessionToken = (): SessionToken | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as SessionToken;
    } catch (e) {
        console.error("Failed to parse session token", e);
        return null;
    }
};

export const setHasAccount = (hasAccount: boolean) => {
    localStorage.setItem(HAS_ACCOUNT_KEY, JSON.stringify(hasAccount));
};

export const getHasAccount = (): boolean => {
    const stored = localStorage.getItem(HAS_ACCOUNT_KEY);
    return stored ? JSON.parse(stored) : false;
};

export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        const exp = decoded.exp;

        if (!exp) return true;

        const expiryTime = exp * 1000;
        return Date.now() > expiryTime;
    } catch (e) {
        console.error("Failed to decode token", e);
        return true;
    }
};
