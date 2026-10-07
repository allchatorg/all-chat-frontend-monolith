'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {ArrowRight, Diamond, Loader2, RefreshCw} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog';
import {cancelProSubscription, proErrorMessage, removeScheduledProChange, resumeProSubscription} from './api';
import {notifyProChanged, useProSubscription} from './useProSubscription';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {isStaff} from '@/models/Role';
import {getProBillingReturn, type ProBillingReturnState} from './billingReturn';
import {ProPaymentMethods} from './ProPaymentMethods';
import {ProInvoices} from './ProInvoices';
import {ProPlanChange} from './ProPlanChange';

function dateLabel(value: string | null) {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return 'Not available';
    return date.toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'});
}

export function SubscriptionsSettings({onExplore, billingReturn}: {onExplore?: () => void; billingReturn?: ProBillingReturnState}) {
    const user = useSelector(selectUser);
    const staff = user ? isStaff(user.role) : false;
    const roomExpiryDescription = 'Your joined chatrooms stay, and new joins must fit your Basic room limit.';
    const staffAccessDescription = 'allchat Pro is included with your staff role at no charge. This access ends if you are no longer a staff member.';
    const searchParams = useSearchParams();
    const returnState = billingReturn ?? getProBillingReturn(searchParams);
    const checkoutReturn = returnState?.checkout;
    const {subscription, loading, error, refresh} = useProSubscription(checkoutReturn === 'success' || returnState?.billingUpdated === true);
    const [action, setAction] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [changingPlan, setChangingPlan] = useState(false);

    const mutate = async (name: string, operation: () => Promise<unknown>, message: string) => {
        setAction(name);
        try {
            await operation();
            setConfirmCancel(false);
            await refresh();
            notifyProChanged();
            toast.success(message);
        } catch (failure) {
            toast.error(proErrorMessage(failure));
            void refresh(true);
        } finally {
            setAction(null);
        }
    };

    const current = subscription;
    const canChangePlan = !staff && current?.canChangePlan && current.yearlyBillingEnabled === true;
    const unavailableYearlyCheckout = current?.checkoutPending && current.checkoutInterval === 'YEARLY' && current.yearlyBillingEnabled !== true;
    const liveSubscription = current?.interval && !['NONE', 'CANCELED', 'INCOMPLETE_EXPIRED', 'PENDING'].includes(current.status);
    const needsPayment = current && ['PAST_DUE', 'UNPAID', 'INCOMPLETE', 'PAUSED'].includes(current.status);
    const waiting = current?.checkoutPending || (checkoutReturn === 'success' && !current?.proActive &&
        current && ['NONE', 'PENDING', 'INCOMPLETE'].includes(current.status));
    const showingAccessEnd = current?.cancelAtPeriodEnd || !liveSubscription;
    const billingDate = showingAccessEnd ? current?.paidThrough : current?.currentPeriodEnd;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscriptions</h1><p className="mt-2 text-sm text-muted-foreground">Your Pro plan, payments, and renewal preferences.</p></div>
            {loading && <div role="status" className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading your subscription…</div>}
            {error && <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-4"><p className="text-sm">{error}</p><Button variant="outline" onClick={() => void refresh()}><RefreshCw className="mr-2 h-4 w-4"/>Try again</Button></div>}
            {!loading && current && <>
                {waiting && <div role="status" className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><p className="font-semibold">{checkoutReturn === 'success' ? 'Confirming your subscription' : current.status === 'INCOMPLETE' ? 'Payment is unfinished' : 'Checkout is unfinished'}</p><p>{staff ? 'A previous paid checkout is still pending. Your staff access is already included. You can cancel the pending checkout below.' : unavailableYearlyCheckout ? current.status === 'INCOMPLETE' ? 'Your previous checkout is no longer available. Cancel the unfinished subscription below before choosing a new plan.' : 'Your previous checkout is still being confirmed. Please wait for it to finish or expire, then refresh your subscription.' : checkoutReturn === 'success' ? 'We are waiting for payment confirmation. Your Pro benefits activate only after your payment is verified.' : current.status === 'INCOMPLETE' ? 'Your Pro subscription has not been confirmed. Choose a card and complete your invoice below.' : 'Your Pro subscription has not been confirmed. You can continue checkout when you are ready.'}</p><Button variant="link" className="h-auto px-0 text-inherit" onClick={() => void refresh(true)}>Refresh payment status</Button>{staff && current.checkoutPending && <Button variant="link" className="ml-4 h-auto px-0 text-inherit" disabled={!!action} onClick={() => void mutate('cancel', cancelProSubscription, 'Your pending checkout was canceled.')}>Cancel pending checkout</Button>}</div>}
                {checkoutReturn === 'canceled' && !current.proActive && !current.checkoutPending && <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Checkout was closed. No new Pro subscription has been confirmed.</p>}
                {needsPayment && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><p className="font-semibold">Your payment needs attention</p><p>{staff ? 'Your existing paid subscription has a payment issue. You can manage or cancel it below. Your staff Pro access continues.' : <>{'Choose a saved card or add a new one, then pay your invoice below.'} {current.proActive ? `Your already-paid Pro access remains available until ${dateLabel(current.paidThrough)}.` : 'Your Pro benefits are inactive until a payment is confirmed.'}</>}</p></div>}

                <section className="overflow-hidden rounded-2xl border bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-[#1749b5] to-[#287ae0] p-5 text-white"><h2 className="flex items-center gap-2 text-xl font-bold"><Diamond className="h-6 w-6"/>allchat Pro</h2><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{staff ? 'Included with staff role' : current.proActive ? 'Pro active' : current.status === 'NONE' ? 'No subscription' : current.status.toLowerCase().replaceAll('_', ' ')}</span></div>
                    <div className="space-y-5 p-5">
                        {staff && <p className="text-sm leading-6 text-muted-foreground">{staffAccessDescription}{liveSubscription && !current.cancelAtPeriodEnd ? ' Your existing paid subscription will continue renewing until you cancel it below.' : ''}</p>}
                        {current.interval ? <dl className="grid gap-5 sm:grid-cols-2">
                            <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</dt><dd className="mt-1 font-semibold">{current.interval === 'MONTHLY' ? '$5 / month' : '$50 / year'} <span className="text-xs font-normal text-muted-foreground">USD</span></dd></div>
                            <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment status</dt><dd className="mt-1 capitalize">{current.status.toLowerCase().replaceAll('_', ' ')}</dd></div>
                            {billingDate && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{showingAccessEnd ? 'Paid access ends' : 'Next renewal'}</dt><dd className="mt-1 text-sm">{dateLabel(billingDate)}</dd></div>}
                        </dl> : !staff && <p className="text-sm leading-6 text-muted-foreground">{current.checkoutPending ? unavailableYearlyCheckout ? 'Your previous checkout has not been resolved yet.' : 'Your checkout is in progress. Complete payment to activate Pro.' : 'You do not have an allchat Pro subscription yet. Get higher limits, PRO-only chatrooms, custom fonts, exclusive stickers, custom emojis and reactions, and your own Pro badge.'}</p>}

                        {current.cancelAtPeriodEnd && <p className="rounded-xl bg-muted p-4 text-sm leading-6">Your subscription will not renew. {staff ? 'Your staff Pro access continues while you remain a staff member.' : current.proActive ? `You keep Pro until ${dateLabel(current.paidThrough)}.` : 'You do not currently have paid Pro access.'}</p>}
                        {!staff && (current.cancelAtPeriodEnd || (!current.proActive && current.status !== 'NONE' && !current.checkoutPending)) && <p className="text-xs leading-5 text-muted-foreground">{current.proActive ? 'When Pro access ends, Basic limits apply, fonts return to Default, and sending new Pro stickers, emojis, and reactions requires resubscribing.' : 'Basic limits currently apply.'} {roomExpiryDescription}</p>}
                        {current.scheduledInterval && <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30"><p className="font-semibold">Changing to {current.scheduledInterval === 'MONTHLY' ? 'monthly' : 'yearly'}</p><p className="mt-1 leading-6">Your {current.scheduledInterval === 'MONTHLY' ? '$5/month' : '$50/year'} plan starts {dateLabel(current.scheduledChangeAt)}. No charge today.</p><Button variant="link" className="mt-1 h-auto px-0 text-blue-700 dark:text-blue-300" disabled={!!action} onClick={() => void mutate('unschedule', removeScheduledProChange, 'Your scheduled plan change was removed.')} >{action === 'unschedule' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Keep {current.interval === 'YEARLY' ? 'yearly' : 'monthly'} plan</Button></div>}

                        <div className="flex flex-wrap gap-3">
                            {canChangePlan && !current.scheduledInterval && !current.cancelAtPeriodEnd && !current.pendingInterval && <Button variant="outline" disabled={!!action} onClick={() => setChangingPlan(value => !value)}>Change plan<ArrowRight className="ml-2 h-4 w-4"/></Button>}
                            {!staff && current.canResume && current.cancelAtPeriodEnd && <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={!!action} onClick={() => void mutate('resume', resumeProSubscription, 'Your subscription will renew again.')}>{action === 'resume' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Reactivate subscription</Button>}
                            {!staff && current.status !== 'INCOMPLETE' && (!liveSubscription || current.checkoutPending) && !unavailableYearlyCheckout && onExplore && <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={!!action || (current.checkoutPending && !current.canContinueCheckout)} onClick={onExplore}>{current.checkoutPending ? 'Continue checkout' : 'Explore allchat Pro'}</Button>}
                        </div>
                        {changingPlan && canChangePlan && current.interval && !current.pendingInterval && <ProPlanChange interval={current.interval} onChanged={() => refresh(true)} onClose={() => setChangingPlan(false)}/>}
                        {current.pendingInterval && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-semibold">Plan change awaiting payment</p><p className="mt-1">Your current plan remains in place until payment for your {current.pendingInterval.toLowerCase()} plan is confirmed. Complete the pending invoice below.{current.pendingUpdateExpiresAt && ` This change expires ${dateLabel(current.pendingUpdateExpiresAt)}.`}</p></div>}
                        {canChangePlan && !current.cancelAtPeriodEnd && <p className="text-xs leading-5 text-muted-foreground">Moving to yearly credits your unused monthly time. Moving to monthly takes effect at your next renewal. Review the total here before confirming.</p>}
                        {liveSubscription && !current.cancelAtPeriodEnd && <div className="border-t pt-4"><Button variant="destructive-outline" disabled={!!action} onClick={() => setConfirmCancel(true)}>Cancel subscription</Button><p className="mt-1 text-xs leading-5 text-muted-foreground">{staff ? 'Canceling your paid subscription does not affect Pro access through your staff role.' : 'Cancel renewal anytime. Your already-paid Pro access stays available through its end date.'}</p></div>}
                    </div>
                </section>
                {current.canManageBilling && <><ProPaymentMethods canSetDefault={Boolean(liveSubscription)} onChanged={() => refresh(true)}/><ProInvoices onChanged={() => refresh(true)} pendingInvoiceId={current.pendingInvoiceId}/></>}
                {!staff && !current.billingAvailable && <p className="text-xs leading-5 text-muted-foreground">New Pro purchases are currently unavailable. Existing subscriptions can still be managed here.</p>}
            </>}

            <AlertDialog open={confirmCancel} onOpenChange={value => {if (!action) setConfirmCancel(value);}}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
                    <AlertDialogHeader><AlertDialogTitle>{staff ? 'Cancel paid subscription?' : 'Cancel allchat Pro?'}</AlertDialogTitle><AlertDialogDescription>Your subscription will not renew. {staff ? 'Your staff Pro access continues while you remain a staff member.' : <>{current?.proActive ? `You will keep your Pro benefits until ${dateLabel(current.paidThrough)}.` : 'You do not currently have paid Pro access.'} When Pro access ends, Basic limits apply, fonts return to Default, and sending new Pro stickers, emojis, and reactions requires resubscribing. {roomExpiryDescription}</>}{current?.scheduledInterval ? ' Your scheduled plan change will also be removed.' : ''}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel disabled={!!action}>Keep subscription</AlertDialogCancel><Button variant="destructive" className="bg-red-600 text-white hover:bg-red-700" disabled={!!action} onClick={() => void mutate('cancel', cancelProSubscription, 'Your subscription will not renew.')}>{action === 'cancel' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Cancel subscription</Button></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
