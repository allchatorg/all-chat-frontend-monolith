'use client'
import {useState} from "react";
import {SiteHeader} from "@ads/components/site-header";
import PromotedMessageDetails from "@ads/components/promoted-message-details";
import {Card, CardContent} from "@ads/components/ui/card";
import {ActionButton} from "@ads/components/ui/action-button";
import {ConfirmationDialog} from "@ads/components/ui/confirmation-dialog";
import {ExternalLink, Loader2, Trash2, XCircle} from "lucide-react";
import {PromotionReasonModal} from "@ads/components/promotion-reason-modal";
import {useParams, useRouter} from "next/navigation";
import {
    useCancelPromotedMessageMutation,
    useDeletePromotedMessageMutation,
    useGetPromotedMessageByIdQuery,
    useRequestCancelPromotedMessageMutation,
} from "@ads/store/services/promotedMessagesApi";
import {PromotedMessageStatus} from "@ads/models/promoted-message";
import {toast} from "sonner";

export default function UserPromotedMessageDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const promotionId = Number(params.id);

    const {data, isLoading, error} = useGetPromotedMessageByIdQuery(promotionId);
    const [cancelPromotion, {isLoading: isCanceling}] = useCancelPromotedMessageMutation();
    const [requestCancel, {isLoading: isRequestingCancel}] = useRequestCancelPromotedMessageMutation();
    const [deletePromotion, {isLoading: isDeleting}] = useDeletePromotedMessageMutation();

    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isPending = data?.status === PromotedMessageStatus.PENDING;
    const isApproved = data?.status === PromotedMessageStatus.APPROVED;
    // PENDING promotions are canceled via an admin-reviewed request instead
    const canRequestCancel = isPending && !data?.cancelRequested;
    const canDelete = data?.status === PromotedMessageStatus.DENIED
        || data?.status === PromotedMessageStatus.CANCELED;

    const handleGoToMessage = () => {
        if (!data) return;
        router.push(`/?chatRoomId=${data.chatRoomId}&jumpTo=${data.messageId}`);
    };

    const handleCancel = async () => {
        if (!data) return;
        try {
            await cancelPromotion(data.id).unwrap();
            toast.success("Promotion canceled.");
        } catch {
            toast.error("Failed to cancel the promotion. Please try again.");
        }
    };

    const handleRequestCancel = async (reason: string) => {
        if (!data) return;
        try {
            await requestCancel({id: data.id, reason}).unwrap();
            toast.success("Cancellation request submitted.");
        } catch {
            toast.error("Failed to submit the cancellation request. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!data) return;
        try {
            await deletePromotion(data.id).unwrap();
            toast.success("Promotion deleted.");
            router.push("/portal/promoted-messages");
        } catch {
            toast.error("Failed to delete the promotion. Please try again.");
        }
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
                            <ActionButton onClick={handleGoToMessage}>
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Go to Message
                            </ActionButton>
                            {canRequestCancel && (
                                <PromotionReasonModal
                                    mode="request-cancel"
                                    onSubmit={handleRequestCancel}
                                    disabled={isRequestingCancel}
                                />
                            )}
                            {isApproved && (
                                <ActionButton
                                    variant="negative"
                                    onClick={() => setIsCancelDialogOpen(true)}
                                    disabled={isCanceling}
                                >
                                    <XCircle className="mr-2 h-4 w-4"/>
                                    {isCanceling ? 'Canceling...' : 'Cancel Promotion'}
                                </ActionButton>
                            )}
                            {canDelete && (
                                <ActionButton
                                    variant="negative"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </ActionButton>
                            )}
                        </div>

                        <PromotedMessageDetails className="m-4 mt-0" data={data} isAdmin={false}/>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={handleCancel}
                title="Cancel this promotion?"
                description="The promotion stops immediately and the message loses its PROMOTED badge. The payment will NOT be refunded."
                confirmText="Cancel Promotion"
                cancelText="Keep Promotion"
                variant="destructive"
            />

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete this promotion?"
                description="This removes the promotion record from your list. This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
}
