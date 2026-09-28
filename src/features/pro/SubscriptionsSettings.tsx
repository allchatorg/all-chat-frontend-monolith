'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {ArrowRight, CreditCard, Diamond, ExternalLink, Loader2, RefreshCw} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog';
import {cancelProSubscription, openProPortal, proErrorMessage, redirectToStripe, removeScheduledProChange, resumeProSubscription} from './api';
import {notifyProChanged, useProSubscription} from './useProSubscription';
import {PRO_REACTIONS} from '@/features/stickers/catalog';
import {ACCOUNT_LIMITS} from '@/lib/accountLimits';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {isStaff} from '@/models/Role';

function dateLabel(value: string | null) {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return 'Not available';
    return date.toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'});
}

export function SubscriptionsSettings({onExplore}: {onExplore?: () => void}) {
    const user = useSelector(selectUser);
    const staff = user ? isStaff(user.role) : false;
    const roomExpiryDescription = staff
        ? 'Your staff room and hourly upload exemptions continue.'
        : 'Your joined chatrooms stay, and new joins must fit your Basic room limit.';
    const searchParams = useSearchParams();
    const checkoutReturn = searchParams.get('checkout');
    const {subscription, loading, error, refresh} = useProSubscription(checkoutReturn === 'success' || searchParams.get('billing') === 'updated');
    const [action, setAction] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState(false);

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

    const portal = async (flow: 'billing' | 'switch_plan') => {
        setAction(flow);
        try {
            const {url} = await openProPortal(flow);
            redirectToStripe(url);
        } catch (failure) {
            toast.error(proErrorMessage(failure));
            setAction(null);
        }
    };

    const current = subscription;
    const canChangePlan = current?.canChangePlan && current.yearlyBillingEnabled === true;
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
                {waiting && <div role="status" className="rounded-xl border border-violet-300 bg-violet-50 p-4 text-sm leading-6 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"><p className="font-semibold">{checkoutReturn === 'success' ? 'Confirming your subscription' : 'Checkout is unfinished'}</p><p>{unavailableYearlyCheckout ? current.status === 'INCOMPLETE' ? 'Your previous checkout is no longer available. Cancel the unfinished subscription below before choosing a new plan.' : 'Your previous checkout is still being confirmed. Please wait for it to finish or expire, then refresh your subscription.' : checkoutReturn === 'success' ? 'We are waiting for payment confirmation. Your Pro benefits activate only after your payment is verified.' : 'Your Pro subscription has not been confirmed. You can continue checkout when you are ready.'}</p><Button variant="link" className="h-auto px-0 text-inherit" onClick={() => void refresh(true)}>Refresh payment status</Button></div>}
                {checkoutReturn === 'canceled' && !current.proActive && !current.checkoutPending && <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Checkout was closed. No new Pro subscription has been confirmed.</p>}
                {needsPayment && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><p className="font-semibold">Your payment needs attention</p><p>{current.canContinueCheckout ? 'Continue checkout to try another payment method.' : 'Update your payment details in billing.'} {current.proActive ? `Your already-paid Pro access remains available until ${dateLabel(current.paidThrough)}.` : 'Your Pro benefits are inactive until a payment is confirmed.'}</p></div>}

                <section className="overflow-hidden rounded-2xl border bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-violet-700 to-fuchsia-600 p-5 text-white"><h2 className="flex items-center gap-2 text-xl font-bold"><Diamond className="h-6 w-6"/>allchat Pro</h2><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{current.proActive ? 'Pro active' : current.status === 'NONE' ? 'No subscription' : current.status.toLowerCase().replaceAll('_', ' ')}</span></div>
                    <div className="space-y-5 p-5">
                        {current.interval ? <dl className="grid gap-5 sm:grid-cols-2">
                            <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</dt><dd className="mt-1 font-semibold">{current.interval === 'MONTHLY' ? '$5 / month' : '$50 / year'} <span className="text-xs font-normal text-muted-foreground">USD</span></dd></div>
                            <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment status</dt><dd className="mt-1 capitalize">{current.status.toLowerCase().replaceAll('_', ' ')}</dd></div>
                            {billingDate && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{showingAccessEnd ? 'Paid access ends' : 'Next renewal'}</dt><dd className="mt-1 text-sm">{dateLabel(billingDate)}</dd></div>}
                        </dl> : <p className="text-sm leading-6 text-muted-foreground">{current.checkoutPending ? unavailableYearlyCheckout ? 'Your previous checkout has not been resolved yet.' : 'Your checkout is in progress. Complete payment to activate Pro.' : 'You do not have an allchat Pro subscription yet. Get higher limits, custom fonts, exclusive stickers, custom emojis and reactions, and your own Pro badge.'}</p>}

                        {current.proActive && <div className="rounded-xl bg-violet-50 p-4 text-sm dark:bg-violet-500/10">
                            <h3 className="font-semibold">Your Pro benefits</h3>
                            <ul className="mt-2 grid gap-x-5 gap-y-2 text-muted-foreground sm:grid-cols-2">
                                <li>{staff ? 'Unlimited joined chatrooms (staff)' : `Up to ${ACCOUNT_LIMITS.proRooms} joined chatrooms`}</li>
                                <li>{ACCOUNT_LIMITS.proMessageCharacters.toLocaleString('en-US')} characters per message</li>
                                <li>{ACCOUNT_LIMITS.proFileBytes / (1024 * 1024)} MB per file</li>
                                <li>{staff ? 'No hourly upload cap (staff)' : `${ACCOUNT_LIMITS.proHourlyUploadBytes / (1024 * 1024)} MB of uploads in any 1-hour window`}</li>
                                <li>{PRO_REACTIONS.length} characters for stickers, custom emojis, and reactions</li>
                                <li>Username and message fonts, with {ACCOUNT_LIMITS.proDailyFontSaves} saves per day</li>
                            </ul>
                            <p className="mt-2 text-muted-foreground">Manage your fonts and badge in Appearance. Hiding your badge keeps every Pro benefit active.</p>
                        </div>}
                        {current.cancelAtPeriodEnd && <p className="rounded-xl bg-muted p-4 text-sm leading-6">Your subscription will not renew. {current.proActive ? `You keep Pro until ${dateLabel(current.paidThrough)}.` : 'You do not currently have paid Pro access.'}</p>}
                        {(current.cancelAtPeriodEnd || (!current.proActive && current.status !== 'NONE' && !current.checkoutPending)) && <p className="text-xs leading-5 text-muted-foreground">{current.proActive ? 'When Pro access ends, Basic limits apply, fonts return to Default, and sending new Pro stickers, emojis, and reactions requires resubscribing.' : 'Basic limits currently apply.'} {roomExpiryDescription}</p>}
                        {current.scheduledInterval && <div className="rounded-xl border border-violet-300 bg-violet-50 p-4 text-sm dark:border-violet-800 dark:bg-violet-950/30"><p className="font-semibold">Changing to {current.scheduledInterval === 'MONTHLY' ? 'monthly' : 'yearly'}</p><p className="mt-1 leading-6">Your {current.scheduledInterval === 'MONTHLY' ? '$5/month' : '$50/year'} plan starts {dateLabel(current.scheduledChangeAt)}. No charge today.</p><Button variant="link" className="mt-1 h-auto px-0 text-violet-700 dark:text-violet-300" disabled={!!action} onClick={() => void mutate('unschedule', removeScheduledProChange, 'Your scheduled plan change was removed.')} >{action === 'unschedule' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Keep {current.interval === 'YEARLY' ? 'yearly' : 'monthly'} plan</Button></div>}

                        <div className="flex flex-wrap gap-3">
                            {current.canManageBilling && <Button variant="outline" disabled={!!action} onClick={() => void portal('billing')}>{action === 'billing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4"/>}Payment methods & invoices<ExternalLink className="ml-2 h-3.5 w-3.5"/></Button>}
                            {canChangePlan && !current.scheduledInterval && !current.cancelAtPeriodEnd && <Button variant="outline" disabled={!!action} onClick={() => void portal('switch_plan')}>{action === 'switch_plan' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Change plan<ArrowRight className="ml-2 h-4 w-4"/></Button>}
                            {current.canResume && current.cancelAtPeriodEnd && <Button className="bg-violet-600 text-white hover:bg-violet-700" disabled={!!action} onClick={() => void mutate('resume', resumeProSubscription, 'Your subscription will renew again.')}>{action === 'resume' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Reactivate subscription</Button>}
                            {(!liveSubscription || current.checkoutPending) && !unavailableYearlyCheckout && onExplore && <Button className="bg-violet-600 text-white hover:bg-violet-700" disabled={!!action || (current.checkoutPending && !current.canContinueCheckout)} onClick={onExplore}>{current.checkoutPending ? 'Continue checkout' : 'Explore allchat Pro'}</Button>}
                        </div>
                        {canChangePlan && !current.cancelAtPeriodEnd && <p className="text-xs leading-5 text-muted-foreground">Moving to yearly credits your unused monthly time. Moving to monthly takes effect at your next renewal. Review all charges in Stripe before confirming.</p>}
                        {liveSubscription && !current.cancelAtPeriodEnd && <div className="border-t pt-4"><Button variant="ghost" className="text-destructive hover:text-destructive" disabled={!!action} onClick={() => setConfirmCancel(true)}>Cancel subscription</Button><p className="mt-1 text-xs leading-5 text-muted-foreground">Cancel renewal anytime. Your already-paid Pro access stays available through its end date.</p></div>}
                    </div>
                </section>
                {!current.billingAvailable && <p className="text-xs leading-5 text-muted-foreground">New Pro purchases are currently unavailable. Existing subscriptions can still be managed here.</p>}
            </>}

            <AlertDialog open={confirmCancel} onOpenChange={value => {if (!action) setConfirmCancel(value);}}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
                    <AlertDialogHeader><AlertDialogTitle>Cancel allchat Pro?</AlertDialogTitle><AlertDialogDescription>Your subscription will not renew. {current?.proActive ? `You will keep your Pro benefits until ${dateLabel(current.paidThrough)}.` : 'You do not currently have paid Pro access.'}{current?.scheduledInterval ? ' Your scheduled plan change will also be removed.' : ''} When Pro access ends, Basic limits apply, fonts return to Default, and sending new Pro stickers, emojis, and reactions requires resubscribing. {roomExpiryDescription}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel disabled={!!action}>Keep Pro</AlertDialogCancel><Button variant="destructive" disabled={!!action} onClick={() => void mutate('cancel', cancelProSubscription, 'Your subscription will not renew.')}>{action === 'cancel' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Cancel subscription</Button></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
