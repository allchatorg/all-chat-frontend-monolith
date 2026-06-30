"use client";

import {useAnalyticsConsent} from "@/lib/hooks/useAnalyticsConsent";
import {Cookie, X} from "lucide-react";
import {useMemo} from "react";
import {GA_ID} from "@/lib/analytics";
import Script from "next/script";
import {usePathname} from "next/navigation";
import {isAuthFlowRoute} from "@/routes";

export default function GoogleAnalytics() {
    const pathname = usePathname();
    const {consent, setConsent} = useAnalyticsConsent();

    const enabled = useMemo(
        () => Boolean(GA_ID) && consent === "granted",
        [consent]
    );

    const handleConsent = (value: "granted" | "denied") => {
        setConsent(value);
    };

    if (isAuthFlowRoute(pathname)) {
        return enabled ? (
            <>
                <Script
                    id="ga4-src"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="ga4-init" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_ID}');
                    `}
                </Script>
            </>
        ) : null;
    }

    return (
        <>
            {consent === "undecided" && (
                <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none">
                    <div className="mx-auto max-w-xl pointer-events-auto">
                        <div
                            className="
                                relative rounded-lg border shadow-lg backdrop-blur
                                bg-white/90 border-gray-200
                                dark:bg-gray-900/90 dark:border-gray-700
                            "
                        >
                            <button
                                onClick={() => handleConsent("denied")}
                                className="
                                    absolute right-3 top-3 rounded-md p-1 transition-colors
                                    text-gray-400 hover:bg-gray-100 hover:text-gray-500
                                    dark:hover:bg-gray-800 dark:hover:text-gray-300
                                "
                                aria-label="Close"
                            >
                                <X className="h-4 w-4"/>
                            </button>

                            <div className="p-6 pr-12">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-full p-2 bg-blue-50 dark:bg-blue-500/10">
                                            <Cookie className="h-5 w-5 text-blue-600"/>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                            Cookie Preferences
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            We use cookies to analyze traffic and improve your experience.
                                            Your privacy matters to us.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                    <button
                                        onClick={() => handleConsent("denied")}
                                        className="
                                            flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors
                                            text-gray-700 border border-gray-300 hover:bg-gray-50
                                            dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800
                                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                            dark:focus:ring-offset-gray-900
                                        "
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleConsent("granted")}
                                        className="
                                            flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-md
                                            bg-blue-600 hover:bg-blue-700 transition-colors
                                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                            dark:focus:ring-offset-gray-900
                                        "
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {enabled && (
                <>
                    <Script
                        id="ga4-src"
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${GA_ID}');
                        `}
                    </Script>
                </>
            )}
        </>
    );
}
