'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {Button} from '@/components/ui/button';
import {AddCardForm} from '@/components/billing/AddCardForm';
import {SavedCard} from '@/components/billing/SavedCard';
import {getStripe, withStripeAuthentication} from '@/components/billing/stripe';
import type {SavedPaymentCard} from '@/components/billing/types';
import {completeProCardSetup, createProCardSetup, getProPaymentMethods, proErrorMessage, removeProPaymentMethod} from './api';
import {notifyProChanged} from './useProSubscription';

export function ProPaymentMethods({onChanged, canSetDefault}: {onChanged: () => Promise<unknown>; canSetDefault: boolean}) {
    const userId = useSelector(selectUser)?.id;
    const [cards, setCards] = useState<SavedPaymentCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [makeDefault, setMakeDefault] = useState(canSetDefault);
    const [busy, setBusy] = useState(false);
    const version = useRef(0);
    const refresh = useCallback(async () => {
        const request = ++version.current;
        try {const result = await getProPaymentMethods(); if (request === version.current) {setCards(result); setError(null);}}
        catch (failure) {if (request === version.current) setError(proErrorMessage(failure));}
        finally {if (request === version.current) setLoading(false);}
    }, []);
    useEffect(() => {setCards([]); setLoading(true); void refresh(); return () => {version.current++;};}, [refresh, userId]);

    const mutate = async (operation: () => Promise<unknown>) => {
        if (busy) return;
        setBusy(true); setError(null);
        try {await operation(); await refresh(); await onChanged(); notifyProChanged();}
        catch (failure) {await refresh(); setError(proErrorMessage(failure));}
        finally {setBusy(false);}
    };
    const setDefault = async (id: string) => {
        await withStripeAuthentication(async () => {
            const stripe = await getStripe();
            if (!stripe) throw new Error('Card payments are temporarily unavailable.');
            const setup = await createProCardSetup(id);
            const result = await stripe.confirmCardSetup(setup.clientSecret, {payment_method: id});
            if (result.error) throw new Error(result.error.message || 'Your card could not be verified.');
            if (result.setupIntent?.status !== 'succeeded') throw new Error('Please finish verifying your card.');
            await completeProCardSetup(result.setupIntent.id, true);
        });
    };

    return <section className="space-y-4 rounded-2xl border p-5" aria-labelledby="pro-cards-heading">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="pro-cards-heading" className="text-lg font-semibold">Payment methods</h2><Button variant="outline" disabled={busy} onClick={() => setAdding(value => !value)}>{adding ? 'Close card form' : 'Add card'}</Button></div>
        <p className="text-sm text-muted-foreground">Choose the card used for your VIP subscription. Saved cards are also available in Ads.</p>
        {canSetDefault && <p className="text-sm leading-6 text-muted-foreground">Your subscription needs at least one active payment method. Add a replacement card or select <span className="font-medium text-foreground">Use for VIP</span> on another saved card before removing your renewal card.</p>}
        {loading && <p role="status" className="text-sm text-muted-foreground">Loading cards…</p>}
        {error && <div role="alert" className="text-sm text-destructive">{error} <button className="underline" disabled={busy} onClick={() => void refresh()}>Retry</button></div>}
        {adding && <div className="max-w-md rounded-xl border p-4">{canSetDefault && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={makeDefault} disabled={busy} onChange={event => setMakeDefault(event.target.checked)}/>Use this card for VIP renewals</label>}<AddCardForm createSetupIntent={createProCardSetup} completeSetup={id => completeProCardSetup(id, canSetDefault && makeDefault)} onBusyChange={setBusy} onSuccess={() => {setAdding(false); void refresh(); void onChanged(); notifyProChanged();}}/></div>}
        {!loading && !cards.length && <p className="text-sm text-muted-foreground">No saved cards yet.</p>}
        <div className="grid gap-5 sm:grid-cols-2">{cards.map(card => <SavedCard key={card.id} card={card} busy={busy} onMakeDefault={canSetDefault ? id => mutate(() => setDefault(id)) : undefined} onRemove={id => mutate(() => removeProPaymentMethod(id))}/>)}</div>
    </section>;
}
