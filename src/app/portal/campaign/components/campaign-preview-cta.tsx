'use client';

import {AnimatePresence, motion} from "framer-motion";
import {Loader2, Sparkles} from "lucide-react";
import {AdPreviewButton} from "@ads/components/ad-preview/ad-preview-button";
import {PreviewAdData} from "@ads/components/ad-preview/preview-utils";

interface CampaignPreviewCtaProps {
    ad: PreviewAdData;
    title: string;
    canPreview: boolean;
    isWaitingForMedia: boolean;
}

export default function CampaignPreviewCta({
                                               ad,
                                               title,
                                               canPreview,
                                               isWaitingForMedia,
                                           }: CampaignPreviewCtaProps) {
    return (
        <AnimatePresence initial={false}>
            {(canPreview || isWaitingForMedia) && (
                <motion.div
                    key={canPreview ? "preview-ready" : "preview-pending"}
                    initial={{opacity: 0, y: 14, scale: 0.98}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: -10, scale: 0.98}}
                    transition={{duration: 0.28, ease: "easeOut"}}
                    className="rounded-2xl border border-border bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#0b1120_100%)] p-4 shadow-sm sm:p-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 shadow-sm">
                                {isWaitingForMedia && !canPreview ? (
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                ) : (
                                    <Sparkles className="h-5 w-5"/>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {canPreview ? "Preview your ad inside chat" : "Preview unlocks when media is ready"}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {canPreview
                                        ? "This is a preview of how the advertisement will look on the allchat platform."
                                        : "We will show the preview button as soon as the uploaded media has a shareable URL for the preview app."}
                                </p>
                            </div>
                        </div>

                        {canPreview ? (
                            <AdPreviewButton
                                ad={ad}
                                title={title}
                                className="h-auto w-full border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-border hover:bg-muted sm:w-auto"
                            />
                        ) : (
                            <div
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Preparing preview
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
