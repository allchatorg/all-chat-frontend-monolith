"use client";

import {useState} from "react";
import {KeyRound} from "lucide-react";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AuthView} from "@/models/AuthView";
import {cn} from "@/lib/utils";
import {ForgotPasswordMethodPicker} from "@/features/auth/components/forgot-password/ForgotPasswordMethodPicker";
import {EmailResetStep} from "@/features/auth/components/forgot-password/EmailResetStep";
import {PhoneResetStep} from "@/features/auth/components/forgot-password/PhoneResetStep";
import {methodConfigs, RecoveryMethod} from "@/features/auth/components/forgot-password/types";

export function ForgotPasswordForm({
                                       className,
                                       onAuthViewChange,
                                       ...props
                                   }: React.ComponentPropsWithoutRef<"div"> & {
    onAuthViewChange?: (view: AuthView) => void;
}) {
    const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null);
    const selectedConfig = selectedMethod ? methodConfigs[selectedMethod] : null;

    const handleBackToMethods = () => {
        setSelectedMethod(null);
    };

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <KeyRound className="h-5 w-5"/>
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-2xl">
                            {selectedConfig ? selectedConfig.label : "Reset password"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {selectedConfig
                                ? "Enter the account detail you want to use."
                                : "Choose how you want to find your account."}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!selectedMethod && (
                    <ForgotPasswordMethodPicker
                        onMethodSelect={setSelectedMethod}
                        onBackToLogin={() => onAuthViewChange?.(AuthView.LOGIN)}
                    />
                )}

                {selectedMethod === "email" && (
                    <EmailResetStep
                        onBackToMethods={handleBackToMethods}
                        onBackToLogin={() => onAuthViewChange?.(AuthView.LOGIN)}
                    />
                )}

                {selectedMethod === "phone" && (
                    <PhoneResetStep
                        onBackToMethods={handleBackToMethods}
                        onBackToLogin={() => onAuthViewChange?.(AuthView.LOGIN)}
                    />
                )}
            </CardContent>
        </div>
    );
}
