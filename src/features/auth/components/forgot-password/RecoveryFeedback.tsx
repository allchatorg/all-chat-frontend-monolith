"use client";

import type {ReactNode} from "react";
import {CheckCircle2} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";

type RecoveryFeedbackProps = {
    error?: ReactNode | null;
    success?: ReactNode | null;
};

export function RecoveryFeedback({error, success}: RecoveryFeedbackProps) {
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (success) {
        return (
            <Alert
                className="border-green-200 bg-green-50 text-green-900 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4"/>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        );
    }

    return null;
}
