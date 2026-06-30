'use client';

import React, {Suspense, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {AlertTriangle, Clock, Shield} from "lucide-react";
import {Ban} from "@/models/Ban";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {getReportTypeLabel} from "@/lib/reportUtils";

function BannedPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const banParam = searchParams.get("ban") ?? searchParams.get("reason");

    const [banInfo, setBanInfo] = useState<Ban | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (banParam) {
            setLoading(true);
            try {
                const parsed: Ban = JSON.parse(decodeURIComponent(banParam));
                setBanInfo(parsed);
            } catch (e) {
                console.error("Failed to parse ban info:", e);
            } finally {
                setLoading(false);
            }
        }
    }, [banParam]);

    useEffect(() => {
        if (!banInfo || banInfo.type !== BanTypeEnum.TEMPORARY || !banInfo.expiresAt) {
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(banInfo.expiresAt!).getTime();
            const difference = expiry - now;

            if (difference <= 0) {
                clearInterval(interval);
                router.push("/auth");
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [banInfo, router]);

    const isPermanent = banInfo?.type === BanTypeEnum.PERMANENT;
    const isTemporary = banInfo?.type === BanTypeEnum.TEMPORARY;

    return (
        <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-md">
                <div
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-red-100 /80 p-4 sm:p-6 md:p-8 text-center shadow-2xl backdrop-blur-sm space-y-4 sm:space-y-6">
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-orange-500"></div>

                    <div
                        className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-red-50 bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
                        {isPermanent ? (
                            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-red-600"/>
                        ) : (
                            <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600"/>
                        )}
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                            <h1 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent">
                                Access Restricted
                            </h1>

                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0"/>
                                <p className="text-base sm:text-xl font-semibold text-red-600">
                                    Account {isPermanent ? "Permanently" : "Temporarily"} Suspended
                                </p>
                            </div>
                        </div>

                        {banInfo ? (
                            <div className="text-left space-y-3 sm:space-y-4">
                                <div className="rounded-lg bg-gray-50 p-3 sm:p-4 space-y-2 sm:space-y-3">
                                    <div>
                                        <span
                                            className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600">Reason</span>
                                        <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                                            {getReportTypeLabel(banInfo.reportType)}
                                        </p>
                                    </div>

                                    <div>
                                        <span
                                            className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600">Type</span>
                                        <p className="text-sm sm:text-base font-medium capitalize text-gray-900">{banInfo.type.toLowerCase()}</p>
                                    </div>

                                    {isTemporary && banInfo.expiresAt && (
                                        <div>
                                            <span
                                                className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600">
                                                Expires At
                                            </span>
                                            <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                                                {new Date(banInfo.expiresAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isTemporary && timeRemaining && (
                                    <div
                                        className="rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-3 sm:p-4">
                                        <div className="mb-2 flex items-center justify-center gap-2">
                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0"/>
                                            <span
                                                className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-orange-800">
                                                Time Remaining
                                            </span>
                                        </div>
                                        <p className="text-center font-mono text-xl sm:text-2xl font-bold text-orange-900 break-all">
                                            {timeRemaining}
                                        </p>
                                        <p className="mt-2 text-center text-xs text-orange-700">
                                            You will be automatically redirected when the ban expires
                                        </p>
                                    </div>
                                )}

                                {banInfo.description && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                                        <span
                                            className="mb-2 block text-xs sm:text-sm font-semibold uppercase tracking-wide text-blue-700">
                                            Additional Information
                                        </span>
                                        <p className="text-sm sm:text-base leading-relaxed text-blue-900 break-words">{banInfo.description}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                                <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                                    Your access to this service has been restricted due to a violation of our terms of
                                    service.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BannedPageFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-md">
                <div
                    className="rounded-xl sm:rounded-2xl border border-red-100 /80 p-4 sm:p-6 md:p-8 text-center shadow-2xl backdrop-blur-sm space-y-4 sm:space-y-6">
                    <div
                        className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 animate-pulse items-center justify-center rounded-full border-4 border-red-50 bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
                        <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-red-600"/>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent">
                            Loading...
                        </h1>
                        <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                            <p className="text-sm sm:text-base text-gray-700">Please wait while we load your ban
                                information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BannedPage() {
    return (
        <Suspense fallback={<BannedPageFallback/>}>
            <BannedPageContent/>
        </Suspense>
    );
}
