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

interface RejectAdForm {
    reason: string;
}

interface RejectAdModalProps {
    onReject: (reason: string) => void;
}

export function RejectAdModal({onReject}: RejectAdModalProps) {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<RejectAdForm>({
        defaultValues: {
            reason: "",
        },
    });

    const onFormSubmit = (data: RejectAdForm) => {
        onReject(data.reason);
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
                >
                    <XCircle className="mr-2 h-4 w-4"/>
                    Reject Ad
                </ActionButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 dark:bg-red-950 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400"/>
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Reject Advertisement</DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                This will reject the ad and notify the user
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rejection Reason</label>
                        <Textarea
                            placeholder="Enter a detailed reason for rejection..."
                            {...register("reason", {
                                required: "Rejection reason is required",
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
                            Cancel
                        </Button>
                        <ActionButton
                            type="submit"
                            variant="negative"
                            className="flex-1"
                        >
                            Confirm Rejection
                        </ActionButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
