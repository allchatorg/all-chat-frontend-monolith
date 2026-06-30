"use client"

import {useGetPaymentMethodsQuery} from "@ads/store/services/paymentApi"
import {RadioGroup, RadioGroupItem} from "@ads/components/ui/radio-group"
import {Label} from "@ads/components/ui/label"
import {Button} from "@ads/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ads/components/ui/dialog"
import {AddCardForm} from "@ads/components/add-card-form"
import {IconBrandMastercard, IconBrandVisa, IconCreditCard, IconPlus} from "@tabler/icons-react"
import {useState} from "react"
import {loadStripe} from "@stripe/stripe-js"
import {Elements} from "@stripe/react-stripe-js"
import {cn} from "@ads/lib/utils"

interface PaymentMethodSelectorProps {
    selectedPaymentMethodId?: string
    onSelect: (id: string) => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '')

export function PaymentMethodSelector({selectedPaymentMethodId, onSelect}: PaymentMethodSelectorProps) {
    const {data: cards, isLoading} = useGetPaymentMethodsQuery()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const getBrandIcon = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa':
                return <IconBrandVisa className="h-6 w-6"/>
            case 'mastercard':
                return <IconBrandMastercard className="h-6 w-6"/>
            default:
                return <IconCreditCard className="h-6 w-6"/>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Payment Method</Label>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <IconPlus className="mr-2 h-3.5 w-3.5"/>
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Payment Method</DialogTitle>
                            <DialogDescription>
                                Add a new credit or debit card to your account.
                            </DialogDescription>
                        </DialogHeader>
                        <Elements stripe={stripePromise}>
                            <AddCardForm onSuccess={() => setIsDialogOpen(false)}/>
                        </Elements>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading payment methods...</div>
            ) : cards && cards.length > 0 ? (
                <RadioGroup
                    value={selectedPaymentMethodId}
                    onValueChange={onSelect}
                    className="grid gap-3"
                >
                    {cards.map((card) => (
                        <Label
                            key={card.id}
                            className={cn(
                                "flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors",
                                selectedPaymentMethodId === card.id ? "border-primary bg-accent" : "border-border"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value={card.id} id={card.id}/>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md border p-1 bg-card">
                                        {getBrandIcon(card.brand)}
                                    </div>
                                    <div className="grid gap-0.5">
                                        <span className="font-medium capitalize">
                                            {card.brand} •••• {card.last4}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear.toString().slice(-2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
            ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    No saved payment methods. Please add a card to continue.
                </div>
            )}
        </div>
    )
}
