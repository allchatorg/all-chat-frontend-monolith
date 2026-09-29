"use client"

import {useGetPaymentMethodsQuery} from "@ads/store/services/paymentApi"
import {Label} from "@ads/components/ui/label"
import {Button} from "@ads/components/ui/button"
import {CardDialog} from '@/components/billing/CardDialog'
import {AddCardForm} from "@ads/components/add-card-form"
import {IconPlus} from "@tabler/icons-react"
import {useState} from "react"
import {PaymentCardSelector} from "@/components/billing/PaymentCardSelector"

interface PaymentMethodSelectorProps {
    selectedPaymentMethodId?: string
    onSelect: (id: string) => void
}


export function PaymentMethodSelector({selectedPaymentMethodId, onSelect}: PaymentMethodSelectorProps) {
    const {data: cards, isLoading} = useGetPaymentMethodsQuery()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [addingCard, setAddingCard] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Payment Method</Label>
                <CardDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} busy={addingCard}
                    trigger={<Button variant="outline" size="sm" className="h-8"><IconPlus className="mr-2 h-3.5 w-3.5"/>Add New</Button>}>
                    <AddCardForm onBusyChange={setAddingCard} onSuccess={() => setIsDialogOpen(false)}/>
                </CardDialog>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading payment methods...</div>
            ) : cards && cards.length > 0 ? (
                <PaymentCardSelector cards={cards} value={selectedPaymentMethodId} onChange={onSelect}/>
            ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    No saved payment methods. Please add a card to continue.
                </div>
            )}
        </div>
    )
}
