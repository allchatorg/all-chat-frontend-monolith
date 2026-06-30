"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {forgotPassword} from "@/api/auth/authAPI";
import {methodConfigs} from "@/features/auth/components/forgot-password/types";
import {RecoveryFeedback} from "@/features/auth/components/forgot-password/RecoveryFeedback";
import {RecoveryStepShell} from "@/features/auth/components/forgot-password/RecoveryStepShell";
import {emailValidationRules} from "@/features/auth/lib/validation";
import {handleThunkError} from "@/redux/utils";

type EmailResetStepProps = {
    onBackToMethods: () => void;
    onBackToLogin: () => void;
};

type EmailResetFormValues = {
    email: string;
};

export function EmailResetStep({
                                   onBackToMethods,
                                   onBackToLogin,
                               }: EmailResetStepProps) {
    const config = methodConfigs.email;
    const Icon = config.icon;
    const [error, setError] = useState<string | null>(null);
    const [sentEmail, setSentEmail] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<EmailResetFormValues>({
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: EmailResetFormValues) => {
        const email = values.email.trim();

        setError(null);
        setSentEmail(null);
        setIsSubmitting(true);

        try {
            await forgotPassword({email});
            setSentEmail(email);
            reset({email});
        } catch (err) {
            setError(handleThunkError(err, "We could not process that email address. Check the format and try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RecoveryStepShell config={config} onBackToMethods={onBackToMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="forgot-password-email">{config.label}</Label>
                    <div className="relative">
                        <Input
                            id="forgot-password-email"
                            type={config.inputType}
                            placeholder={config.placeholder}
                            className="pl-9"
                            {...register("email", emailValidationRules)}
                            disabled={isSubmitting || Boolean(sentEmail)}
                        />
                        <Icon
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>

                {error && <p className="text-center text-sm text-red-500">{error}</p>}

                <RecoveryFeedback
                    success={sentEmail ? <EmailResetInstructions email={sentEmail}/> : null}
                />

                {!sentEmail && (
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send reset email"}
                    </Button>
                )}

                <Button
                    type="button"
                    variant="link"
                    className="mx-auto flex h-auto px-0 text-sm"
                    onClick={onBackToLogin}
                >
                    Back to login
                </Button>
            </form>
        </RecoveryStepShell>
    );
}

function EmailResetInstructions({email}: { email: string }) {
    return (
        <div className="space-y-2">
            <p className="font-medium">If {email} can be used for recovery, we sent a reset link.</p>
            <ul className="list-disc space-y-1 pl-4">
                <li>Open the email and follow the reset link to choose a new password.</li>
                <li>If it is not in your inbox within a few minutes, check spam or junk.</li>
            </ul>
        </div>
    );
}
