'use client';

import React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import {Button} from '@ads/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@ads/components/ui/card';
import {ChevronLeft, Lock} from 'lucide-react';
import {calculateAdCost} from '@ads/utils/pricing-utils';
import {ActionButton} from '@ads/components/ui/action-button';
import {useCreateAdMutation} from '@ads/store/services/adsApi';
import {toast} from 'sonner';
import {AdFormatDto, AdFormatType} from '@ads/data/adFormats';
import {CampaignDetails} from '@ads/hooks/use-campaign-creator';
import {PaymentMethodSelector} from './payment-method-selector';
import {useRouter} from 'next/navigation';
import {useDispatch} from 'react-redux';
import type {AppDispatch} from '@/redux/store';
import {fetchMe} from '@/redux/user/usersThunk';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY ?? '');

interface StripePaymentProps {
    details: CampaignDetails;
    selectedFormat: AdFormatDto;
    adFormats: AdFormatDto[];
    onBack: () => void;
}

const PaymentCard = ({details, selectedFormat, adFormats, onBack}: StripePaymentProps) => {
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | undefined>();
    const [isFinalizing, setIsFinalizing] = React.useState(false);
    const [createAd, {isLoading}] = useCreateAdMutation();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const {totalCost} = calculateAdCost(selectedFormat, details.text.length, details.views, adFormats);

    const handleSubmit = async () => {
        if (!selectedPaymentMethodId) {
            return;
        }

        console.log('[PaymentMethod]', selectedPaymentMethodId);

        // The backend expects bare storage keys, not the preview URLs
        const imageUrl = selectedFormat.type === AdFormatType.PHOTO ? (details.mediaKey || undefined) : undefined;
        const videoUrl = selectedFormat.type === AdFormatType.VIDEO ? (details.mediaKey || undefined) : undefined;

        try {
            const result = await createAd({
                title: details.name,
                adType: selectedFormat.type,
                text: details.text,
                imageUrl,
                videoUrl,
                stripeId: selectedPaymentMethodId,
                viewsBought: details.views,
                calculatedPrice: totalCost,
                stripeAid: "TBD_STRIPE_ACCOUNT_ID"
            }).unwrap();

            const paid = result.receipt?.amountPaid ?? totalCost;
            const card = result.receipt?.cardLast4 ? ` • card ending ${result.receipt.cardLast4}` : '';
            toast.success(`Payment of $${paid.toFixed(2)} authorized${card}. Ad submitted for approval.`);

            setIsFinalizing(true);
            try {
                // Refresh the shared chat user so purchasedAdsCount includes the
                // new ad BEFORE navigating — the portal layout and sidebar gate
                // on this count and would bounce back to /portal/campaign.
                await dispatch(fetchMe()).unwrap();
                router.push('/portal/ads');
            } catch (refreshError) {
                console.error('User refresh after ad creation failed', refreshError);
                // Full page load re-hydrates the user from the backend, so the
                // layout gate sees the new ad count on arrival.
                window.location.assign('/portal/ads');
            }
        } catch (error) {
            console.error("Ad creation failed", error);
            toast.error("Failed to create ad. Please try again.");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-border shadow-sm">
            <CardHeader className="border-b border-border">
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select a saved card or add a new one to complete purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Order Summary */}
                <div className="bg-muted p-4 rounded-lg space-y-3 border border-border">
                    <h3 className="font-semibold text-sm text-foreground">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Campaign</span>
                            <span className="font-medium text-foreground">{details.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium text-foreground capitalize">{selectedFormat.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Views</span>
                            <span className="font-medium text-foreground">{details.views.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-border flex justify-between items-center">
                            <span className="font-bold text-foreground">Total</span>
                            <span className="font-bold text-lg text-blue-600">${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-4">
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
                </div>
            </CardContent>
            <CardFooter
                className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/50">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <ChevronLeft className="w-4 h-4 mr-2"/>
                    Back
                </Button>
                <ActionButton
                    disabled={!selectedPaymentMethodId || isLoading || isFinalizing}
                    type="submit"
                    icon={Lock}
                    onClick={handleSubmit}
                >
                    {isLoading || isFinalizing ? 'Processing...' : `Pay $${totalCost.toFixed(2)}`}
                </ActionButton>
            </CardFooter>
        </Card>
    );
};

export default function StripePayment(props: StripePaymentProps) {
    return (
        <Elements stripe={stripePromise}>
            <PaymentCard {...props} />
        </Elements>
    );
}
