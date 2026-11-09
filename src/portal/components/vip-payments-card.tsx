"use client";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {PromotionReasonModal} from "@ads/components/promotion-reason-modal";
import {useGetVipPaymentsQuery, useRefundVipPaymentMutation} from "@ads/store/services/adminVipApi";
import {formatUsd} from "@ads/lib/revenue-format";
import {toast} from "sonner";

// Super-admin only: the backend refuses these endpoints for everyone else.
export function VipPaymentsCard({userId}: { userId: number }) {
    const {data: payments, isLoading} = useGetVipPaymentsQuery(userId);
    const [refundPayment, {isLoading: isRefunding}] = useRefundVipPaymentMutation();

    if (isLoading || !payments || payments.length === 0) {
        return null;
    }

    const handleRefund = async (invoiceId: string, reason: string) => {
        try {
            await refundPayment({userId, invoiceId, reason}).unwrap();
            toast.success("VIP payment refunded.");
        } catch {
            toast.error("Failed to refund the VIP payment. Please try again.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>allchat VIP Payments</CardTitle>
                <CardDescription>Refunds go back to the card and are recorded in the audit log</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {payments.map((payment) => {
                    const fullyRefunded = payment.refundedCents >= payment.paidCents;
                    return (
                        <div key={payment.invoiceId}
                             className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                            <div>
                                <p className="text-base font-semibold">{formatUsd(payment.paidCents / 100)}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(payment.paidAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {payment.refundedCents > 0 && (
                                <Badge variant="secondary">
                                    {fullyRefunded ? "Refunded" : `${formatUsd(payment.refundedCents / 100)} refunded`}
                                </Badge>
                            )}
                            {!fullyRefunded && (
                                <PromotionReasonModal
                                    mode="vip-refund"
                                    onSubmit={(reason) => handleRefund(payment.invoiceId, reason)}
                                    disabled={isRefunding}
                                />
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
