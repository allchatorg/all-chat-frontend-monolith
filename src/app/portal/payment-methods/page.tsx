'use client'
import {SiteHeader} from "@ads/components/site-header";
import {SavedCard} from "@ads/components/saved-card";
import {AddCardForm} from "@ads/components/add-card-form";
import {Button} from "@ads/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ads/components/ui/dialog";
import {IconPlus, IconShieldCheck} from "@tabler/icons-react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {useGetPaymentMethodsQuery, useRemovePaymentMethodMutation} from "@ads/store/services/paymentApi";
import {toast} from "sonner";
import {useState} from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_KEY || '';
const isStripeKeyValid = publishableKey.startsWith('pk_');
if (!isStripeKeyValid) {
    console.error(
        "Invalid Stripe Key"
    );
}
const stripePromise = isStripeKeyValid ? loadStripe(publishableKey) : null;


export default function Page() {
    const {data: cards, isLoading, error} = useGetPaymentMethodsQuery();
    const [removePaymentMethod] = useRemovePaymentMethodMutation();
    const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

    const handleRemoveCard = async (cardId: string) => {
        try {
            await removePaymentMethod(cardId).unwrap();
            toast.success("Payment method removed successfully");
        } catch (err) {
            console.error('Failed to remove payment method:', err);
            toast.error("Failed to remove payment method");
        }
    };

    return (
        <div className="w-full">
            <SiteHeader
                title="Payment Methods"
                description="Manage your saved payment methods"
            />
            <div className="flex flex-col space-y-8 p-6 md:p-12 max-w-5xl mx-auto">

                {/* Security Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 max-w-3xl">
                    <IconShieldCheck className="h-6 w-6 text-blue-600 mt-0.5"/>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900">Secure Payment Processing</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            AllChat does not store your payment details. Your cards are securely saved by our payment
                            provider, Stripe. You can remove them at any time.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between max-w-3xl">
                        <h3 className="text-lg font-medium">Saved Cards ({cards?.length || 0})</h3>
                        <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <IconPlus className="mr-2 h-4 w-4"/>
                                    Add Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Payment Method</DialogTitle>
                                    <DialogDescription>
                                        Add a new credit or debit card to your account.
                                    </DialogDescription>
                                </DialogHeader>
                                {stripePromise ? (
                                    <Elements stripe={stripePromise}>
                                        <AddCardForm onSuccess={() => setIsAddCardDialogOpen(false)}/>
                                    </Elements>
                                ) : (
                                    <div className="text-sm text-red-600">
                                        Stripe is not configured correctly. Please set
                                        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                                        to your Stripe publishable key (starts with &quot;pk_&quot;) and reload the
                                        page.
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading payment methods...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">Failed to load payment methods</div>
                    ) : cards && cards.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-3xl">
                            {cards.map((card) => (
                                <SavedCard
                                    key={card.id}
                                    card={card}
                                    onRemove={handleRemoveCard}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg max-w-3xl">
                            No payment methods saved yet. Add one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
