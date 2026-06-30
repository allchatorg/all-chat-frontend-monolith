import {fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {getSessionToken} from '@/lib/tokenManager';

// In the merged monolith, the ads portal is served by the same backend as chat.
// Chat base API = http://localhost:8080/api/v1 (NEXT_PUBLIC_BASE_API).
// Ads endpoints live under /ads-portal, and auth is the shared session carried
// in the X-Auth-Token header (same as the chat axios client in src/lib/api.ts).
const baseApi = process.env.NEXT_PUBLIC_BASE_API && process.env.NEXT_PUBLIC_BASE_API.length > 0
    ? process.env.NEXT_PUBLIC_BASE_API
    : 'http://localhost:8080/api/v1';

const prepareHeaders = (headers: Headers) => {
    const session = getSessionToken();
    if (session?.token) {
        headers.set('X-Auth-Token', session.token);
    }
    return headers;
};

// Ads-portal endpoints live under /api/v1/ads-portal.
export const baseQuery = fetchBaseQuery({
    baseUrl: `${baseApi}/ads-portal`,
    credentials: 'include',
    prepareHeaders,
});

// Account/auth is unified onto chat, whose endpoints live at the API root
// (/api/v1/auth/** and /api/v1/users/**), NOT under /ads-portal. The session
// (X-Auth-Token) is shared, so the same header logic applies.
export const chatBaseQuery = fetchBaseQuery({
    baseUrl: baseApi,
    credentials: 'include',
    prepareHeaders,
});
