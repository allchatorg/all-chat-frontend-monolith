"use client";

import React, {useEffect, useState} from "react";
import {AlertTriangle, Info} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {getUserAdminDetails} from "@/api/admin/adminAPI";
import {useGetBanAdsSummaryQuery} from "@ads/store/services/adminAdsApi";
import {useGetBanPromotionsSummaryQuery} from "@ads/store/services/adminPromotedMessagesApi";
import {useGetBanRoomPromotionsSummaryQuery} from "@ads/store/services/adminRoomPromotionsApi";
import {BanAdsSummary} from "@ads/models/ad";
import {BanPromotionsSummary} from "@ads/models/promoted-message";
import {BanRoomPromotionsSummary} from "@ads/models/room-promotion";

interface BanAdsPurchaseInfoProps {
    userId: string;
    // Undefined until staff pick one on the ban form
    banType?: BanTypeEnum;
    // The "delete messages" option is checked on the ban form
    deleteMessagesEnabled?: boolean;
}

function buildPurchaseSummary(summary: BanAdsSummary): string {
    const segments = [
        {count: summary.activeCount, label: "active"},
        {count: summary.completedCount, label: "completed"},
        {count: summary.pendingCount, label: "pending"},
        {count: summary.rejectedCount, label: "rejected"},
        {count: summary.stoppedCount, label: "stopped"},
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

function buildRoomPromotionsSummary(summary: BanRoomPromotionsSummary): string {
    const segments = [
        {count: summary.pendingCount, label: "pending"},
        {count: summary.approvedCount, label: "approved"},
        {count: summary.deniedCount, label: "denied"},
        {count: summary.canceledCount, label: "canceled"},
    ].filter((segment) => segment.count > 0);

    const promotionsWord = summary.totalPromotions === 1 ? "room promotion" : "room promotions";
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
        parts.push(`${summary.pendingCount} ${holdsWord} totaling ${formatCurrency(summary.pendingReleaseTotal)} will be released when this permanent ban is applied`);
    }
    if (summary.approvedCount > 0) {
        const promotionsWord = summary.approvedCount === 1 ? "approved promotion" : "approved promotions";
        parts.push(`${summary.approvedCount} ${promotionsWord} will be stopped and will NOT be refunded`);
    }
    return `${parts.join("; ")}.`;
}

function buildRoomPromotionsBanWarning(summary: BanRoomPromotionsSummary): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: summary.currency || "USD",
        }).format(amount);

    const parts: string[] = [];
    if (summary.pendingCount > 0) {
        const holdsWord = summary.pendingCount === 1 ? "pending room promotion hold" : "pending room promotion holds";
        parts.push(`${summary.pendingCount} ${holdsWord} totaling ${formatCurrency(summary.pendingReleaseTotal)} will be canceled and released when this permanent ban is applied`);
    }
    if (summary.approvedCount > 0) {
        const promotionsWord = summary.approvedCount === 1 ? "approved room promotion" : "approved room promotions";
        parts.push(`${summary.approvedCount} ${promotionsWord} totaling ${formatCurrency(summary.approvedCapturedTotal)} will be stopped and will NOT be refunded`);
    }
    return `${parts.join("; ")}.`;
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
    const {
        data: roomPromotionsData,
        isLoading: roomPromotionsLoading,
        isError: roomPromotionsError,
    } = useGetBanRoomPromotionsSummaryQuery(numericUserId, {skip});

    // A failed lookup reads as "no membership", like the purchase summaries below.
    const [vipActive, setVipActive] = useState(false);
    useEffect(() => {
        if (skip) return;

        let cancelled = false;
        getUserAdminDetails(numericUserId)
            .then((user) => {
                if (!cancelled) setVipActive(user.vipActive === true);
            })
            .catch(() => {
                if (!cancelled) setVipActive(false);
            });

        return () => {
            cancelled = true;
        };
    }, [numericUserId, skip]);

    // Never block the ban flow: no banner while loading, on error (e.g. the
    // ads module being down) or when the user has no purchases/promotions.
    const showAds = !isLoading && !isError && !!data && data.totalAds > 0;
    const showPromotions = !promotionsLoading && !promotionsError && !!promotionsData
        && promotionsData.totalPromotions > 0;
    const showRoomPromotions = !roomPromotionsLoading && !roomPromotionsError && !!roomPromotionsData
        && roomPromotionsData.totalPromotions > 0;

    const showVipWarning = vipActive && banType === BanTypeEnum.PERMANENT;

    if (!showAds && !showPromotions && !showRoomPromotions && !showVipWarning) {
        return null;
    }

    const showRefundWarning = showAds && banType === BanTypeEnum.PERMANENT && data.pendingRefundCount > 0;
    const refundTotal = showAds ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data.currency || "USD",
    }).format(data.pendingRefundTotal) : "";
    const pendingAdsWord = showAds && data.pendingRefundCount === 1 ? "pending ad" : "pending ads";
    const showActiveAdsWarning = showAds && banType === BanTypeEnum.PERMANENT && data.activeCount > 0;
    const activeAdsWord = showAds && data.activeCount === 1 ? "active ad" : "active ads";

    const showPromotionsRefundWarning = showPromotions
        && banType === BanTypeEnum.PERMANENT
        && (promotionsData.pendingCount > 0 || promotionsData.approvedCount > 0);

    const showRoomPromotionsBanWarning = showRoomPromotions
        && banType === BanTypeEnum.PERMANENT
        && (roomPromotionsData.pendingCount > 0 || roomPromotionsData.approvedCount > 0);

    // Any ban with "delete messages" (permanent included): promotions on the
    // deleted messages are canceled — pending holds released, approved kept.
    const showDeletedMessagesPromotionsWarning = showPromotions
        && deleteMessagesEnabled
        && (promotionsData.pendingCount > 0 || promotionsData.approvedCount > 0);

    return (
        <div className="space-y-3">
            {showVipWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>VIP renewal will stop</AlertTitle>
                    <AlertDescription>
                        This user is a VIP member. A permanent ban stops the membership from renewing: it runs
                        to the end of the paid period, nothing is refunded, and revoking the ban does not
                        turn renewal back on.
                    </AlertDescription>
                </Alert>
            )}

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

            {showActiveAdsWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Active ads will be stopped</AlertTitle>
                    <AlertDescription>
                        {`${data.activeCount} ${activeAdsWord} will be stopped and will NOT be refunded when this permanent ban is applied.`}
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
                    <AlertTitle>
                        {promotionsData.pendingCount > 0
                            ? "Pending promotion holds will be released"
                            : "Approved promotions will be stopped"}
                    </AlertTitle>
                    <AlertDescription>{buildPromotionsRefundWarning(promotionsData)}</AlertDescription>
                </Alert>
            )}

            {showRoomPromotions && (
                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Room promotions</AlertTitle>
                    <AlertDescription>{buildRoomPromotionsSummary(roomPromotionsData)}</AlertDescription>
                </Alert>
            )}

            {showRoomPromotionsBanWarning && (
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>
                        {roomPromotionsData.pendingCount > 0
                            ? "Pending room promotions will be canceled"
                            : "Approved room promotions will be stopped"}
                    </AlertTitle>
                    <AlertDescription>{buildRoomPromotionsBanWarning(roomPromotionsData)}</AlertDescription>
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
