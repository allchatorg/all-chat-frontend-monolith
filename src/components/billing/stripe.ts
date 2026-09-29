'use client';

import {loadStripe, type Stripe} from '@stripe/stripe-js';
import {useEffect, useSyncExternalStore} from 'react';
import {flushSync} from 'react-dom';

let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe() {
    const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (!key?.startsWith('pk_')) return null;
    return stripePromise ??= loadStripe(key);
}

let surfaces = 0;
let confirmations = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => {listeners.add(listener); return () => {listeners.delete(listener);};};

export function useStripeInteraction() {
    const active = useSyncExternalStore(subscribe, () => surfaces + confirmations > 0, () => false);
    const busy = useSyncExternalStore(subscribe, () => confirmations > 0, () => false);
    return {active, busy};
}

// Embedded Checkout may launch its own authentication iframe at any point.
export function useStripeSurface() {
    useEffect(() => {
        surfaces++; notify();
        return () => {surfaces--; notify();};
    }, []);
}

export async function withStripeAuthentication<T>(operation: () => Promise<T>): Promise<T> {
    // Release the containing dialog's focus guard before Stripe creates 3DS UI.
    flushSync(() => {confirmations++; notify();});
    try {return await operation();}
    finally {confirmations--; notify();}
}
