import api from '@/lib/api';
import {ProAppearance, ProInterval, ProSubscription} from './types';
import {isAxiosError} from 'axios';

export const getProSubscription = async (refresh = false) =>
    (await api.get<ProSubscription>('/pro/subscription', {params: {refresh}})).data;
export const startProCheckout = async (interval: ProInterval) =>
    (await api.post<{url: string}>('/pro/checkout', {interval})).data;
export const openProPortal = async (flow: 'billing' | 'switch_plan') =>
    (await api.post<{url: string}>('/pro/portal', {flow})).data;
export const cancelProSubscription = async () =>
    (await api.post<ProSubscription>('/pro/cancel')).data;
export const resumeProSubscription = async () =>
    (await api.post<ProSubscription>('/pro/resume')).data;
export const removeScheduledProChange = async () =>
    (await api.delete<ProSubscription>('/pro/scheduled-plan-change')).data;
export const updateProAppearance = async (showProBadge: boolean) =>
    (await api.patch<ProAppearance>('/settings/appearance', {showProBadge})).data;

export function proErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data?.detail;
        if (typeof message === 'string') return message;
    }
    return 'We could not update your subscription. Please try again.';
}

/** Only follow a Stripe-hosted URL returned by our authenticated backend. */
export function redirectToStripe(url: string) {
    const destination = new URL(url);
    if (destination.protocol !== 'https:' || !['checkout.stripe.com', 'billing.stripe.com'].includes(destination.hostname)) {
        throw new Error('The billing link is unavailable. Please try again.');
    }
    window.location.assign(destination.toString());
}
