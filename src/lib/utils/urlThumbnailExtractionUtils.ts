export type VideoPlatform = "youtube" | "vimeo" | "twitch" | "kick" | "odysee" | "rumble";

interface ThumbnailResult {
    url: string;
    platform: VideoPlatform;
}

export interface VideoEmbedResult {
    url: string;
    platform: VideoPlatform;
    title: string;
    allow?: string;
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const TWITCH_DEFAULT_THUMBNAIL = "https://static.twitchcdn.net/assets/defaults/video-placeholder.png";
const DEFAULT_VIDEO_IFRAME_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

function parseUrl(url: string): URL | null {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

function normalizeHostname(hostname: string): string {
    return hostname.replace(/^www\./, "").toLowerCase();
}

function isHostname(hostname: string, domain: string): boolean {
    const normalizedHostname = normalizeHostname(hostname);
    return normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`);
}

function getPathSegments(parsedUrl: URL): string[] {
    return parsedUrl.pathname.split("/").filter(Boolean);
}

function normalizeYouTubeId(videoId: string | null | undefined): string | null {
    if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
        return null;
    }

    return videoId;
}

export function extractYouTubeId(url: string): string | null {
    const parsedUrl = parseUrl(url);

    if (parsedUrl) {
        const hostname = normalizeHostname(parsedUrl.hostname);

        if (hostname === "youtu.be") {
            return normalizeYouTubeId(parsedUrl.pathname.split("/").filter(Boolean)[0]);
        }

        if (isHostname(hostname, "youtube.com") || isHostname(hostname, "youtube-nocookie.com")) {
            const watchVideoId = normalizeYouTubeId(parsedUrl.searchParams.get("v"));
            if (watchVideoId) {
                return watchVideoId;
            }

            const [route, videoId] = parsedUrl.pathname.split("/").filter(Boolean);
            if (["embed", "shorts", "live", "v"].includes(route)) {
                return normalizeYouTubeId(videoId);
            }
        }
    }

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return normalizeYouTubeId(match[1]);
    }

    return null;
}

interface VimeoDetails {
    id: string;
    hash: string | null;
}

function extractVimeoDetails(url: string): VimeoDetails | null {
    const parsedUrl = parseUrl(url);

    if (parsedUrl && isHostname(parsedUrl.hostname, "vimeo.com")) {
        const pathSegments = getPathSegments(parsedUrl);
        const idIndex = pathSegments.findIndex(segment => /^\d+$/.test(segment));

        if (idIndex !== -1) {
            const pathHash = pathSegments[idIndex + 1];
            const hash = parsedUrl.searchParams.get("h") || (/^[a-zA-Z0-9]+$/.test(pathHash ?? "") ? pathHash : null);
            return {
                id: pathSegments[idIndex],
                hash,
            };
        }
    }

    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)(?:[/?#]|$)/);
    return match ? {id: match[1], hash: null} : null;
}

function extractVimeoId(url: string): string | null {
    return extractVimeoDetails(url)?.id ?? null;
}

type TwitchResource =
    | { type: "channel"; value: string }
    | { type: "video"; value: string }
    | { type: "clip"; value: string };

const TWITCH_RESERVED_PATHS = new Set([
    "directory",
    "downloads",
    "drops",
    "friends",
    "jobs",
    "login",
    "payments",
    "p",
    "popout",
    "settings",
    "subscriptions",
    "team",
    "turbo",
    "videos",
]);

function extractTwitchResource(url: string): TwitchResource | null {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) return null;

    const hostname = normalizeHostname(parsedUrl.hostname);
    const pathSegments = getPathSegments(parsedUrl);

    if (hostname === "clips.twitch.tv") {
        const clipSlug = pathSegments[0];
        return clipSlug ? {type: "clip", value: clipSlug} : null;
    }

    if (!isHostname(hostname, "twitch.tv")) {
        return null;
    }

    const [firstSegment, secondSegment, thirdSegment] = pathSegments;

    if (firstSegment === "videos" && secondSegment && /^\d+$/.test(secondSegment)) {
        return {type: "video", value: secondSegment};
    }

    if (secondSegment === "clip" && thirdSegment) {
        return {type: "clip", value: thirdSegment};
    }

    if (firstSegment && !TWITCH_RESERVED_PATHS.has(firstSegment.toLowerCase())) {
        return {type: "channel", value: firstSegment};
    }

    return null;
}

function getTwitchChannelThumbnail(url: string): string | null {
    const twitchResource = extractTwitchResource(url);
    if (twitchResource?.type !== "channel") return null;
    const username = twitchResource.value;
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${username}-640x360.jpg`;
}

function extractKickChannel(url: string): string | null {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) return null;

    const hostname = normalizeHostname(parsedUrl.hostname);
    if (hostname !== "player.kick.com" && !isHostname(hostname, "kick.com")) {
        return null;
    }

    const [channel, secondSegment] = getPathSegments(parsedUrl);
    if (!channel || secondSegment) {
        return null;
    }

    return /^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(channel) ? channel : null;
}

function getOdyseeEmbedUrl(url: string): string | null {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl || !isHostname(parsedUrl.hostname, "odysee.com")) {
        return null;
    }

    const pathSegments = getPathSegments(parsedUrl);
    if (pathSegments[0] === "$" && pathSegments[1] === "embed" && pathSegments[2]) {
        return `https://odysee.com/${pathSegments.join("/")}${parsedUrl.search}`;
    }

    if (pathSegments.length < 2 || !pathSegments.some(segment => segment.includes(":"))) {
        return null;
    }

    return `https://odysee.com/$/embed/${pathSegments.join("/")}${parsedUrl.search}`;
}

function getRumbleEmbedUrl(url: string): string | null {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl || !isHostname(parsedUrl.hostname, "rumble.com")) {
        return null;
    }

    const pathSegments = getPathSegments(parsedUrl);
    if (pathSegments[0] === "embed" && pathSegments[1]) {
        return `https://rumble.com/${pathSegments.join("/")}${parsedUrl.search}`;
    }

    return null;
}

export function getVideoThumbnail(url: string): ThumbnailResult | null {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        const id = extractYouTubeId(url);
        if (id) {
            return {
                url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
                platform: 'youtube'
            };
        }
    }

    if (lowerUrl.includes('vimeo.com')) {
        const id = extractVimeoId(url);
        if (id) {
            return {
                url: `https://vumbnail.com/${id}.jpg`,
                platform: 'vimeo'
            };
        }
    }

    if (lowerUrl.includes('twitch.tv')) {
        const thumbnail = getTwitchChannelThumbnail(url);
        if (thumbnail) {
            return {
                url: thumbnail,
                platform: 'twitch'
            };
        }
        return {
            url: TWITCH_DEFAULT_THUMBNAIL,
            platform: 'twitch'
        };
    }

    if (lowerUrl.includes('kick.com')) {
        return {
            url: 'https://testing-bucket-chat-app.s3.eu-north-1.amazonaws.com/public/kick-splash.svg',
            platform: 'kick'
        };
    }

    if (lowerUrl.includes('odysee.com')) {
        return {
            url: 'https://testing-bucket-chat-app.s3.eu-north-1.amazonaws.com/public/odysee-splash.svg',
            platform: 'odysee'
        };
    }

    if (lowerUrl.includes('rumble.com')) {
        return {
            url: 'https://testing-bucket-chat-app.s3.eu-north-1.amazonaws.com/public/rumble-splash.svg',
            platform: 'rumble'
        };
    }

    return null;
}

export function getVideoEmbed(url: string, twitchParentDomain?: string): VideoEmbedResult | null {
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
        return {
            url: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`,
            platform: "youtube",
            title: "YouTube video player",
            allow: DEFAULT_VIDEO_IFRAME_ALLOW,
        };
    }

    const vimeoDetails = extractVimeoDetails(url);
    if (vimeoDetails) {
        const queryParams = new URLSearchParams({autoplay: "1"});
        if (vimeoDetails.hash) {
            queryParams.set("h", vimeoDetails.hash);
        }

        return {
            url: `https://player.vimeo.com/video/${vimeoDetails.id}?${queryParams.toString()}`,
            platform: "vimeo",
            title: "Vimeo video player",
            allow: "autoplay; fullscreen; picture-in-picture",
        };
    }

    const twitchResource = extractTwitchResource(url);
    if (twitchResource && twitchParentDomain) {
        const queryParams = new URLSearchParams({
            parent: twitchParentDomain,
            autoplay: "true",
        });

        if (twitchResource.type === "clip") {
            queryParams.set("clip", twitchResource.value);
            return {
                url: `https://clips.twitch.tv/embed?${queryParams.toString()}`,
                platform: "twitch",
                title: "Twitch clip player",
                allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
            };
        }

        queryParams.set(twitchResource.type, twitchResource.type === "video" ? `v${twitchResource.value}` : twitchResource.value);

        return {
            url: `https://player.twitch.tv/?${queryParams.toString()}`,
            platform: "twitch",
            title: "Twitch video player",
            allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
        };
    }

    const kickChannel = extractKickChannel(url);
    if (kickChannel) {
        return {
            url: `https://player.kick.com/${kickChannel}?autoplay=true`,
            platform: "kick",
            title: "Kick livestream player",
            allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
        };
    }

    const odyseeEmbedUrl = getOdyseeEmbedUrl(url);
    if (odyseeEmbedUrl) {
        return {
            url: odyseeEmbedUrl,
            platform: "odysee",
            title: "Odysee video player",
            allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
        };
    }

    const rumbleEmbedUrl = getRumbleEmbedUrl(url);
    if (rumbleEmbedUrl) {
        return {
            url: rumbleEmbedUrl,
            platform: "rumble",
            title: "Rumble video player",
            allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
        };
    }

    return null;
}

export async function getVimeoThumbnail(videoId: string): Promise<string | null> {
    try {
        const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
        const data = await response.json();
        return data.thumbnail_url || null;
    } catch {
        return null;
    }
}

export function isSupportedVideoPlatform(url: string): boolean {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) return false;

    const supportedDomains = ['youtube.com', 'youtube-nocookie.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'kick.com', 'odysee.com', 'rumble.com'];
    return supportedDomains.some(platform => isHostname(parsedUrl.hostname, platform));
}
