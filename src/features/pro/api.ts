import api from '@/lib/api';
import {ProAppearance, ProInterval, ProSubscription, ProInvoices, ProPaymentResult, ProPlanPreview} from './types';
import {isAxiosError} from 'axios';
import type {CardSetupIntent, SavedPaymentCard} from '@/components/billing/types';
import {apiErrorMessage} from '@/lib/apiError';

export const getProSubscription = async (refresh = false) =>
    (await api.get<ProSubscription>('/pro/subscription', {params: {refresh}})).data;
export const startProCheckout = async (interval: ProInterval) =>
    (await api.post<{clientSecret: string}>('/pro/checkout/embedded', {interval})).data;
export const cancelProSubscription = async () =>
    (await api.post<ProSubscription>('/pro/cancel')).data;
export const resumeProSubscription = async () =>
    (await api.post<ProSubscription>('/pro/resume')).data;
export const removeScheduledProChange = async () =>
    (await api.delete<ProSubscription>('/pro/scheduled-plan-change')).data;
export const updateProAppearance = async (showProBadge: boolean) =>
    (await api.patch<ProAppearance>('/settings/appearance', {showProBadge})).data;

export const getProPaymentMethods = async () => (await api.get<SavedPaymentCard[]>('/pro/payment-methods')).data;
export const createProCardSetup = async (paymentMethodId?: string) =>
    (await api.post<CardSetupIntent>('/pro/payment-methods/setup-intent', paymentMethodId ? {paymentMethodId} : undefined)).data;
export const completeProCardSetup = async (setupIntentId: string, makeDefault = false) =>
    (await api.post<SavedPaymentCard[]>('/pro/payment-methods/setup-complete', {setupIntentId, makeDefault})).data;
export const removeProPaymentMethod = async (id: string) => {await api.delete(`/pro/payment-methods/${encodeURIComponent(id)}`);};
export const getProInvoices = async (startingAfter?: string) =>
    (await api.get<ProInvoices>('/pro/invoices', {params: {startingAfter}})).data;
export const payProInvoice = async (id: string, paymentMethodId?: string) =>
    (await api.post<ProPaymentResult>(`/pro/invoices/${encodeURIComponent(id)}/pay`, paymentMethodId ? {paymentMethodId} : undefined)).data;
export const previewProPlan = async (interval: ProInterval) =>
    (await api.post<ProPlanPreview>('/pro/plan-change/preview', {interval})).data;
export const confirmProPlan = async (previewToken: string) =>
    (await api.post<ProPaymentResult>('/pro/plan-change/confirm', {previewToken})).data;

export function proErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        return apiErrorMessage(error);
    }
    if (error instanceof Error) return error.message;
    return 'We could not update your subscription. Please try again.';
}
