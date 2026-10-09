'use client';

import {useEffect, useId, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {ArrowDown, ArrowRight, Diamond, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {selectUser} from '@/redux/user/userSelectors';
import {cn} from '@/lib/utils';
import {VipInterval} from './types';
import {vipErrorMessage, startVipCheckout} from './api';
import {VipCheckout} from './VipCheckout';
import {getStripe} from '@/components/billing/stripe';
import {useVipSubscription} from './useVipSubscription';
import {VipBenefits, VipComparison} from './VipBenefits';
import {isStaff} from '@/models/Role';
import {SubscriptionsSettings} from './SubscriptionsSettings';

function BannerSparkle({className}: {className: string}) {
    return <svg aria-hidden="true" viewBox="0 0 24 40" fill="currentColor" className={cn('pointer-events-none absolute text-white', className)}><path d="M12 0C10 14 8 17 0 20c8 3 10 6 12 20 2-14 4-17 12-20-8-3-10-6-12-20Z"/></svg>;
}

export function VipOffer({onManage, onClaim}: {onManage: () => void; onClaim: () => void}) {
    const user = useSelector(selectUser);
    if (user && isStaff(user.role)) return <SubscriptionsSettings/>;
    return <PaidVipOffer onManage={onManage} onClaim={onClaim}/>;
}

function PaidVipOffer({onManage, onClaim}: {onManage: () => void; onClaim: () => void}) {
    const user = useSelector(selectUser);
    const {subscription, loading, error, refresh} = useVipSubscription();
    const [interval, setInterval] = useState<VipInterval>('MONTHLY');
    const intervalSelected = useRef(false);
    const plansRef = useRef<HTMLElement>(null);
    const plansHeadingId = useId();
    const intervalName = useId();
    const [redirecting, setRedirecting] = useState(false);
    const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    // The server owns the flag. Missing configuration (or an older API) stays monthly-only.
    const yearlyBillingEnabled = subscription?.yearlyBillingEnabled === true;
    const mustClaim = !user?.claimed || user.role === 'GUEST';
    const unavailableYearlyCheckout = Boolean(subscription?.checkoutPending && subscription.checkoutInterval === 'YEARLY' && !yearlyBillingEnabled);
    const canContinueCheckout = subscription?.canContinueCheckout === true && !unavailableYearlyCheckout;
    const lockedCheckoutInterval = subscription?.checkoutPending && subscription.status === 'INCOMPLETE' && !unavailableYearlyCheckout
        ? subscription.checkoutInterval : null;
    const selectedInterval = lockedCheckoutInterval ?? (yearlyBillingEnabled ? interval : 'MONTHLY');
    const managesExisting = Boolean(subscription && subscription.canManageBilling && (subscription.status === 'INCOMPLETE' || (!canContinueCheckout && !subscription.canPurchase && subscription.status !== 'NONE')));
    const availableIntervals: VipInterval[] = yearlyBillingEnabled ? ['MONTHLY', 'YEARLY'] : ['MONTHLY'];
    const actionDisabled = redirecting || (!mustClaim && !managesExisting && (loading || !!error || unavailableYearlyCheckout || (!subscription?.canPurchase && !canContinueCheckout)));
    const actionLabel = mustClaim ? 'Claim your account to get VIP' : managesExisting ? subscription?.status === 'INCOMPLETE' ? 'Complete subscription payment' : 'Manage your subscription' : unavailableYearlyCheckout ? 'Checkout being confirmed' : canContinueCheckout ? 'Continue checkout' : 'Get allchat VIP';

    useEffect(() => {
        if (intervalSelected.current || !subscription?.checkoutPending || !subscription.checkoutInterval) return;
        if (subscription.checkoutInterval === 'YEARLY' && !yearlyBillingEnabled) return;
        intervalSelected.current = true;
        setInterval(subscription.checkoutInterval);
    }, [subscription?.checkoutPending, subscription?.checkoutInterval, yearlyBillingEnabled]);

    const subscribe = async () => {
        if (mustClaim) return onClaim();
        if (managesExisting) return onManage();
        if (actionDisabled) return;
        setRedirecting(true);
        try {
            if (!getStripe()) throw new Error('Payments are temporarily unavailable.');
            const {clientSecret} = await startVipCheckout(selectedInterval);
            setCheckoutSecret(clientSecret);
        } catch (failure) {
            toast.error(vipErrorMessage(failure));
            void refresh();
        } finally {
            setRedirecting(false);
        }
    };

    const comparePlans = () => {
        plansRef.current?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
        plansRef.current?.focus({preventScroll: true});
    };

    if (checkoutComplete) return <SubscriptionsSettings billingReturn={{checkout: 'success', billingUpdated: false}}/>;
    if (checkoutSecret) return <VipCheckout clientSecret={checkoutSecret} onComplete={() => setCheckoutComplete(true)} onBack={() => {setCheckoutSecret(null); void refresh(true);}}/>;

    return (
        <div className="bg-background text-foreground">
            <div className="p-3 pb-0 sm:p-4 sm:pb-0">
                <section className="relative isolate overflow-hidden rounded-2xl bg-[#1749b5] px-6 py-12 text-center text-white sm:px-12 sm:py-14">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_100%,#38bdf8_0%,transparent_45%),radial-gradient(ellipse_at_45%_120%,#2563eb_0%,transparent_65%)]"/>
                    <BannerSparkle className="left-[11%] top-9 h-8 w-5 -rotate-6 opacity-95"/>
                    <BannerSparkle className="left-[5%] top-24 h-5 w-3 opacity-90"/>
                    <BannerSparkle className="bottom-20 right-[12%] h-8 w-5 opacity-95"/>
                    <BannerSparkle className="bottom-9 right-[6%] h-5 w-3 opacity-90"/>
                    <div className="relative mx-auto max-w-xl">
                        <p className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.2em]"><Diamond className="h-4 w-4"/>allchat VIP</p>
                        <h1 className="text-balance text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.75rem]">More to share.<br/>More room to connect.</h1>
                        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/90">Bigger uploads, longer messages, more chatrooms, VIP-only chatrooms, no ads, custom fonts, exclusive stickers and emojis, and your own VIP badge.</p>
                        <p className="mt-2 text-sm font-medium text-white sm:text-base">{selectedInterval === 'YEARLY' ? '$50/year' : 'Just $5/month'}. Cancel anytime.</p>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Button onClick={() => void subscribe()} disabled={actionDisabled} className="h-11 max-w-full whitespace-normal rounded-lg bg-white px-5 font-bold text-blue-600 shadow-none hover:bg-blue-50">
                                {redirecting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Diamond className="h-4 w-4"/>}{actionLabel}
                            </Button>
                            <Button variant="outline" onClick={comparePlans} className="h-11 rounded-lg border-white/65 bg-transparent px-5 font-semibold text-white shadow-none hover:bg-white/10 hover:text-white"><ArrowDown className="h-4 w-4"/>Compare plans</Button>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-10 px-5 py-9 sm:px-8 sm:py-10">
                <VipBenefits username={user?.username || 'Your username'}/>

                <section ref={plansRef} tabIndex={-1} aria-labelledby={plansHeadingId} className="scroll-mt-6 space-y-6 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4">
                    <div className="text-center">
                        <h2 id={plansHeadingId} className="text-2xl font-extrabold tracking-tight">Find your kind of allchat.</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with Basic. Choose VIP for more space to share and connect.</p>
                    </div>
                    <VipComparison yearly={selectedInterval === 'YEARLY'}/>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-500/30 dark:bg-blue-500/5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div><h3 className="flex items-center gap-2 text-lg font-bold"><Diamond className="h-5 w-5 text-blue-500"/>Make it VIP.</h3><p className="mt-1 text-sm text-muted-foreground">Everything in Basic, plus higher limits, VIP-only chatrooms, no ads, username and message fonts, exclusive stickers, custom emojis and reactions, and your own VIP badge.</p></div>
                            {!yearlyBillingEnabled && <p className="text-3xl font-extrabold">$5<span className="text-sm font-normal text-muted-foreground"> / month</span></p>}
                        </div>
                        {yearlyBillingEnabled && <fieldset className="mt-5">
                            <legend className="mb-3 text-sm font-semibold">Choose your billing</legend>
                            <div className="grid grid-cols-2 gap-3">
                                {availableIntervals.map(option => (
                                    <label key={option} className={cn('relative cursor-pointer rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2', selectedInterval === option ? 'border-blue-500 bg-background' : 'border-border bg-card hover:border-blue-300', lockedCheckoutInterval && option !== lockedCheckoutInterval && 'cursor-not-allowed opacity-50')}>
                                        <input className="sr-only" type="radio" name={intervalName} value={option} checked={selectedInterval === option} disabled={redirecting || Boolean(lockedCheckoutInterval && option !== lockedCheckoutInterval)} onChange={() => {intervalSelected.current = true; setInterval(option);}}/>
                                        <span className="block text-sm font-semibold">{option === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span>
                                        <span className="mt-2 block text-2xl font-bold">${option === 'MONTHLY' ? '5' : '50'}<span className="text-sm font-normal text-muted-foreground">/{option === 'MONTHLY' ? 'mo' : 'yr'}</span></span>
                                        <span className={cn('mt-2 block text-xs font-medium', option === 'YEARLY' ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground')}>{option === 'YEARLY' ? 'Save $10/year' : 'Billed monthly'}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>}
                        {lockedCheckoutInterval && <p className="mt-4 text-xs leading-5 text-muted-foreground">Complete your unpaid {lockedCheckoutInterval === 'YEARLY' ? 'yearly' : 'monthly'} invoice in Subscriptions to try another payment method.{yearlyBillingEnabled && ' To choose a different plan, cancel this unfinished subscription in Settings first.'}</p>}
                        {unavailableYearlyCheckout && <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{subscription?.status === 'INCOMPLETE' ? 'Your previous checkout is no longer available. Cancel your unfinished subscription in Settings before starting a new plan.' : 'Your previous checkout is still being confirmed. Please wait for it to finish or expire, then refresh your subscription.'} <button className="font-medium underline" onClick={() => void refresh(true)}>Refresh status</button></p>}
                        <Button onClick={() => void subscribe()} disabled={actionDisabled} className="mt-5 h-12 w-full whitespace-normal rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                            {redirecting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Diamond className="h-4 w-4"/>}
                            {actionLabel}
                            {!redirecting && <ArrowRight className="ml-auto h-4 w-4"/>}
                        </Button>
                        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">{selectedInterval === 'YEARLY' ? '$50 USD charged annually.' : '$5 USD charged monthly.'} Renews automatically. Cancel anytime in Settings.</p>
                        {error && <p role="alert" className="mt-3 text-sm text-destructive dark:text-red-300">Unable to load billing. <button className="underline" onClick={() => void refresh()}>Try again</button></p>}
                        {!error && !loading && subscription && !subscription.billingAvailable && <p role="status" className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">VIP purchases are not available yet. Please check back soon.</p>}
                        {!error && !loading && subscription?.billingAvailable && !subscription.canPurchase && !canContinueCheckout && !managesExisting && !mustClaim && !unavailableYearlyCheckout && <p className="mt-3 text-sm text-muted-foreground">Purchasing is unavailable for your account. Complete any required account verification before subscribing.</p>}
                    </div>
                </section>
                <p className="text-center text-xs leading-5 text-muted-foreground">More space for your conversations, with allchat VIP.</p>
            </div>
        </div>
    );
}
