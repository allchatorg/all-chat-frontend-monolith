import {getStripe, withStripeAuthentication} from '@/components/billing/stripe';
import type {VipPaymentResult} from './types';

export async function confirmVipPayment(result: VipPaymentResult, paymentMethodId?: string) {
    if (!result.clientSecret || ['succeeded', 'paid', 'processing'].includes(result.paymentStatus ?? '')) return result.paymentStatus;
    const stripe = await getStripe();
    if (!stripe) throw new Error('Payments are temporarily unavailable. Please try again later.');
    const confirmation = await withStripeAuthentication(() => stripe.confirmCardPayment(result.clientSecret!, paymentMethodId ? {payment_method: paymentMethodId} : undefined));
    if (confirmation.error) throw new Error(confirmation.error.message || 'Payment could not be completed.');
    return confirmation.paymentIntent?.status ?? result.paymentStatus;
}

export function billingMoney(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {style: 'currency', currency: currency.toUpperCase()}).format(amount / 100);
}
