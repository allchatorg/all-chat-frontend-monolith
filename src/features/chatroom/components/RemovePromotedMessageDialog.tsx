import React from "react";
import {useRouter} from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {PromotionStatus} from "@/models/message";

interface RemovePromotedMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promotionStatus: PromotionStatus;
    // Owner viewing a PENDING promotion: removal is blocked — the dialog only
    // points to the ads portal to request a cancellation, with no Remove action.
    ownerPendingBlock?: boolean;
    promotionId?: number;
    onConfirm: () => void;
}

// Confirmation shown before removing a chat message that has an active
// promotion: removal cascades into canceling the promotion on the backend.
// For the owner of a PENDING promotion it is informational instead — the
// promotion must be canceled via the ads portal before the message can go.
export default function RemovePromotedMessageDialog({
                                                        open,
                                                        onOpenChange,
                                                        promotionStatus,
                                                        ownerPendingBlock = false,
                                                        promotionId,
                                                        onConfirm,
                                                    }: RemovePromotedMessageDialogProps) {
    const router = useRouter();
    const isApproved = promotionStatus === "APPROVED";

    if (ownerPendingBlock) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Promotion pending review</AlertDialogTitle>
                        <AlertDialogDescription>
                            This message can&apos;t be removed while its promotion is awaiting review.
                            Request a promotion cancellation in the ads portal — once the promotion
                            is canceled you can remove the message.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onOpenChange(false);
                                router.push(promotionId
                                    ? `/portal/promoted-messages/${promotionId}`
                                    : "/portal/promoted-messages");
                            }}
                        >
                            Go to Ads Portal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isApproved ? "Remove promoted message?" : "Remove message with pending promotion?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isApproved
                            ? "This message is promoted. Removing it also stops the promotion and removes it from the room's Promoted Messages list. The payment will not be refunded."
                            : "This message has a promotion awaiting review. Removing it cancels the promotion request and releases the $0.50 hold in full."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep Message</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Remove Message
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
