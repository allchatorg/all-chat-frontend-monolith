import axios from 'axios';
import {ApiError} from '@/models/ApiError';

function safeText(value: unknown): string | undefined {
    if (typeof value !== 'string' || !value.trim() || /<\/?[a-z!][^>]*>/i.test(value)) return undefined;
    return value.trim().slice(0, 500);
}

/** Preserve HTTP diagnostics without displaying proxy HTML or a server stack trace. */
export function normalizeApiError(error: unknown, stage?: ApiError['stage']): ApiError {
    const axiosError = axios.isAxiosError(error) ? error : undefined;
    const body = axiosError?.response?.data ?? error;
    const details = body && typeof body === 'object' ? body as Partial<ApiError> & {detail?: string} : {};
    const status = axiosError?.response?.status ?? (typeof details.status === 'number' ? details.status : 0);
    const serverRequestId = axiosError?.response?.headers?.['x-request-id'] ?? details.requestId;
    const requestId = typeof serverRequestId === 'string' && /^[a-zA-Z0-9-]{8,128}$/.test(serverRequestId)
        ? serverRequestId : undefined;
    const requestUrl = axiosError?.config?.url ?? details.endpoint;
    const endpoint = typeof requestUrl === 'string' ? requestUrl.split(/[?#]/)[0].replace(/^https?:\/\/[^/]+/, '') : undefined;
    const message = status >= 500
        ? 'The server could not complete this request. Please try again.'
        : status === 0 && axiosError
            ? 'Unable to reach the server. Check your connection and try again.'
            : safeText(details.message) ?? safeText(details.detail) ?? safeText(body) ?? safeText(details.error)
                ?? 'The request could not be completed. Please try again.';

    return {
        ...details,
        status,
        error: status >= 500 ? 'Server error' : safeText(details.error) ?? 'Request failed',
        message,
        timestamp: safeText(details.timestamp) ?? new Date().toISOString(),
        requestId,
        endpoint,
        stage: stage ?? details.stage,
        retryable: status === 0 || status === 408 || status === 429 || status >= 500,
    };
}

export function apiErrorMessage(error: unknown): string {
    const normalized = normalizeApiError(error);
    return normalized.requestId ? `${normalized.message} Reference: ${normalized.requestId}` : normalized.message;
}
