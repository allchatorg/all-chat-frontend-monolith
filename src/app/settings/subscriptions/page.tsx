'use client';

import {Suspense, useState} from 'react';
import Link from 'next/link';
import {useSelector} from 'react-redux';
import {ArrowLeft, Diamond} from 'lucide-react';
import {selectUser} from '@/redux/user/userSelectors';
import {Button} from '@/components/ui/button';
import {SubscriptionsSettings} from '@/features/pro/SubscriptionsSettings';
import {ProOffer} from '@/features/pro/ProOffer';
import {ROUTES} from '@/routes';
import {useRouter} from 'next/navigation';
import {ClaimUser} from '@/features/auth/components/ClaimUser';
import {useThunk} from '@/lib/hooks/useThunk';
import {claimAccountThunk} from '@/redux/auth/authThunk';
import {toast} from 'sonner';

function SubscriptionPageContent() {
    const user = useSelector(selectUser);
    const [exploring, setExploring] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [claimAccount, claimLoading] = useThunk(claimAccountThunk);
    const router = useRouter();
    return <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:p-8">
        <div className="mx-auto max-w-4xl">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href={user?.banned ? ROUTES.BANNED : ROUTES.HOME} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4"/>{user?.banned ? 'Back to account status' : 'Back to allchat'}</Link><span className="flex items-center gap-2 text-sm font-bold"><Diamond className="h-4 w-4 text-violet-500"/>allchat Pro</span></header>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                {claiming ? <div className="space-y-4 p-4"><Button variant="ghost" onClick={() => setClaiming(false)}><ArrowLeft className="mr-2 h-4 w-4"/>allchat Pro</Button><ClaimUser claimed={user?.claimed} loading={claimLoading} onClaim={async (email, password) => {
                    try {await claimAccount({email, password}); setClaiming(false);}
                    catch {toast.error('Could not claim your account. Please try again.');}
                }}/></div> : exploring ? <><div className="p-3"><Button variant="ghost" onClick={() => setExploring(false)}><ArrowLeft className="mr-2 h-4 w-4"/>Subscriptions</Button></div><ProOffer onManage={() => setExploring(false)} onClaim={() => {
                    if (user && user.role !== 'GUEST') setClaiming(true);
                    else router.push(`${ROUTES.REGISTER}&redirect=${encodeURIComponent(ROUTES.SUBSCRIPTIONS)}`);
                }}/></> : <SubscriptionsSettings onExplore={user?.banned ? undefined : () => setExploring(true)}/>}
            </div>
        </div>
    </main>;
}

export default function SubscriptionPage() {
    return <Suspense fallback={<div role="status" className="p-8">Loading subscriptions…</div>}><SubscriptionPageContent/></Suspense>;
}
