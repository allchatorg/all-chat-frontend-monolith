"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Loader2, ShieldCheck} from "lucide-react";

const MAX_REASON_LENGTH = 1000;

interface NotCsamDecisionFormProps {
    onSubmit: (reason: string) => Promise<void>;
    onClose?: () => void;
}

export default function NotCsamDecisionForm({onSubmit, onClose}: NotCsamDecisionFormProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            await onSubmit(reason.trim());
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-[85vw] md:w-[500px] space-y-4 p-2">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gray-500"/>
                <h2 className="text-lg font-semibold">Record Not CSAM</h2>
            </div>

            <p className="text-sm text-muted-foreground">
                This resolves the case and permanently removes the NCMEC Report option from it.
                The reason is saved to the case&apos;s audit log.
            </p>

            <div className="space-y-2">
                <Label htmlFor="not-csam-reason" className="text-sm font-medium">
                    Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="not-csam-reason"
                    value={reason}
                    maxLength={MAX_REASON_LENGTH}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isSubmitting || reason.trim() === ""}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Record Decision
                </Button>
            </div>
        </form>
    );
}
