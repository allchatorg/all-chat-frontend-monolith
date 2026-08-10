import {
    buildAttachmentType,
    deriveAttachmentName,
    inferAttachmentTypeFromMime,
    inferMimeTypeFromUrl,
} from "@/features/chatroom/utils/adPreview";
import {Attachment} from "@/models/Attachment";
import {Message} from "@/models/message";
import {MimeType} from "@/models/MimeType";
import {Role} from "@/models/Role";

// House/filler ads shown when /ads/serve returns 204 (no ACTIVE campaigns).
// They are built entirely client-side and never touch the backend: negative
// ids are the discriminator that keeps them out of the click/link-click
// tracking calls (see AdvertItem.tsx).
//
// Media URLs are manually uploaded assets on the public R2 bucket — served
// directly by Cloudflare, independent of any backend storage config.
const FILLER_PHOTO_URL = "https://pub-0041c325ef4f49388686f7b78d23aa40.r2.dev/allchat-advert-images/allchat_light_logo.png";
const FILLER_VIDEO_URL = "https://pub-0041c325ef4f49388686f7b78d23aa40.r2.dev/allchat-advert-images/video_ads.mp4";

// The public ads portal URL used as the CTA in every filler creative.
const FILLER_PORTAL_URL = "https://www.allchat.org/portal";

const FILLER_SENDER_ID = -1;
// Sponsored messages always render on the light-blue advert background,
// matching real served ads and the portal ad preview.
const FILLER_AD_COLOR = "#E0EEFF";

export function isFillerAdId(id: number): boolean {
    return id < 0;
}

type FillerCreative = {
    id: number;
    brandName: string;
    content: string;
    attachmentUrl?: string;
    attachmentName?: string;
};

// Creative copy mirrors the three example ads on the portal landing page.
const FILLER_CREATIVES: FillerCreative[] = [
    {
        id: -101,
        brandName: "allchat Ads",
        content: "Your text ad could be here! Promote your next campaign directly inside the conversation and meet customers where they already chat.",
    },
    {
        id: -102,
        brandName: "allchat Ads",
        content: "Your photo ad could be here! Refresh your next campaign with a strong visual message that feels native in the chat.",
        attachmentUrl: FILLER_PHOTO_URL,
        attachmentName: "allchat_light_logo.png",
    },
    {
        id: -103,
        brandName: "allchat Ads",
        content: "Your video ad could be here! Show the product in action with a video ad embedded right into the chat experience.",
        attachmentUrl: FILLER_VIDEO_URL,
        attachmentName: "video_ads.mp4",
    },
];

export function buildFillerAdMessage(): Message {
    const creative = FILLER_CREATIVES[Math.floor(Math.random() * FILLER_CREATIVES.length)];

    const attachments: Attachment[] = [];
    if (creative.attachmentUrl) {
        const mime = inferMimeTypeFromUrl(creative.attachmentUrl) ?? MimeType.PNG;
        attachments.push({
            id: creative.id * 10 - 1,
            messageId: creative.id,
            url: creative.attachmentUrl,
            name: creative.attachmentName || deriveAttachmentName(creative.attachmentUrl, mime, 0),
            size: 0,
            attachmentType: buildAttachmentType(inferAttachmentTypeFromMime(mime)),
            mime,
            tags: [],
        });
    }

    // The CTA must be an absolute URL — FormattedMessageText only linkifies
    // full http(s):// URLs.
    const content = `${creative.content}\n\nCreate your own ad: ${FILLER_PORTAL_URL}`;

    return {
        id: creative.id,
        content,
        createdAt: new Date(),
        senderId: FILLER_SENDER_ID,
        senderUsername: creative.brandName,
        senderRole: Role.USER,
        senderCountryCode: "US",
        // Overwritten per-room by useAdServing's buildAdvertMessage.
        chatRoomId: 0,
        chatRoomName: "",
        bannedUser: false,
        color: FILLER_AD_COLOR,
        deleted: false,
        attachments,
        reactions: [],
        advert: true,
    };
}
