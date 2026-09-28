'use client';

import {useEffect, useRef} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {useProDialog} from './useProDialog';
import {getProBillingReturn} from './billingReturn';

/** Runs inside the authenticated chat shell, without replacing the chat. */
export function ProReturnModal() {
    const user = useSelector(selectUser);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const billingReturn = getProBillingReturn(searchParams);
    const openPro = useProDialog({initialView: 'subscriptions', billingReturn: billingReturn ?? undefined});
    const handled = useRef<string | null>(null);
    const query = searchParams.toString();

    useEffect(() => {
        if (!billingReturn) {
            handled.current = null;
            return;
        }
        if (!user || handled.current === query) return;
        handled.current = query;
        openPro();
        // The modal retains the result after cleaning the URL, so polling and
        // the canceled-checkout notice survive navigation and later re-renders.
        const params = new URLSearchParams(query);
        params.delete('pro');
        params.delete('checkout');
        params.delete('billing');
        router.replace(`${pathname}${params.size ? `?${params}` : ''}${window.location.hash}`, {scroll: false});
    }, [billingReturn, user, query, openPro, pathname, router]);

    return null;
}
