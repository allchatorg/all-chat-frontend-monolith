'use client'
import {SiteHeader} from "@ads/components/site-header";
import PromotedMessageDetails from "@ads/components/promoted-message-details";
import {Card, CardContent} from "@ads/components/ui/card";
import {ActionButton} from "@ads/components/ui/action-button";
import {CheckCircle, ExternalLink, Loader2, User} from "lucide-react";
import {PromotionReasonModal} from "@ads/components/promotion-reason-modal";
import {useParams, useRouter} from "next/navigation";
import {
    useApprovePromotedMessageMutation,
    useCancelPromotedMessageMutation,
    useDenyPromotedMessageMutation,
    useGetPromotedMessageByIdQuery,
} from "@ads/store/services/adminPromotedMessagesApi";
import {PromotedMessageStatus} from "@ads/models/promoted-message";
import {toast} from "sonner";

export default function AdminPromotedMessageDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const promotionId = Number(params.id);

    const {data, isLoading, error} = useGetPromotedMessageByIdQuery(promotionId);
    const [approvePromotion, {isLoading: isApproving}] = useApprovePromotedMessageMutation();
    const [denyPromotion, {isLoading: isDenying}] = useDenyPromotedMessageMutation();
    const [cancelPromotion, {isLoading: isCanceling}] = useCancelPromotedMessageMutation();

    const isPending = data?.status === PromotedMessageStatus.PENDING;
    const isApproved = data?.status === PromotedMessageStatus.APPROVED;
    const isMutating = isApproving || isDenying || isCanceling;

    const handleApprove = async () => {
        if (!data) return;
        try {
            await approvePromotion(data.id).unwrap();
            toast.success("Promotion approved. The payment has been captured.");
        } catch {
            toast.error("Failed to approve the promotion. Please try again.");
        }
    };

    const handleDeny = async (reason: string) => {
        if (!data) return;
        try {
            await denyPromotion({promotionId: data.id, reason}).unwrap();
            toast.success("Promotion denied. The payment hold has been released.");
        } catch {
            toast.error("Failed to deny the promotion. Please try again.");
        }
    };

    const handleCancel = async (reason: string) => {
        if (!data) return;
        try {
            await cancelPromotion({promotionId: data.id, reason}).unwrap();
            toast.success(isApproved
                ? "Promotion stopped. The payment was not refunded."
                : "Promotion canceled. The payment hold has been released.");
        } catch {
            toast.error("Failed to cancel the promotion. Please try again.");
        }
    };

    const handleGoToMessage = () => {
        if (!data) return;
        router.push(`/?chatRoomId=${data.chatRoomId}&jumpTo=${data.messageId}`);
    };

    const handleViewProfile = () => {
        if (data?.userId) router.push(`/portal/admin/users/${data.userId}`);
    };

    if (isLoading) {
        return (
            <div>
                <SiteHeader title={'Promoted Message Details'} description={''}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="flex items-center justify-center p-12">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Loading promotion details...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div>
                <SiteHeader title={'Promoted Message Details'} description={''}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="p-12">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-lg font-semibold text-destructive">Error Loading Promotion</p>
                                    <p className="text-sm text-muted-foreground">
                                        {error && 'status' in error
                                            ? `Failed to load promotion details. Status: ${error.status}`
                                            : 'An unexpected error occurred while loading the promotion.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <SiteHeader title={'Promoted Message Details'} description={`Promotion #${data.id}`}/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <div className="mx-4 mt-4 flex flex-wrap gap-2">
                            {isPending && (
                                <ActionButton onClick={handleApprove} disabled={isMutating}>
                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                    {isApproving ? 'Approving...' : 'Approve'}
                                </ActionButton>
                            )}
                            {isPending && (
                                <PromotionReasonModal mode="deny" onSubmit={handleDeny} disabled={isMutating}/>
                            )}
                            {/* For PENDING, canceling only appears as the "accept the user's
                                cancellation request" action — the normal review outcome is Deny. */}
                            {(isApproved || (isPending && data.cancelRequested)) && (
                                <PromotionReasonModal
                                    mode={isApproved ? "cancel-approved" : "cancel-pending"}
                                    onSubmit={handleCancel}
                                    disabled={isMutating}
                                />
                            )}
                            <ActionButton onClick={handleGoToMessage} variant="default"
                                          className="bg-transparent border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 shadow-none">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Go to Message
                            </ActionButton>
                            {data.userId && (
                                <ActionButton
                                    onClick={handleViewProfile}
                                    variant="default"
                                    className="bg-transparent border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 shadow-none"
                                >
                                    <User className="mr-2 h-4 w-4"/>
                                    View Profile
                                </ActionButton>
                            )}
                        </div>

                        <PromotedMessageDetails className="m-4 mt-0" data={data} isAdmin={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
