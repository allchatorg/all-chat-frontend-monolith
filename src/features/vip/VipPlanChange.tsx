'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import type {VipInterval, VipPlanPreview} from './types';
import {confirmVipPlan, previewVipPlan, vipErrorMessage} from './api';
import {billingMoney, confirmVipPayment} from './paymentConfirmation';
import {notifyVipChanged} from './useVipSubscription';
import {withStripeAuthentication} from '@/components/billing/stripe';

export function VipPlanChange({interval, onChanged, onClose}: {interval: VipInterval; onChanged: () => Promise<unknown>; onClose: () => void}) {
    const [preview, setPreview] = useState<VipPlanPreview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const target = interval === 'MONTHLY' ? 'YEARLY' : 'MONTHLY';
    const review = async () => {
        setBusy(true); setError(null); setNotice(null); setPreview(null);
        try {setPreview(await previewVipPlan(target));} catch (failure) {setError(vipErrorMessage(failure));} finally {setBusy(false);}
    };
    const confirm = async () => {
        if (!preview || busy) return;
        if (new Date(preview.expiresAt).getTime() <= Date.now()) {setPreview(null); setError('This quote expired. Review the current price before confirming.'); return;}
        setBusy(true); setError(null);
        try {
            const {result, status} = await withStripeAuthentication(async () => {
                const result = await confirmVipPlan(preview.previewToken);
                return {result, status: await confirmVipPayment(result, result.subscription.renewalPaymentMethodId ?? undefined)};
            });
            await onChanged(); notifyVipChanged(); setPreview(null);
            if (result.subscription.pendingInterval || (status && !['paid', 'succeeded'].includes(status))) setNotice('Your plan change is awaiting payment confirmation. Your current plan remains in place until payment succeeds.');
            else onClose();
        } catch (failure) {setPreview(null); setError(vipErrorMessage(failure)); void onChanged();}
        finally {setBusy(false);}
    };
    return <section className="space-y-4 rounded-xl border bg-muted/30 p-4"><h3 className="font-semibold">Switch to {target === 'YEARLY' ? 'yearly' : 'monthly'} billing</h3><p className="text-sm text-muted-foreground">{target === 'YEARLY' ? 'Unused monthly time is credited toward your yearly plan.' : 'Monthly billing starts at your next renewal. There is no charge today.'}</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && <p role="status" className="text-sm">{notice}</p>}{preview && <dl className="grid gap-2 text-sm"><div className="flex justify-between gap-3"><dt>Due today</dt><dd className="font-semibold">{billingMoney(preview.amountDue, preview.currency)}</dd></div><div className="flex justify-between gap-3"><dt>Plan starts</dt><dd>{new Date(preview.effectiveAt).toLocaleString()}</dd></div><div className="flex justify-between gap-3"><dt>Next renewal</dt><dd>{new Date(preview.nextRenewalAt).toLocaleDateString()}</dd></div></dl>}<div className="flex flex-wrap gap-2">{preview ? <Button disabled={busy} onClick={() => void confirm()}>{busy ? 'Confirming…' : `Confirm ${target === 'YEARLY' ? 'yearly' : 'monthly'} plan`}</Button> : <Button disabled={busy} onClick={() => void review()}>{busy ? 'Calculating…' : 'Review change'}</Button>}<Button variant="outline" disabled={busy} onClick={onClose}>Keep current plan</Button></div></section>;
}
