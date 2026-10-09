'use client';

import {useCallback, useMemo, useRef} from 'react';
import {EmbeddedCheckout, EmbeddedCheckoutProvider} from '@stripe/react-stripe-js';
import {ArrowLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {getStripe, useStripeSurface} from '@/components/billing/stripe';
import {notifyProChanged} from './useProSubscription';

export function ProCheckout({clientSecret, onComplete, onBack}: {clientSecret: string; onComplete: () => void; onBack: () => void}) {
    useStripeSurface();
    const completeRef = useRef(onComplete);
    completeRef.current = onComplete;
    const complete = useCallback(() => {notifyProChanged(); completeRef.current();}, []);
    const options = useMemo(() => ({clientSecret, onComplete: complete}), [clientSecret, complete]);
    const stripe = getStripe();
    return <section className="space-y-4 p-4 sm:p-6"><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back to plans</Button><h2 className="text-xl font-semibold">Subscribe to allchat VIP</h2>{stripe ? <EmbeddedCheckoutProvider stripe={stripe} options={options}><EmbeddedCheckout/></EmbeddedCheckoutProvider> : <p role="alert" className="text-sm text-destructive">Payments are temporarily unavailable. Please try again later.</p>}</section>;
}
