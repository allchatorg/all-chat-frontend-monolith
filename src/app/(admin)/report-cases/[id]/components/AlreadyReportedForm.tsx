"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {FileCheck2, Loader2} from "lucide-react";

const MAX_REASON_LENGTH = 1000;

interface AlreadyReportedFormProps {
    onSubmit: (ncmecReportId: number, reason: string) => Promise<void>;
    onClose?: () => void;
}

export default function AlreadyReportedForm({onSubmit, onClose}: AlreadyReportedFormProps) {
    const [reportId, setReportId] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // CyberTipline report IDs are whole numbers; anything else can't be one.
    const parsedReportId = /^\d+$/.test(reportId.trim()) ? Number(reportId.trim()) : NaN;
    const isValid = Number.isSafeInteger(parsedReportId) && parsedReportId > 0 && reason.trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(parsedReportId, reason.trim());
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-[85vw] md:w-[500px] space-y-4 p-2">
            <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-red-700"/>
                <h2 className="text-lg font-semibold">Record Already Reported</h2>
            </div>

            <p className="text-sm text-muted-foreground">
                For a case whose content already reached NCMEC without a filing recorded here, such as a
                filing that failed after NCMEC accepted it. Confirm the report exists before recording it.
                This resolves the case, permanently removes the NCMEC Report and Not CSAM options from it,
                and hides its messages. It does not ban the user or delete their files.
            </p>

            <div className="space-y-2">
                <Label htmlFor="already-reported-id" className="text-sm font-medium">
                    NCMEC report ID <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="already-reported-id"
                    inputMode="numeric"
                    autoComplete="off"
                    value={reportId}
                    onChange={(e) => setReportId(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="already-reported-reason" className="text-sm font-medium">
                    How you confirmed it <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="already-reported-reason"
                    value={reason}
                    maxLength={MAX_REASON_LENGTH}
                    onChange={(e) => setReason(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Saved to the case&apos;s audit log with the report ID.</p>
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={!isValid || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Record and Resolve
                </Button>
            </div>
        </form>
    );
}
