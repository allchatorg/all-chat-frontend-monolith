'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {useDialog} from '@/components/providers/DialogProvider';
import {Button} from '@/components/ui/button';
import {SettingsComponent} from '@/features/auth/components/SettingsComponent';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {ROUTES} from '@/routes';
import {ProOffer} from './ProOffer';
import {SubscriptionsSettings} from './SubscriptionsSettings';

export function ProDialog() {
    const [view, setView] = useState<'offer' | 'subscriptions' | 'claim'>('offer');
    const user = useSelector(selectUser);
    const {close} = useDialog();
    const router = useRouter();
    return <div className="h-full min-h-0 overflow-y-auto bg-background">
        {view !== 'offer' && <div className="px-4 pb-1 pt-3"><Button variant="ghost" onClick={() => setView('offer')}><ArrowLeft className="mr-2 h-4 w-4"/>allchat Pro</Button></div>}
        {view === 'offer' && <ProOffer onManage={() => setView('subscriptions')} onClaim={() => {
            if (!user || user.role === 'GUEST') {
                close();
                router.push(`${ROUTES.REGISTER}&redirect=${encodeURIComponent(ROUTES.SUBSCRIPTIONS)}`);
            } else setView('claim');
        }}/>}
        {view === 'subscriptions' && <SubscriptionsSettings onExplore={() => setView('offer')}/>}
        {view === 'claim' && <SettingsComponent defaultTab="account"/>}
    </div>;
}
