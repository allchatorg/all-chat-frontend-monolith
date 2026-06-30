export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

function isClient(): boolean {
    return typeof window !== "undefined";
}

function hasGtag(): boolean {
    return isClient() && typeof (window as any).gtag === "function";
}

export function logEvent(eventName: string, params?: Record<string, any>) {
    if (!hasGtag()) return;
    try {
        (window as any).gtag("event", eventName, params || {});
    } catch (_) {
        // no-op
    }
}

export function trackMessageSent(params: { room_id: string; has_attachment: boolean; message_length: number }) {
    logEvent("message_sent", params);
}

export function trackMessageDeleted(params: { room_id: string; message_id: string; deleted_by: string }) {
    logEvent("message_deleted", params);
}

export function trackAttachmentUploaded(params: { file_type: string; file_size: number; room_id: string }) {
    logEvent("attachment_uploaded", params);
}

export function trackUserRegistered(params: { user_id: string; method: "email" | "oauth" | "anonymous" }) {
    logEvent("user_registered", params);
}

export function trackUserRegisteredAnonymous(params: { session_id: string }) {
    logEvent("user_registered_anonymous", params);
}

export function trackUserLoggedIn(params: { user_id: string; method: "email" | "oauth" | "anonymous" }) {
    logEvent("user_logged_in", params);
}

export function trackUserDeleted(params: { user_id: string }) {
    logEvent("user_deleted", params);
}