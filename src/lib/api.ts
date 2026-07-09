import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from "axios";
import {getSessionToken, removeSessionToken} from "@/lib/tokenManager";
import {Ban} from "@/models/Ban";

const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const sessionToken = getSessionToken();
        if (sessionToken && config.headers) {
            config.headers['X-Auth-Token'] = sessionToken.token;
        }
        return config;
    });


api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        if (error.response && isBanResponse(error.response)) {
            // Keep the session token: banned users stay authenticated so they can reach
            // the whitelisted ban-appeal endpoints. Skip the redirect when already on a
            // /banned page, otherwise its own API calls would loop the navigation.
            const banData: Ban = error.response.data;
            if (!window.location.pathname.startsWith('/banned')) {
                window.location.href = `/banned?ban=${encodeURIComponent(JSON.stringify(banData))}`;
            }
        }
        // Handle HTTP 429 Too Many Requests globally
        if (error.response && error.response.status === 429) {
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
