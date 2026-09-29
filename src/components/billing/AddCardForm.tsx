'use client';

import {CardElement, Elements, useElements, useStripe} from '@stripe/react-stripe-js';
import {useId, useRef, useState, type FormEvent} from 'react';
import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Loader2} from 'lucide-react';
import type {CardSetupIntent} from './types';
import {getStripe, withStripeAuthentication} from './stripe';
import {PoweredByStripe} from './PoweredByStripe';
import {apiErrorMessage} from '@/lib/apiError';

interface Props {
    createSetupIntent: () => Promise<CardSetupIntent>;
    completeSetup: (setupIntentId: string) => Promise<unknown>;
    onSuccess?: () => void;
    onBusyChange?: (busy: boolean) => void;
}

export function AddCardForm(props: Props) {
    const stripe = getStripe();
    if (!stripe) return <p role="alert" className="py-4 text-sm text-destructive">Card payments are temporarily unavailable. Please try again later.</p>;
    return <Elements stripe={stripe}><CardSetupForm {...props}/></Elements>;
}

function CardSetupForm({createSetupIntent, completeSetup, onSuccess, onBusyChange}: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const {resolvedTheme} = useTheme();
    const nameId = useId();
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const confirmedSetup = useRef<string | null>(null);
    const submitting = useRef(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements || submitting.current) return;
        const card = elements.getElement(CardElement);
        if (!card) return;
        submitting.current = true; setBusy(true); onBusyChange?.(true); setError(null);
        try {
            await withStripeAuthentication(async () => {
                if (!confirmedSetup.current) {
                    const setup = await createSetupIntent();
                    const result = await stripe.confirmCardSetup(setup.clientSecret, {
                        payment_method: {card, billing_details: {name: name.trim()}},
                    });
                    if (result.error) throw new Error(result.error.message || 'Your card could not be verified.');
                    if (result.setupIntent?.status !== 'succeeded') throw new Error('Card verification is unfinished. Please try again.');
                    confirmedSetup.current = result.setupIntent.id;
                }
                // Retain a verified intent on server failure so retry cannot create a duplicate card.
                await completeSetup(confirmedSetup.current);
            });
            confirmedSetup.current = null;
            card.clear(); setName(''); onSuccess?.();
        } catch (failure) {
            if (failure && typeof failure === 'object' && 'data' in failure) {
                const result = failure as {data: unknown; status?: unknown; originalStatus?: number};
                const body = result.data && typeof result.data === 'object' ? result.data : {message: result.data};
                setError(apiErrorMessage({...body, status: typeof result.status === 'number' ? result.status : result.originalStatus ?? 0}));
            } else setError(apiErrorMessage(failure));
        } finally {submitting.current = false; setBusy(false); onBusyChange?.(false);}
    };

    return <form onSubmit={submit} className="grid gap-4 py-4">
        <div className="grid gap-2"><Label htmlFor={nameId}>Name on card</Label><Input id={nameId} autoComplete="cc-name" placeholder="Name on card" value={name} onChange={event => setName(event.target.value)} disabled={busy || !!confirmedSetup.current}/></div>
        <div className="grid gap-2"><Label>Card details</Label><div className="rounded-md border bg-background p-3"><CardElement options={{disabled: busy || !!confirmedSetup.current, style: {base: {fontSize: '16px', color: resolvedTheme === 'dark' ? '#e5e7eb' : '#424770', '::placeholder': {color: '#8993a4'}}, invalid: {color: '#dc2626'}}}}/></div><PoweredByStripe/></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={!stripe || busy} className="w-full">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{busy ? 'Saving card…' : confirmedSetup.current ? 'Retry saving card' : 'Add card'}</Button>
    </form>;
}
