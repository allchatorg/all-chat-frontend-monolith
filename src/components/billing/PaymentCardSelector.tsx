'use client';

import {useId} from 'react';
import {IconBrandMastercard, IconBrandVisa, IconCreditCard} from '@tabler/icons-react';
import {cn} from '@/lib/utils';
import type {SavedPaymentCard} from './types';

export function PaymentCardSelector({cards, value, onChange, disabled}: {cards: SavedPaymentCard[]; value?: string; onChange: (id: string) => void; disabled?: boolean}) {
    const name = useId();
    return <fieldset disabled={disabled} className="grid gap-3"><legend className="sr-only">Card for this payment</legend>{cards.map(card => <label key={card.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent', value === card.id ? 'border-primary bg-accent' : 'border-border', disabled && 'cursor-not-allowed opacity-60')}><input type="radio" name={name} value={card.id} checked={value === card.id} onChange={() => onChange(card.id)} className="h-4 w-4 accent-primary"/><span className="rounded-md border bg-card p-1">{card.brand.toLowerCase() === 'visa' ? <IconBrandVisa className="h-6 w-6"/> : card.brand.toLowerCase() === 'mastercard' ? <IconBrandMastercard className="h-6 w-6"/> : <IconCreditCard className="h-6 w-6"/>}</span><span><span className="block text-sm font-medium capitalize">{card.brand} •••• {card.last4}</span><span className="block text-xs text-muted-foreground">Expires {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}</span></span></label>)}</fieldset>;
}
