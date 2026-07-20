"use client";

import React from "react";
import {AlertTriangle, Info} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {useGetBanAdsSummaryQuery} from "@ads/store/services/adminAdsApi";
import {useGetBanPromotionsSummaryQuery} from "@ads/store/services/adminPromotedMessagesApi";
import {BanAdsSummary} from "@ads/models/ad";
import {BanPromotionsSummary} from "@ads/models/promoted-message";

interface BanAdsPurchaseInfoProps {
    userId: string;
    banType: BanTypeEnum;
    // The "delete messages" option is checked on the ban form
    deleteMessagesEnabled?: boolean;
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

function buildPromotionsSummary(summary: BanPromotionsSummary): string {
    const segments = [
        {count: summary.pendingCount, label: "pending"},
        {count: summary.approvedCount, label: "approved"},
        {count: summary.deniedCount, label: "denied"},
        {count: summary.canceledCount, label: "canceled"},
    ].filter((segment) => segment.count > 0);

    const promotionsWord = summary.totalPromotions === 1 ? "promoted message" : "promoted messages";
    return `This user has ${summary.totalPromotions} ${promotionsWord}: ${segments
        .map((segment) => `${segment.count} ${segment.label}`)
        .join(", ")}.`;
}

function buildPromotionsRefundWarning(summary: BanPromotionsSummary): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: summary.currency || "USD",
        }).format(amount);

    const parts: string[] = [];
    if (summary.pendingCount > 0) {
        const holdsWord = summary.pendingCount === 1 ? "pending hold" : "pending holds";
        parts.push(`${summary.pendingCount} ${holdsWord} totaling ${formatCurrency(summary.pendingReleaseTotal)} will be released`);
    }
    if (summary.approvedCount > 0) {
        const promotionsWord = summary.approvedCount === 1 ? "approved promotion" : "approved promotions";
        parts.push(`${summary.approvedCount} ${promotionsWord} totaling ${formatCurrency(summary.approvedRefundTotal)} will be refunded`);
    }
    return `${parts.join(" and ")} when this permanent ban is applied. All of this user's promotions will be canceled.`;
}

function buildDeletedMessagesPromotionsWarning(summary: BanPromotionsSummary): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: summary.currency || "USD",
        }).format(amount);

    const parts: string[] = [];
    if (summary.pendingCount > 0) {
        const holdsWord = summary.pendingCount === 1 ? "pending hold" : "pending holds";
        parts.push(`${summary.pendingCount} ${holdsWord} totaling ${formatCurrency(summary.pendingReleaseTotal)} will be released`);
    }
    if (summary.approvedCount > 0) {
        const promotionsWord = summary.approvedCount === 1 ? "approved promotion" : "approved promotions";
        parts.push(`${summary.approvedCount} ${promotionsWord} will be stopped without a refund`);
    }
    return `Deleting this user's messages also cancels the promotions on those messages: ${parts.join("; ")}.`;
}

export default function BanAdsPurchaseInfo({userId, banType, deleteMessagesEnabled = false}: BanAdsPurchaseInfoProps) {
    const numericUserId = Number(userId);
    const skip = !userId || Number.isNaN(numericUserId);
    const {data, isLoading, isError} = useGetBanAdsSummaryQuery(numericUserId, {skip});
    const {
        data: promotionsData,
        isLoading: promotionsLoading,
        isError: promotionsError,
    } = useGetBanPromotionsSummaryQuery(numericUserId, {skip});

    // Never block the ban flow: no banner while loading, on error (e.g. the
    // ads module being down) or when the user has no purchases/promotions.
    const showAds = !isLoading && !isError && !!data && data.totalAds > 0;
    const showPromotions = !promotionsLoading && !promotionsError && !!promotionsData
        && promotionsData.totalPromotions > 0;

    if (!showAds && !showPromotions) {
        return null;
    }

    const showRefundWarning = showAds && banType === BanTypeEnum.PERMANENT && data.pendingRefundCount > 0;
    const refundTotal = showAds ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data.currency || "USD",
    }).format(data.pendingRefundTotal) : "";
    const pendingAdsWord = showAds && data.pendingRefundCount === 1 ? "pending ad" : "pending ads";

    const showPromotionsRefundWarning = showPromotions
        && banType === BanTypeEnum.PERMANENT
        && (promotionsData.pendingCount > 0 || promotionsData.approvedCount > 0);

    // Non-permanent ban with "delete messages": promotions on the deleted
    // messages are canceled too (the permanent-ban warning above covers the rest).
    const showDeletedMessagesPromotionsWarning = showPromotions
        && deleteMessagesEnabled
        && banType !== BanTypeEnum.PERMANENT
        && (promotionsData.pendingCount > 0 || promotionsData.approvedCount > 0);

    return (
        <div className="space-y-3">
            {showAds && (
                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Ads purchases</AlertTitle>
                    <AlertDescription>{buildPurchaseSummary(data)}</AlertDescription>
                </Alert>
            )}

            {showRefundWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Pending purchases will be refunded</AlertTitle>
                    <AlertDescription>
                        {`${data.pendingRefundCount} ${pendingAdsWord} totaling ${refundTotal} will be automatically refunded in full when this permanent ban is applied.`}
                    </AlertDescription>
                </Alert>
            )}

            {showPromotions && (
                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Promoted messages</AlertTitle>
                    <AlertDescription>{buildPromotionsSummary(promotionsData)}</AlertDescription>
                </Alert>
            )}

            {showPromotionsRefundWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Promotions will be released/refunded</AlertTitle>
                    <AlertDescription>{buildPromotionsRefundWarning(promotionsData)}</AlertDescription>
                </Alert>
            )}

            {showDeletedMessagesPromotionsWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Promotions on deleted messages will be canceled</AlertTitle>
                    <AlertDescription>{buildDeletedMessagesPromotionsWarning(promotionsData)}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
