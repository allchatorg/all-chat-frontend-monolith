"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Message} from "@/models/message";
import {useDialog} from "@/components/providers/DialogProvider";
import {ClickableStepper} from "@ads/components/clickable-stepper";
import {PaymentMethodSelector} from "@/app/portal/campaign/components/payment-method-selector";
import {usePromoteMessageMutation} from "@ads/store/services/promotedMessagesApi";
import {AlertCircle, CheckCircle2, Loader2, Lock, Megaphone} from "lucide-react";

const STEPS = ["Payment Method", "Confirm"];

const getApiErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: { message?: string } }).data;
        if (data?.message) {
            return data.message;
        }
    }
    return "Failed to promote the message. Please try again.";
};

interface PromoteMessageModalProps {
    message: Message;
}

// Stepper modal opened from the message menu: (1) select/add a card,
// (2) $0.50-hold explanation + Purchase, then a success screen linking to
// the portal. PaymentMethodSelector brings its own Stripe <Elements> for the
// nested AddCardForm dialog, so no outer Stripe provider is needed here.
export const PromoteMessageModal: React.FC<PromoteMessageModalProps> = ({message}) => {
    const {close} = useDialog();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [promoteMessage, {isLoading}] = usePromoteMessageMutation();

    const handlePurchase = async () => {
        if (!selectedPaymentMethodId || isLoading) return;
        setErrorMessage(null);

        try {
            await promoteMessage({
                messageId: message.id,
                paymentMethodId: selectedPaymentMethodId,
            }).unwrap();
            setIsSuccess(true);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
        }
    };

    const handleGoToPortal = () => {
        close();
        router.push("/portal/promoted-messages");
    };

    if (isSuccess) {
        return (
            <div className="flex w-full flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400"/>
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Promotion submitted</h2>
                    <p className="text-sm text-muted-foreground">
                        $0.50 has been held on your card. An admin will review your promotion — once approved,
                        the message gets a PROMOTED badge and appears in the room&apos;s Promoted Messages sidebar.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="flex-1" onClick={close}>
                        Close
                    </Button>
                    <Button className="flex-1" onClick={handleGoToPortal}>
                        View My Promoted Messages
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex max-h-[75vh] w-full flex-col gap-4 pt-2">
            <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                <h2 className="text-lg font-semibold text-foreground">Promote Message</h2>
            </div>

            <ClickableStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={(step) => {
                    if (step < currentStep) {
                        setCurrentStep(step);
                    }
                }}
            />

            {/* Only the step body scrolls — header, stepper and the action
                buttons stay pinned so the dialog itself never needs a scrollbar
                (which would cut across its rounded corners). */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {currentStep === 0 && (
                    <>
                        <div className="bg-muted p-4 rounded-lg space-y-3 border border-border">
                            <h3 className="font-semibold text-sm text-foreground">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Room</span>
                                    <span className="font-medium text-foreground">{message.chatRoomName}</span>
                                </div>
                                <div className="pt-2 border-t border-border flex justify-between items-center">
                                    <span className="font-bold text-foreground">Total</span>
                                    <span className="font-bold text-lg text-blue-600">
                                        $0.50
                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                            (held until review)
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <PaymentMethodSelector
                            selectedPaymentMethodId={selectedPaymentMethodId}
                            onSelect={setSelectedPaymentMethodId}
                        />

                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                            <Lock className="w-3 h-3"/>
                            <span>Payments processed securely by</span>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                                alt="Stripe" className="h-5 opacity-80 grayscale hover:grayscale-0 transition-all"/>
                        </div>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        <div className="rounded-lg border bg-muted/40 p-3 dark:bg-muted/20">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Your message in {message.chatRoomName}
                            </p>
                            <p className="line-clamp-3 whitespace-pre-wrap text-sm text-foreground [word-break:break-word]">
                                {message.content}
                            </p>
                        </div>

                        <div
                            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            <span className="font-semibold">$0.50</span> will be held on your card until an admin
                            reviews the promotion. The hold is released in full if the promotion is denied or if you
                            cancel it while it is still pending. Approved promotions stay active until canceled.
                        </div>

                        {errorMessage && (
                            <div
                                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>
                                <span>{errorMessage}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {currentStep === 0 ? (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => setCurrentStep(1)}
                        disabled={!selectedPaymentMethodId}
                    >
                        Next
                    </Button>
                </div>
            ) : (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(0)} disabled={isLoading}>
                        Back
                    </Button>
                    <Button onClick={handlePurchase} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Processing...
                            </>
                        ) : (
                            "Purchase for $0.50"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PromoteMessageModal;
