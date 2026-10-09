'use client'
import {SiteHeader} from "@ads/components/site-header";
import {SavedCard} from "@ads/components/saved-card";
import {AddCardForm} from "@ads/components/add-card-form";
import {Button} from "@ads/components/ui/button";
import {CardDialog} from '@/components/billing/CardDialog';
import {IconPlus, IconShieldCheck} from "@tabler/icons-react";
import {useGetPaymentMethodsQuery, useRemovePaymentMethodMutation} from "@ads/store/services/paymentApi";
import {toast} from "sonner";
import {useState} from "react";

export default function Page() {
    const {data: cards, isLoading, error} = useGetPaymentMethodsQuery();
    const [removePaymentMethod] = useRemovePaymentMethodMutation();
    const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
    const [addingCard, setAddingCard] = useState(false);
    const [removingCard, setRemovingCard] = useState(false);

    const handleRemoveCard = async (cardId: string) => {
        setRemovingCard(true);
        try {
            await removePaymentMethod(cardId).unwrap();
            toast.success("Payment method removed successfully");
        } catch (err) {
            console.error('Failed to remove payment method:', err);
            toast.error("Could not remove this card. Check whether it is required for VIP or a pending payment.");
        } finally {setRemovingCard(false);}
    };

    return (
        <div className="w-full">
            <SiteHeader
                title="Payment Methods"
                description="Manage your saved payment methods"
            />
            <div className="flex flex-col space-y-8 p-6 md:p-12 max-w-5xl mx-auto">

                {/* Security Banner */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex items-start space-x-3 max-w-3xl">
                    <IconShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5"/>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Secure Payment Processing</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            allchat does not store your payment details. Your cards are securely saved by our payment
                            provider, Stripe. Cards required for active billing must be replaced before removal.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between max-w-3xl">
                        <h3 className="text-lg font-medium">Saved Cards ({cards?.length || 0})</h3>
                        <CardDialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen} busy={addingCard}
                            trigger={<Button variant="outline" size="sm"><IconPlus className="mr-2 h-4 w-4"/>Add Card</Button>}>
                            <AddCardForm onBusyChange={setAddingCard} onSuccess={() => setIsAddCardDialogOpen(false)}/>
                        </CardDialog>
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
                                    busy={removingCard}
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
