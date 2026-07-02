"use client";

import React from "react";
import {AlertTriangle, Info} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {useGetBanAdsSummaryQuery} from "@ads/store/services/adminAdsApi";
import {BanAdsSummary} from "@ads/models/ad";

interface BanAdsPurchaseInfoProps {
    userId: string;
    banType: BanTypeEnum;
}

function buildPurchaseSummary(summary: BanAdsSummary): string {
    const segments = [
        {count: summary.activeCount, label: "active"},
        {count: summary.completedCount, label: "completed"},
        // Staff-facing copy calls SUBMITTED ads "pending" (awaiting approval).
        {count: summary.submittedCount, label: "pending"},
        {count: summary.rejectedCount, label: "rejected"},
    ].filter((segment) => segment.count > 0);

    const adsWord = summary.totalAds === 1 ? "ad" : "ads";
    return `This user has bought ${summary.totalAds} ${adsWord}: ${segments
        .map((segment) => `${segment.count} ${segment.label}`)
        .join(", ")}.`;
}

export default function BanAdsPurchaseInfo({userId, banType}: BanAdsPurchaseInfoProps) {
    const numericUserId = Number(userId);
    const {data, isLoading, isError} = useGetBanAdsSummaryQuery(numericUserId, {
        skip: !userId || Number.isNaN(numericUserId),
    });

    // Never block the ban flow: no banner while loading, on error (e.g. the
    // ads module being down) or when the user has no purchases.
    if (isLoading || isError || !data || data.totalAds === 0) {
        return null;
    }

    const showRefundWarning = banType === BanTypeEnum.PERMANENT && data.pendingRefundCount > 0;
    const refundTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data.currency || "USD",
    }).format(data.pendingRefundTotal);
    const pendingAdsWord = data.pendingRefundCount === 1 ? "pending ad" : "pending ads";

    return (
        <div className="space-y-3">
            <Alert>
                <Info className="h-4 w-4"/>
                <AlertTitle>Ads purchases</AlertTitle>
                <AlertDescription>{buildPurchaseSummary(data)}</AlertDescription>
            </Alert>

            {showRefundWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Pending purchases will be refunded</AlertTitle>
                    <AlertDescription>
                        {`${data.pendingRefundCount} ${pendingAdsWord} totaling ${refundTotal} will be automatically refunded in full when this permanent ban is applied.`}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
