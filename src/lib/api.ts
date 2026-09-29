import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from "axios";
import {getSessionToken} from "@/lib/tokenManager";
import {normalizeApiError} from '@/lib/apiError';
import {Ban} from "@/models/Ban";
import {getFontStoreGeneration, ingestFontSnapshots} from '@/lib/fontStore';
import {isAuthFlowRoute, isBillingRoute, sanitizeRedirectParam} from '@/routes';

interface AppearanceRequestConfig extends InternalAxiosRequestConfig {
    fontStoreGeneration?: number;
}

const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Credential-establishing endpoints authenticate by payload, never by session.
// A stored token must not ride along: a stale banned session on POST /auth/login
// makes the AccessRestrictionFilter answer with the previous user's ban 403,
// hijacking a different user's login. Exact match — /auth/register must not
// shadow /auth/register-guest. /auth/claim-account and /auth/logout stay
// tokenized because they act on the current session.
const CREDENTIAL_ENDPOINTS = new Set([
    "/auth/login",
    "/auth/register",
    "/auth/register-unclaimed",
    "/auth/forgot-password",
    "/auth/forgot-password/verify-phone-code",
    "/auth/reset-password",
]);

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        (config as AppearanceRequestConfig).fontStoreGeneration = getFontStoreGeneration();
        const sessionToken = getSessionToken();
        if (sessionToken && config.headers && !CREDENTIAL_ENDPOINTS.has(config.url ?? "")) {
            config.headers['X-Auth-Token'] = sessionToken.token;
        }
        return config;
    });


api.interceptors.response.use(
    (response) => {
        ingestFontSnapshots(response.data, (response.config as AppearanceRequestConfig).fontStoreGeneration);
        return response;
    },
    (error: AxiosError<any>) => {
        if (typeof window !== 'undefined' && error.response && isBanResponse(error.response)) {
            // Keep the session token: banned users stay authenticated so they can reach
            // the whitelisted ban-appeal endpoints. Skip the redirect when already on a
            // /banned page, otherwise its own API calls would loop the navigation.
            const banData: Ban = error.response.data;
            const requestToken = error.config?.headers?.get('X-Auth-Token');
            const currentToken = getSessionToken()?.token;
            const isCurrentSession = requestToken ? requestToken === currentToken : !currentToken;
            const searchParams = new URLSearchParams(window.location.search);
            const authReturn = isAuthFlowRoute(window.location.pathname)
                ? sanitizeRedirectParam(searchParams.get('redirect')) : null;
            const authReturnUrl = authReturn ? new URL(authReturn, window.location.origin) : null;
            const billingContext = isBillingRoute(window.location.pathname, searchParams) ||
                (!!authReturnUrl && isBillingRoute(authReturnUrl.pathname, authReturnUrl.searchParams));
            // An old account's pending request must not navigate a newly signed-in
            // account. Login also retains billing returns for restricted customers.
            if (isCurrentSession && !window.location.pathname.startsWith('/banned') && !billingContext) {
                window.location.href = `/banned?ban=${encodeURIComponent(JSON.stringify(banData))}`;
            }
        }
        // Upload allowance failures use the uploader’s ordinary error toast, not a rate-limit dialog.
        if (error.response && error.response.status === 429 && error.response.data?.limit?.code !== "HOURLY_UPLOAD_BYTES") {
            try {
                const retryAfterHeader = (error.response.headers as any)?.["retry-after"];
                let retryAfterSeconds: number | null = null;
                if (retryAfterHeader) {
                    const parsed = parseInt(Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : String(retryAfterHeader), 10);
                    if (!isNaN(parsed)) retryAfterSeconds = parsed;
                }
                const serverMessage = (error.response.data && (error.response.data.message || error.response.data.error || error.response.data.detail)) || null;
                const message = serverMessage || "You're doing that too often right now. Please slow down and try again shortly.";
                // Lazy import to avoid coupling
                import("@/lib/rateLimit").then(({showRateLimit}) => {
                    showRateLimit(message, retryAfterSeconds ?? null);
                }).catch(() => {
                });
            } catch (_) {
                // no-op
            }
        }
        // Thunks historically pass response.data through rejectWithValue. Preserve
        // HTTP metadata there, including when a proxy returned an HTML error page.
        if (error.response) error.response.data = normalizeApiError(error);
        return Promise.reject(error);
    }
);

const isBanResponse = (response: any) => {
    return response && response.status === 403 &&
        response.data &&
        response.data.reportType &&
        response.data.type;
}

export default api;
