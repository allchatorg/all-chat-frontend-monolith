"use client"

import Image from "next/image"
import Link from "next/link"
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    FileCheck,
    FileText,
    Image as ImageIcon,
    MessageSquare,
    Shield,
    Users,
    Video,
} from "lucide-react"
import {useDialog} from "@ads/components/providers/DialogProvider"
import TermsOfService from "@ads/components/TermsOfService"
import PrivacyPolicy from "@ads/components/PrivacyPolicy"
import AdvertiserTerms from "@ads/components/AdvertiserPolicy"
import {AdFormatType} from "@ads/data/adFormats";
import {AdPreviewButton} from "@ads/components/ad-preview/ad-preview-button";
import {PreviewAdData} from "@ads/components/ad-preview/preview-utils";

// Manually uploaded demo assets on the public R2 bucket — keep these URLs
// stable. Ad media uploads moved to Wasabi, but these are served directly
// by Cloudflare and don't depend on any backend storage config.
const PHOTO_PREVIEW_URL = "https://pub-0041c325ef4f49388686f7b78d23aa40.r2.dev/dev/73bed392-0adc-43cd-8a68-c763be2a45fe_allchat-logo.png"
const VIDEO_PREVIEW_URL = "https://pub-0041c325ef4f49388686f7b78d23aa40.r2.dev/dev/7415fc9a-2e6a-4ca8-8ce7-32f41cb2a28d_Generated%20Video%20March%2027,%202026%20-%201_43AM.mp4"

type HomeAdFormat = {
    id: number
    type: AdFormatType
    title: string
    description: string
    previewAd: PreviewAdData
}

export default function Home() {
    const {open} = useDialog();
    const adFormats: HomeAdFormat[] = [
        {
            id: 1,
            type: AdFormatType.TEXT,
            title: "Text Advertisement",
            description: "Simple text-based advertisement",
            previewAd: {
                brandName: "Allchat Ads",
                content: "Promote your next campaign directly inside the conversation and meet customers where they already chat.",
                color: "#2563EB",
                chatRoomName: "General",
                senderCountryCode: "US",
                senderRole: "USER",
            },
        },
        {
            id: 2,
            type: AdFormatType.PHOTO,
            title: "Photo Ad",
            description: "High-visibility visual format",
            previewAd: {
                brandName: "Allchat Advert",
                content: "Refresh your next campaign with a strong visual message that feels native in the thread.",
                color: "#004B93",
                attachmentUrl: PHOTO_PREVIEW_URL,
                attachmentName: "allchat-photo-preview.png",
                chatRoomName: "General",
                senderCountryCode: "US",
                senderRole: "USER",
            },
        },
        {
            id: 3,
            type: AdFormatType.VIDEO,
            title: "Video Ad",
            description: "Engaging video content",
            previewAd: {
                brandName: "Allchat Advert",
                content: "Show the product in action with a video ad preview embedded right into the chat experience.",
                color: "#E11D48",
                attachmentUrl: VIDEO_PREVIEW_URL,
                attachmentName: "allchat-video-preview.mp4",
                chatRoomName: "General",
                senderCountryCode: "US",
                senderRole: "USER",
            },
        },
    ]

    return (
        <div className="min-h-screen w-full bg-brand overflow-hidden relative selection:bg-blue-200">
            <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
                <div className="flex flex-col items-center">
                    <div className="mb-8 sm:mb-12">
                        <Image
                            src="/allchat-logo.png"
                            alt="AllChat Ads Portal"
                            width={640}
                            height={220}
                            priority
                            className="h-auto w-[200px] sm:w-[380px] md:w-[480px] drop-shadow-lg"
                        />
                    </div>

                    <div className="text-center max-w-4xl">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Grow your business on <br className="hidden sm:block"/>
                            <span className="text-blue-600">allchat</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed max-w-2xl mx-auto">
                            Launch high-conversion campaigns in minutes. Reach users directly in their conversations
                            with <strong>Text</strong>, <strong>Image</strong>, and <strong>Video</strong> ads.
                        </p>
                    </div>

                    <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                        <Link href={`/auth?view=register&redirect=${encodeURIComponent("/portal")}`}
                              className="w-full sm:w-auto">
                            <button
                                className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95">
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </button>
                        </Link>

                        <Link href={`/auth?view=login&redirect=${encodeURIComponent("/portal")}`}
                              className="w-full sm:w-auto">
                            <button
                                className="w-full inline-flex items-center justify-center rounded-xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-base font-bold text-foreground shadow-sm transition-all duration-200 hover:bg-card/80 active:scale-95">
                                Log in
                            </button>
                        </Link>
                    </div>

                    <div className="mt-24 w-full">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-foreground">Choose your format</h2>
                        </div>

                        <div className="grid w-full gap-6 sm:grid-cols-3">
                            {adFormats.map((format) => {
                                let Icon = FileText
                                switch (format.type) {
                                    case AdFormatType.TEXT:
                                        Icon = MessageSquare
                                        break
                                    case AdFormatType.PHOTO:
                                        Icon = ImageIcon
                                        break
                                    case AdFormatType.VIDEO:
                                        Icon = Video
                                        break
                                }

                                return (
                                    <div
                                        key={format.id}
                                        className="group relative h-full rounded-3xl bg-card p-6 shadow-lg border border-border flex flex-col items-start transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl"
                                    >
                                        <div
                                            className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-100 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                                            <Icon className="h-6 w-6"/>
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            {format.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {format.description}
                                        </p>

                                        <div className="mt-auto flex w-full flex-col gap-3 pt-6">
                                            {/* Landing only renders for guests/anon, so send them through
                                                registration and return to the chosen campaign format after. */}
                                            <Link
                                                href={`/auth?view=register&redirect=${encodeURIComponent(`/portal/campaign?formatId=${format.id}`)}`}
                                                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
                                            >
                                                Create Campaign
                                                <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Link>

                                            <AdPreviewButton
                                                ad={format.previewAd}
                                                title={`${format.title} Preview`}
                                                className="h-auto w-full border-border bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-border hover:bg-card"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div
                        className="mt-20 flex flex-wrap justify-center gap-8 text-center text-muted-foreground opacity-80">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            <span className="font-medium">Reaching thousands of daily users</span>
                        </div>
                        <div className="w-px h-6 bg-muted hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5"/>
                            <span className="font-medium">Real-time performance tracking</span>
                        </div>
                    </div>

                    {/* Legal links */}
                    <div className="mt-16 w-full max-w-md sm:max-w-none pb-16">
                        <div
                            className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-0 rounded-2xl bg-card/60 backdrop-blur-sm border border-border shadow-sm p-3 sm:p-2">
                            <button
                                onClick={() => open(<div className="max-w-4xl"><TermsOfService/></div>)}
                                className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98]"
                            >
                                <BookOpen className="h-4 w-4 shrink-0"/>
                                Terms of Service
                            </button>

                            <div className="hidden sm:block w-px self-stretch bg-muted/80 my-1.5"/>
                            <div className="sm:hidden h-px w-full bg-muted/80"/>

                            <button
                                onClick={() => open(<div className="max-w-4xl"><PrivacyPolicy/></div>)}
                                className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98]"
                            >
                                <Shield className="h-4 w-4 shrink-0"/>
                                Privacy Policy
                            </button>

                            <div className="hidden sm:block w-px self-stretch bg-muted/80 my-1.5"/>
                            <div className="sm:hidden h-px w-full bg-muted/80"/>

                            <button
                                onClick={() => open(<div className="max-w-4xl"><AdvertiserTerms/></div>)}
                                className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98]"
                            >
                                <FileCheck className="h-4 w-4 shrink-0"/>
                                Advertiser Terms
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
