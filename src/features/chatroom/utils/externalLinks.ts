// External-link guard: decides whether a URL in a message/ad should open directly
// or go through the "You're leaving allchat" warning dialog first.
//
// The allowlist is hand-curated on purpose. Public popularity rankings (Tranco,
// Cisco Umbrella) are not safety lists — many top-ranked hosts (drive.google.com,
// github.io, discord.gg, ...) are also the most common phishing hosts. Major
// platforms (Discord, Steam) ship a static trusted-domain list; we do the same.
// Add/remove entries here as needed. Matching is by host suffix, so "google.com"
// also covers "www.google.com" and "docs.google.com".

export const TRUSTED_DOMAINS: readonly string[] = [
    "allchat.org",
    "google.com",
    "youtube.com",
    "youtu.be",
    "wikipedia.org",
    "github.com",
    "gitlab.com",
    "stackoverflow.com",
    "reddit.com",
    "x.com",
    "twitter.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "linkedin.com",
    "twitch.tv",
    "discord.com",
    "spotify.com",
    "apple.com",
    "microsoft.com",
    "amazon.com",
    "netflix.com",
    "imdb.com",
    "bbc.com",
    "cnn.com",
    "nytimes.com",
    "theguardian.com",
    "medium.com",
    "vimeo.com",
    "paypal.com",
    "stripe.com",
    "mozilla.org",
    "npmjs.com",
    "imgur.com",
    "giphy.com",
];

const USER_TRUSTED_KEY = "allchat.trustedDomains";

export const getHostname = (url: string): string | null => {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
};

const matchesDomain = (host: string, domain: string): boolean =>
    host === domain || host.endsWith("." + domain);

export const getUserTrustedDomains = (): string[] => {
    try {
        if (typeof window === "undefined") return [];
        const raw = window.localStorage.getItem(USER_TRUSTED_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((d) => typeof d === "string") : [];
    } catch {
        return [];
    }
};

export const trustDomain = (host: string): void => {
    try {
        if (typeof window === "undefined") return;
        const current = getUserTrustedDomains();
        const normalized = host.toLowerCase();
        if (!current.includes(normalized)) {
            window.localStorage.setItem(USER_TRUSTED_KEY, JSON.stringify([...current, normalized]));
        }
    } catch {
        // localStorage unavailable (private mode, SSR) — warning simply keeps showing.
    }
};

export const isTrustedDomain = (url: string): boolean => {
    const host = getHostname(url);
    if (!host) return false; // unparseable → always warn

    if (typeof window !== "undefined" && matchesDomain(host, window.location.hostname.toLowerCase())) {
        return true;
    }
    if (TRUSTED_DOMAINS.some((d) => matchesDomain(host, d))) return true;
    return getUserTrustedDomains().some((d) => matchesDomain(host, d));
};
