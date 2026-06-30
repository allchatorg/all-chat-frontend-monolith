import {useEffect, useState} from "react";

const CONSENT_KEY = "analytics_consent";

type ConsentValue = "granted" | "denied" | "undecided";

export function useAnalyticsConsent() {
    const [consent, setConsent] = useState<ConsentValue>(() => {
        if (typeof window === "undefined") return "denied";
        const stored = window.localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
        return stored ?? "undecided";
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (consent === "undecided") return;
        try {
            window.localStorage.setItem(CONSENT_KEY, consent);
        } catch {
        }
    }, [consent]);

    return {consent, setConsent, CONSENT_KEY};
}