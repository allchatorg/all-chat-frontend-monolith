'use client';

import {useState} from 'react';
import {useStripeInteraction} from '@/components/billing/stripe';
import {useRouter} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {useDialog} from '@/components/providers/DialogProvider';
import {Button} from '@/components/ui/button';
import {SettingsComponent} from '@/features/auth/components/SettingsComponent';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {ROUTES} from '@/routes';
import {isStaff} from '@/models/Role';
import {ProOffer} from './ProOffer';
import {SubscriptionsSettings} from './SubscriptionsSettings';
import type {ProBillingReturnState} from './billingReturn';

export type ProDialogOptions = {initialView?: 'offer' | 'subscriptions'; billingReturn?: ProBillingReturnState; onBack?: () => void};

export function ProDialog({initialView = 'offer', billingReturn, onBack}: ProDialogOptions) {
    const {busy: stripeBusy} = useStripeInteraction();
    const [selectedView, setView] = useState<'offer' | 'subscriptions' | 'claim'>(initialView);
    const user = useSelector(selectUser);
    const staff = user ? isStaff(user.role) : false;
    const view = staff ? 'subscriptions' : selectedView;
    const {close} = useDialog();
    const router = useRouter();
    return <div className="h-full min-h-0 overflow-y-auto bg-background">
        {onBack && <div className="px-4 pt-3"><Button variant="ghost" className="min-h-11" disabled={stripeBusy} onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back to room search</Button></div>}
        {view !== 'offer' && !user?.banned && !staff && <div className="px-4 pb-1 pt-3"><Button variant="ghost" onClick={() => setView('offer')}><ArrowLeft className="mr-2 h-4 w-4"/>allchat VIP</Button></div>}
        {view === 'offer' && <ProOffer onManage={() => setView('subscriptions')} onClaim={() => {
            if (!user || user.role === 'GUEST') {
                close();
                router.push(`${ROUTES.REGISTER}&redirect=${encodeURIComponent(ROUTES.SUBSCRIPTIONS)}`);
            } else setView('claim');
        }}/>}
        {view === 'subscriptions' && <SubscriptionsSettings billingReturn={billingReturn} onExplore={user?.banned || staff ? undefined : () => setView('offer')}/>}
        {view === 'claim' && <SettingsComponent defaultTab="account"/>}
    </div>;
}
