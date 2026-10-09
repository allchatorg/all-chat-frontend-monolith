'use client';

import {useEffect, useRef} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {useVipDialog} from './useVipDialog';
import {getVipBillingReturn} from './billingReturn';

/** Runs inside the authenticated chat shell, without replacing the chat. */
export function VipReturnModal() {
    const user = useSelector(selectUser);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const billingReturn = getVipBillingReturn(searchParams);
    const openVip = useVipDialog({initialView: 'subscriptions', billingReturn: billingReturn ?? undefined});
    const handled = useRef<string | null>(null);
    const query = searchParams.toString();

    useEffect(() => {
        if (!billingReturn) {
            handled.current = null;
            return;
        }
        if (!user || handled.current === query) return;
        handled.current = query;
        openVip();
        // The modal retains the result after cleaning the URL, so polling and
        // the canceled-checkout notice survive navigation and later re-renders.
        const params = new URLSearchParams(query);
        params.delete('vip');
        params.delete('checkout');
        params.delete('billing');
        router.replace(`${pathname}${params.size ? `?${params}` : ''}${window.location.hash}`, {scroll: false});
    }, [billingReturn, user, query, openVip, pathname, router]);

    return null;
}
