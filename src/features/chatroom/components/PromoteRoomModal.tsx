"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {useDialog} from "@/components/providers/DialogProvider";
import {ClickableStepper} from "@ads/components/clickable-stepper";
import {PaymentMethodSelector} from "@/app/portal/campaign/components/payment-method-selector";
import {usePromoteRoomMutation} from "@ads/store/services/roomPromotionsApi";
import {AlertCircle, ArrowUpToLine, CheckCircle2, Info, LayoutList, Loader2, Lock, Rocket} from "lucide-react";

const STEPS = ["Payment", "Confirm"];

const getApiErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: { message?: string } }).data;
        if (data?.message) {
            return data.message;
        }
    }
    return "Failed to promote the room. Please try again.";
};

interface PromoteRoomModalProps {
    chatRoomId: number;
    chatRoomName: string;
}

// Stepper modal opened from the chat room header: (1) select/add a card,
// (2) $2.50-hold explanation + Purchase, then a success screen linking to
// the portal. PaymentMethodSelector brings its own Stripe <Elements> for the
// nested AddCardForm dialog, so no outer Stripe provider is needed here.
export const PromoteRoomModal: React.FC<PromoteRoomModalProps> = ({chatRoomId, chatRoomName}) => {
    const {close} = useDialog();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [promoteRoom, {isLoading}] = usePromoteRoomMutation();

    const handlePurchase = async () => {
        if (!selectedPaymentMethodId || isLoading) return;
        setErrorMessage(null);

        try {
            await promoteRoom({
                chatRoomId,
                paymentMethodId: selectedPaymentMethodId,
            }).unwrap();
            setIsSuccess(true);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
        }
    };

    const handleGoToPortal = () => {
        close();
        router.push("/portal/room-promotions");
    };

    if (isSuccess) {
        return (
            <div className="flex w-full flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400"/>
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Promotion submitted</h2>
                    <p className="text-sm text-muted-foreground">
                        $2.50 has been held on your card. An admin will review your promotion — once approved,
                        the room is bumped to the top of the Promoted tab in Active Rooms.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="flex-1" onClick={close}>
                        Close
                    </Button>
                    <Button className="flex-1" onClick={handleGoToPortal}>
                        View My Room Promotions
                    </Button>
                </div>
            </div>
        );
    }

    // Info view swaps the dialog content in place — stepper and payment state
    // stay untouched, so Back returns to exactly the screen the user left.
    if (showInfo) {
        return (
            <div className="flex max-h-[75vh] w-full flex-col gap-4 pt-2">
                <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                    <h2 className="text-lg font-semibold text-foreground">How room promotions work</h2>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    <div className="flex items-start gap-3 bg-muted p-4 rounded-lg border border-border">
                        <LayoutList className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"/>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-foreground">Listed in the Promoted tab of Active Rooms</p>
                            <p className="text-muted-foreground">
                                Any public room can be promoted by anyone. Once approved,{" "}
                                <span className="font-medium text-foreground">{chatRoomName}</span> appears in the
                                Promoted tab of the Active Rooms panel, visible to every user.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-muted p-4 rounded-lg border border-border">
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"/>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-foreground">One-time $2.50</p>
                            <p className="text-muted-foreground">
                                $2.50 is held on your card until an admin reviews the promotion. The hold is
                                released in full if the promotion is denied or if a cancellation request is
                                accepted while it is still pending. Approved promotions never expire.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-muted p-4 rounded-lg border border-border">
                        <ArrowUpToLine className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"/>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-foreground">Bumped to the top</p>
                            <p className="text-muted-foreground">
                                Every newly approved promotion pushes the room to the top of the Promoted list.
                                Promote the room again later to bump it back to the top.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowInfo(false)}>
                        Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex max-h-[75vh] w-full flex-col gap-4 pt-2">
            {/* Positioned against the fixed DialogContent (no overflow clipping
                there), so the badge straddles the dialog's top border. */}
            <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="absolute -top-3.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
            >
                <Info className="h-3.5 w-3.5"/>
                How room promotions work
            </button>

            <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                <h2 className="text-lg font-semibold text-foreground">Promote Room</h2>
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
                                    <span className="font-medium text-foreground">{chatRoomName}</span>
                                </div>
                                <div className="pt-2 border-t border-border flex justify-between items-center">
                                    <span className="font-bold text-foreground">Total</span>
                                    <span className="font-bold text-lg text-blue-600">
                                        $2.50
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
                        <div className="glass-surface flex items-center gap-3 rounded-md px-4 py-3">
                            <Rocket className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"/>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Room to promote</p>
                                <p className="truncate text-lg font-semibold text-foreground" title={chatRoomName}>
                                    {chatRoomName}
                                </p>
                            </div>
                        </div>

                        <div
                            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            <span className="font-semibold">$2.50</span> will be held on your card until an admin
                            reviews the promotion. The hold is released in full if the promotion is denied or a
                            cancellation request is accepted while pending. Approved promotions never expire.
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
                            "Purchase for $2.50"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PromoteRoomModal;
