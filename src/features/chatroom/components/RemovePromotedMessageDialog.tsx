import React from "react";
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
    onConfirm: () => void;
}

// Confirmation shown before removing a chat message that has an active
// promotion: removal cascades into canceling the promotion on the backend.
export default function RemovePromotedMessageDialog({
                                                        open,
                                                        onOpenChange,
                                                        promotionStatus,
                                                        onConfirm,
                                                    }: RemovePromotedMessageDialogProps) {
    const isApproved = promotionStatus === "APPROVED";

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
