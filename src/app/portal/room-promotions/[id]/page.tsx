'use client'
import {SiteHeader} from "@ads/components/site-header";
import RoomPromotionDetails from "@ads/components/room-promotion-details";
import {Card, CardContent} from "@ads/components/ui/card";
import {ActionButton} from "@ads/components/ui/action-button";
import {ExternalLink, Loader2} from "lucide-react";
import {PromotionReasonModal} from "@ads/components/promotion-reason-modal";
import {useParams, useRouter} from "next/navigation";
import {
    useGetRoomPromotionByIdQuery,
    useRequestCancelRoomPromotionMutation,
} from "@ads/store/services/roomPromotionsApi";
import {RoomPromotionStatus} from "@ads/models/room-promotion";
import {toast} from "sonner";

export default function UserRoomPromotionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const promotionId = Number(params.id);

    const {data, isLoading, error} = useGetRoomPromotionByIdQuery(promotionId);
    const [requestCancel, {isLoading: isRequestingCancel}] = useRequestCancelRoomPromotionMutation();

    const isPending = data?.status === RoomPromotionStatus.PENDING;
    // Owners may only ask to cancel while PENDING (hold released if accepted);
    // APPROVED promotions cannot be self-canceled — the payment is captured and not refunded.
    const canRequestCancel = isPending && !data?.cancelRequested;

    const handleOpenRoom = () => {
        if (!data) return;
        router.push(`/?chatRoomId=${data.chatRoomId}`);
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

    if (isLoading) {
        return (
            <div>
                <SiteHeader title={'Room Promotion Details'} description={''}/>
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
                <SiteHeader title={'Room Promotion Details'} description={''}/>
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
            <SiteHeader title={'Room Promotion Details'} description={`Promotion #${data.id}`}/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <div className="mx-4 mt-4 flex flex-wrap gap-2">
                            {!data.chatRoomArchived && (
                                <ActionButton onClick={handleOpenRoom}>
                                    <ExternalLink className="mr-2 h-4 w-4"/>
                                    Open Room
                                </ActionButton>
                            )}
                            {canRequestCancel && (
                                <PromotionReasonModal
                                    mode="room-request-cancel"
                                    onSubmit={handleRequestCancel}
                                    disabled={isRequestingCancel}
                                />
                            )}
                        </div>

                        <RoomPromotionDetails className="m-4 mt-0" data={data} isAdmin={false}/>
                    </div>
                </div>
            </div>

        </div>
    );
}
