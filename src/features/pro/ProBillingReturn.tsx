'use client';

import {useEffect, useRef} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {useSelector} from 'react-redux';
import {Diamond} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {selectUser} from '@/redux/user/userSelectors';
import {ROUTES} from '@/routes';
import {useProDialog} from './useProDialog';
import {getProBillingReturn, proChatReturnUrl} from './billingReturn';
import {selectIpDetails} from '@/redux/auth/authSelectors';
import {isChatRestricted} from '@/lib/accountVerification';

/** Bridges previously issued return URLs into chat; restricted accounts retain billing access. */
export function ProBillingReturn() {
    const user = useSelector(selectUser);
    const ipDetails = useSelector(selectIpDetails);
    const searchParams = useSearchParams();
    const router = useRouter();
    const restricted = isChatRestricted(user, ipDetails?.requiredVerification);
    const openPro = useProDialog({initialView: 'subscriptions', billingReturn: getProBillingReturn(searchParams) ?? undefined});
    const opened = useRef(false);

    useEffect(() => {
        if (!user || opened.current) return;
        opened.current = true;
        if (restricted) openPro();
        else router.replace(proChatReturnUrl(searchParams), {scroll: false});
    }, [user, restricted, openPro, router, searchParams]);

    if (!restricted) return <div role="status" className="p-8">Returning to chat…</div>;

    return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-sm space-y-5 text-center">
            <Diamond aria-hidden="true" className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400"/>
            <h1 className="text-2xl font-bold">allchat VIP</h1>
            <p className="text-sm leading-6 text-muted-foreground">View your subscription status, benefits, and billing in the allchat VIP window.</p>
            <Button disabled={!user} onClick={openPro} className="bg-blue-600 text-white hover:bg-blue-700">View subscription</Button>
            <Link href={user?.banned ? ROUTES.BANNED : ROUTES.HOME} className="block text-sm text-muted-foreground underline underline-offset-4">{user?.banned ? 'Back to account status' : 'Back to allchat'}</Link>
        </div>
    </main>;
}
