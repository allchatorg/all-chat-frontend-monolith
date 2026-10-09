'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';
import {getVipInvoices, getVipPaymentMethods, payVipInvoice, vipErrorMessage} from './api';
import type {VipInvoice} from './types';
import {billingMoney, confirmVipPayment} from './paymentConfirmation';
import {notifyVipChanged} from './useVipSubscription';
import type {SavedPaymentCard} from '@/components/billing/types';
import {PaymentCardSelector} from '@/components/billing/PaymentCardSelector';
import {withStripeAuthentication} from '@/components/billing/stripe';

function paymentMonthLabel(value: string) {
    const created = new Date(value);
    return Number.isFinite(created.valueOf())
        ? created.toLocaleDateString(undefined, {month: 'long', year: 'numeric'})
        : 'VIP subscription';
}

export function VipInvoices({onChanged, pendingInvoiceId}: {onChanged: () => Promise<unknown>; pendingInvoiceId: string | null}) {
    const [invoices, setInvoices] = useState<VipInvoice[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [cards, setCards] = useState<SavedPaymentCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<string>();
    const version = useRef(0);
    const load = useCallback(async (cursor?: string) => {
        const request = ++version.current;
        setLoading(true);
        try {
            const result = await getVipInvoices(cursor);
            if (request !== version.current) return;
            setInvoices(previous => cursor ? [...previous, ...result.invoices.filter(invoice => !previous.some(item => item.id === invoice.id))] : result.invoices);
            setNextCursor(result.nextCursor); setError(null);
        } catch (failure) {if (request === version.current) setError(vipErrorMessage(failure));}
        finally {if (request === version.current) setLoading(false);}
    }, []);
    useEffect(() => {void load(); return () => {version.current++;};}, [load, pendingInvoiceId]);
    useEffect(() => {
        let active = true;
        let request = 0;
        const loadCards = async () => {
            const currentRequest = ++request;
            try {
                const result = await getVipPaymentMethods();
                if (!active || request !== currentRequest) return;
                setCards(result);
                setSelectedCard(previous => result.some(card => card.id === previous) ? previous : (result.find(card => card.isDefault) ?? result[0])?.id);
            } catch (failure) {if (active && request === currentRequest) setActionError(vipErrorMessage(failure));}
        };
        void loadCards();
        const listener = () => void loadCards();
        window.addEventListener('allchat:vip-changed', listener);
        return () => {active = false; window.removeEventListener('allchat:vip-changed', listener);};
    }, []);
    const pay = async (id: string) => {
        if (busy || !selectedCard) return;
        setBusy(id); setActionError(null); setNotice(null);
        try {
            const status = await withStripeAuthentication(async () => confirmVipPayment(await payVipInvoice(id, selectedCard), selectedCard));
            await onChanged(); await load(); notifyVipChanged();
            setNotice(status === 'succeeded' || status === 'paid' ? 'Payment completed. Your subscription status has been refreshed.' : 'Payment is being confirmed. Your subscription will update when it is confirmed.');
        } catch (failure) {setActionError(vipErrorMessage(failure)); void onChanged();}
        finally {setBusy(null);}
    };
    return <section className="space-y-4 rounded-2xl border p-5" aria-labelledby="vip-payment-history-heading">
        <h2 id="vip-payment-history-heading" className="text-lg font-semibold">Payment history</h2>
        {(actionError || error) && <p role="alert" className="text-sm text-destructive">{actionError || error} <button className="underline" disabled={!!busy} onClick={() => {setActionError(null); void load(); notifyVipChanged();}}>Retry</button></p>}
        {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        {(pendingInvoiceId || invoices.some(invoice => invoice.canPay)) && <div className="space-y-3"><p className="text-sm font-medium">Choose a card for this payment</p>{cards.length ? <PaymentCardSelector cards={cards} value={selectedCard} onChange={setSelectedCard} disabled={!!busy}/> : <p className="text-sm text-muted-foreground">Add a card above to pay your invoice.</p>}<p className="text-xs text-muted-foreground">This selection does not change your renewal card.</p></div>}
        {pendingInvoiceId && !invoices.some(invoice => invoice.id === pendingInvoiceId) && <Button variant="outline" disabled={!!busy || !selectedCard} onClick={() => void pay(pendingInvoiceId)}>Complete pending payment</Button>}
        <div className="divide-y">{invoices.map(invoice => <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0 space-y-1">
                <p className="font-medium">{paymentMonthLabel(invoice.created)}</p>
                <p className="text-xs text-muted-foreground">{invoice.number && <>{invoice.number} · </>}<span className="capitalize">{invoice.status}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">{billingMoney(invoice.total, invoice.currency)}</span>
                {invoice.canPay && <Button disabled={!!busy || !selectedCard} onClick={() => void pay(invoice.id)}>{busy === invoice.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Pay {billingMoney(invoice.amountRemaining, invoice.currency)}</Button>}
            </div>
        </div>)}</div>
        {loading && <p role="status" className="text-sm text-muted-foreground">Loading payment history…</p>}
        {!loading && !invoices.length && !error && <p className="text-sm text-muted-foreground">No subscription payment history yet.</p>}
        {nextCursor && <Button variant="outline" disabled={loading || !!busy} onClick={() => void load(nextCursor)}>Load older payments</Button>}
    </section>;
}
