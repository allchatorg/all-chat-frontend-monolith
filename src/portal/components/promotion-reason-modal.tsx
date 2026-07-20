"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {Textarea} from "@ads/components/ui/textarea";
import {Button} from "@ads/components/ui/button";
import {ActionButton} from "@ads/components/ui/action-button";
import {AlertTriangle, XCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ads/components/ui/dialog";

interface PromotionReasonForm {
    reason: string;
}

export type PromotionReasonMode = "deny" | "cancel-pending" | "cancel-approved" | "request-cancel";

interface PromotionReasonModalProps {
    // Admin: deny (PENDING), cancel-pending (hold released), cancel-approved
    // (promotion stopped, NO refund). User: request-cancel (PENDING only).
    mode: PromotionReasonMode;
    onSubmit: (reason: string) => void;
    disabled?: boolean;
}

const MODE_CONFIG: Record<PromotionReasonMode, {
    triggerLabel: string;
    title: string;
    description: string;
    confirmLabel: string;
    placeholder: string;
}> = {
    "deny": {
        triggerLabel: "Deny",
        title: "Deny Promotion",
        description: "This will deny the promotion and release the payment hold in full.",
        confirmLabel: "Confirm Denial",
        placeholder: "Enter a detailed reason for denial...",
    },
    "cancel-pending": {
        triggerLabel: "Cancel & Release Hold",
        title: "Cancel Promotion",
        description: "This cancels the pending promotion and releases the payment hold back to the user in full. " +
            "A reason is required.",
        confirmLabel: "Confirm Cancellation",
        placeholder: "Enter a detailed reason for cancellation...",
    },
    "cancel-approved": {
        triggerLabel: "Stop Promotion",
        title: "Stop Promotion",
        description: "This stops the promotion immediately: the PROMOTED badge is removed and the message is " +
            "dropped from the room's Promoted Messages sidebar. The captured payment will NOT be refunded. " +
            "A reason is required.",
        confirmLabel: "Stop Promotion",
        placeholder: "Enter a detailed reason for stopping this promotion...",
    },
    "request-cancel": {
        triggerLabel: "Request Cancellation",
        title: "Request Cancellation",
        description: "Your promotion is awaiting review. An admin will review your request — if it is accepted, " +
            "the $0.50 hold on your card is released in full.",
        confirmLabel: "Submit Request",
        placeholder: "Tell us why you want this promotion canceled...",
    },
};

// Copy of reject-ad-modal.tsx generalized with a mode prop for promotions.
export function PromotionReasonModal({mode, onSubmit, disabled = false}: PromotionReasonModalProps) {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<PromotionReasonForm>({
        defaultValues: {
            reason: "",
        },
    });

    const config = MODE_CONFIG[mode];

    const onFormSubmit = (data: PromotionReasonForm) => {
        onSubmit(data.reason);
        reset();
        setOpen(false);
    };

    const handleCancel = () => {
        reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <ActionButton
                    variant="negative"
                    className="flex-1 sm:flex-none"
                    disabled={disabled}
                >
                    <XCircle className="mr-2 h-4 w-4"/>
                    {config.triggerLabel}
                </ActionButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 dark:bg-red-950 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400"/>
                        </div>
                        <div>
                            <DialogTitle className="text-lg">{config.title}</DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                {config.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason</label>
                        <Textarea
                            placeholder={config.placeholder}
                            {...register("reason", {
                                required: "Reason is required",
                            })}
                            className="min-h-[120px] resize-none"
                        />
                        {errors.reason && (
                            <div className="flex items-center text-sm text-red-600 dark:text-red-400 space-x-2">
                                <AlertTriangle className="h-4 w-4"/>
                                <span>{errors.reason.message}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <ActionButton
                            type="submit"
                            variant="negative"
                            className="flex-1"
                        >
                            {config.confirmLabel}
                        </ActionButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
