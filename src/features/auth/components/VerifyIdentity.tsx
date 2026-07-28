"use client";

import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, Clock, IdCard, Loader2, RefreshCw} from "lucide-react";
import {loadStripe} from "@stripe/stripe-js";
import {createVerificationSession, getIdVerificationStatus} from "@/api/idVerification/idVerificationAPI";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchMe} from "@/redux/user/usersThunk";
import {useUser} from "@/lib/hooks/useUser";

const VerifyIdentity: React.FC = () => {
    const {user} = useUser();
    const [refetchUser, refetchIsLoading] = useThunk(fetchMe);

    const [isStarting, setIsStarting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const status = user?.idVerificationStatus ?? 'NONE';

    const handleStart = async () => {
        setErrorMessage(null);
        setIsStarting(true);
        try {
            const {clientSecret} = await createVerificationSession();
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');
            if (!stripe) {
                setErrorMessage("Could not load the verification provider. Please try again.");
                return;
            }

            const result = await stripe.verifyIdentity(clientSecret);
            if (result.error) {
                // The user closed the Stripe modal without submitting.
                setErrorMessage("Verification wasn't completed. You can start again whenever you're ready.");
                return;
            }

            // Submission succeeded — refresh the user so the PENDING state shows.
            await refetchUser();
        } catch (error) {
            setErrorMessage("Failed to start verification. Please try again.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleRefresh = async () => {
        setErrorMessage(null);
        setIsRefreshing(true);
        try {
            await getIdVerificationStatus();
            await refetchUser();
        } catch (error) {
            setErrorMessage("Failed to refresh verification status. Please try again.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const anyLoading = isStarting || isRefreshing || refetchIsLoading;

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary"/>
                    Verify your age
                </CardTitle>
                <CardDescription>
                    {status === 'PENDING'
                        ? "Your identity document has been submitted and is under review."
                        : "A staff member has asked you to verify your age with a government ID."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription className="m-0 p-0">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'PENDING' ? (
                    <div className="space-y-2">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/30">
                            <p className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                                <Clock className="h-4 w-4 shrink-0"/>
                                This usually only takes a few minutes — you will be let back in
                                automatically once it completes.
                            </p>
                        </div>
                        <Button onClick={handleRefresh} disabled={anyLoading} className="w-full" variant="outline">
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}/>
                            Refresh status
                        </Button>
                    </div>
                ) : status === 'REJECTED' && user?.idVerificationUnderAge ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
                        <p className="text-sm text-red-800 dark:text-red-300">
                            You must be 18 or older to use allchat. Your verification showed
                            you're currently under 18. Your access will be granted automatically
                            once you turn 18 — no further action is needed.
                        </p>
                    </div>
                ) : status === 'REJECTED' ? (
                    <div className="space-y-2">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
                            <p className="text-sm text-red-800 dark:text-red-300">
                                We couldn't verify your age. You can try again with a different
                                document, or contact support if you believe this is a mistake.
                            </p>
                        </div>
                        <Button onClick={handleStart} disabled={anyLoading} className="w-full">
                            {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Try again
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Your document is processed securely by Stripe, we never see or store it.
                        </p>
                        <Button onClick={handleStart} disabled={anyLoading} className="w-full">
                            {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Start verification
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default VerifyIdentity;
