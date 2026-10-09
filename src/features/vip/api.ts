import api from '@/lib/api';
import {VipAppearance, VipInterval, VipSubscription, VipInvoices, VipPaymentResult, VipPlanPreview} from './types';
import {isAxiosError} from 'axios';
import type {CardSetupIntent, SavedPaymentCard} from '@/components/billing/types';
import {apiErrorMessage} from '@/lib/apiError';

export const getVipSubscription = async (refresh = false) =>
    (await api.get<VipSubscription>('/vip/subscription', {params: {refresh}})).data;
export const startVipCheckout = async (interval: VipInterval) =>
    (await api.post<{clientSecret: string}>('/vip/checkout/embedded', {interval})).data;
export const cancelVipSubscription = async () =>
    (await api.post<VipSubscription>('/vip/cancel')).data;
export const resumeVipSubscription = async () =>
    (await api.post<VipSubscription>('/vip/resume')).data;
export const removeScheduledVipChange = async () =>
    (await api.delete<VipSubscription>('/vip/scheduled-plan-change')).data;
export const updateVipAppearance = async (showVipBadge: boolean) =>
    (await api.patch<VipAppearance>('/settings/appearance', {showVipBadge})).data;

export const getVipPaymentMethods = async () => (await api.get<SavedPaymentCard[]>('/vip/payment-methods')).data;
export const createVipCardSetup = async (paymentMethodId?: string) =>
    (await api.post<CardSetupIntent>('/vip/payment-methods/setup-intent', paymentMethodId ? {paymentMethodId} : undefined)).data;
export const completeVipCardSetup = async (setupIntentId: string, makeDefault = false) =>
    (await api.post<SavedPaymentCard[]>('/vip/payment-methods/setup-complete', {setupIntentId, makeDefault})).data;
export const removeVipPaymentMethod = async (id: string) => {await api.delete(`/vip/payment-methods/${encodeURIComponent(id)}`);};
export const getVipInvoices = async (startingAfter?: string) =>
    (await api.get<VipInvoices>('/vip/invoices', {params: {startingAfter}})).data;
export const payVipInvoice = async (id: string, paymentMethodId?: string) =>
    (await api.post<VipPaymentResult>(`/vip/invoices/${encodeURIComponent(id)}/pay`, paymentMethodId ? {paymentMethodId} : undefined)).data;
export const previewVipPlan = async (interval: VipInterval) =>
    (await api.post<VipPlanPreview>('/vip/plan-change/preview', {interval})).data;
export const confirmVipPlan = async (previewToken: string) =>
    (await api.post<VipPaymentResult>('/vip/plan-change/confirm', {previewToken})).data;

export function vipErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        return apiErrorMessage(error);
    }
    if (error instanceof Error) return error.message;
    return 'We could not update your subscription. Please try again.';
}
