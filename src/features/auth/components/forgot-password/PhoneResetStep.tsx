"use client";

import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {PhoneInput} from "@/components/ui/phone-input";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {forgotPassword, verifyPhonePasswordReset} from "@/api/auth/authAPI";
import {RecoveryFeedback} from "@/features/auth/components/forgot-password/RecoveryFeedback";
import {methodConfigs} from "@/features/auth/components/forgot-password/types";
import {RecoveryStepShell} from "@/features/auth/components/forgot-password/RecoveryStepShell";
import {handleThunkError} from "@/redux/utils";

type PhoneResetStepProps = {
    onBackToMethods: () => void;
    onBackToLogin: () => void;
};

type PhoneResetFormValues = {
    phoneNumber: string;
};

export function PhoneResetStep({
                                   onBackToMethods,
                                   onBackToLogin,
                               }: PhoneResetStepProps) {
    const config = methodConfigs.phone;
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [sentPhoneNumber, setSentPhoneNumber] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<PhoneResetFormValues>({
        defaultValues: {
            phoneNumber: "",
        },
    });

    const sendResetCode = async (phoneNumber: string) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await forgotPassword({phoneNumber});
            setSentPhoneNumber(phoneNumber);
            setVerificationCode("");
            setSuccess("If this phone number can be used for recovery, we sent a reset code. Didn't receive a code? Check the number and try again.");
            reset({phoneNumber});
        } catch (err) {
            setError(handleThunkError(err, "We could not process that phone number. Check the format and try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!sentPhoneNumber || !verificationCode.trim()) {
            return;
        }

        setError(null);
        setIsVerifying(true);

        try {
            const {resetToken} = await verifyPhonePasswordReset({
                phoneNumber: sentPhoneNumber,
                verificationCode: verificationCode.trim(),
            });

            router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
        } catch (err) {
            setError(handleThunkError(err, "That reset code could not be verified."));
        } finally {
            setIsVerifying(false);
        }
    };

    const onSubmit = async (values: PhoneResetFormValues) => {
        if (sentPhoneNumber) {
            await handleVerifyCode();
            return;
        }

        await sendResetCode(values.phoneNumber.trim());
    };

    const handleUseDifferentPhone = () => {
        setError(null);
        setSuccess(null);
        setSentPhoneNumber(null);
        setVerificationCode("");
    };

    return (
        <RecoveryStepShell config={config} onBackToMethods={onBackToMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="forgot-password-phone">{config.label}</Label>
                    <Controller
                        name="phoneNumber"
                        control={control}
                        rules={{required: "Phone number is required"}}
                        render={({field}) => (
                            <PhoneInput
                                defaultCountry="us"
                                value={field.value}
                                onChange={field.onChange}
                                inputProps={{
                                    id: "forgot-password-phone",
                                    name: field.name,
                                }}
                                disabled={isSubmitting || Boolean(sentPhoneNumber)}
                                className="w-full"
                            />
                        )}
                    />
                    {errors.phoneNumber && (
                        <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                </div>

                {sentPhoneNumber && (
                    <div className="grid gap-2">
                        <Label htmlFor="forgot-password-phone-code">Reset code</Label>
                        <Input
                            id="forgot-password-phone-code"
                            value={verificationCode}
                            onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>
                )}

                <RecoveryFeedback error={error} success={success}/>

                {!sentPhoneNumber ? (
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send reset code"}
                    </Button>
                ) : (
                    <div className="grid gap-2">
                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleVerifyCode}
                            disabled={isVerifying || verificationCode.trim().length !== 6}
                        >
                            {isVerifying ? "Verifying..." : "Verify code"}
                        </Button>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button
                                type="button"
                                variant="link"
                                className="h-auto px-0 text-sm"
                                onClick={() => sendResetCode(sentPhoneNumber)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Resend code"}
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="h-auto px-0 text-sm"
                                onClick={handleUseDifferentPhone}
                            >
                                Use another phone
                            </Button>
                        </div>
                    </div>
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
